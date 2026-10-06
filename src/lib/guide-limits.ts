// Free-guide abuse limits, kept in the LEAD_DB D1 database (wrangler.toml;
// schema in migrations/). Turnstile proves a human solved a challenge, not that they
// own the address, so without these anyone could flood a stranger's inbox with
// Dodie's guide email. Each check is ONE SQLite upsert statement, so concurrent
// requests can't both win a claim or lose a count (KV could do neither).
//
// Tested against real SQLite in test/guide-limits.test.ts.

/** The slice of Cloudflare's D1Database these functions use. */
export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
}

// Per form, per IP, per hour. Generous on purpose: phones on a mobile carrier often
// share one IP, and ad traffic is mostly mobile.
export const IP_MAX_PER_HOUR = 10;
const HOUR_S = 60 * 60;
const DAY_MS = 24 * HOUR_S * 1000;

const normal = (email: string) => email.trim().toLowerCase();

/** Counts this submission against the IP's hourly cap for `scope` (one counter per
 *  form); false once it is exceeded. */
export async function allowIp(db: D1Like, ip: string, now = Date.now(), scope = 'guide'): Promise<boolean> {
  const bucket = Math.floor(now / 1000 / HOUR_S);
  const row = await db
    .prepare(
      `INSERT INTO ip_hits (ip, bucket, n) VALUES (?1, ?2, 1)
       ON CONFLICT (ip, bucket) DO UPDATE SET n = n + 1
       RETURNING n`
    )
    .bind(`${scope}:${ip}`, bucket)
    .first<{ n: number }>();
  const allowed = (row?.n ?? 0) <= IP_MAX_PER_HOUR;
  // Housekeeping only: decided above, so a failed cleanup can't flip a denial.
  await db.prepare('DELETE FROM ip_hits WHERE bucket < ?1').bind(bucket - 1).run().catch(() => {});
  return allowed;
}

/**
 * Atomically claims today's guide email for this address. Returns the claim
 * (pass it to releaseGuideEmail) or null if it was already emailed in the last 24h.
 */
export async function claimGuideEmail(db: D1Like, email: string, now = Date.now()): Promise<number | null> {
  // Housekeeping only; the claim below is correct with or without it.
  await db.prepare('DELETE FROM guide_sends WHERE sent_at <= ?1').bind(now - DAY_MS).run().catch(() => {});
  const row = await db
    .prepare(
      `INSERT INTO guide_sends (email, sent_at) VALUES (?1, ?2)
       ON CONFLICT (email) DO UPDATE SET sent_at = excluded.sent_at
       WHERE guide_sends.sent_at <= ?3
       RETURNING sent_at`
    )
    .bind(normal(email), now, now - DAY_MS)
    .first<{ sent_at: number }>();
  return row ? now : null;
}

/**
 * Undo OUR claim after a send that definitely failed, so a same-day retry can send.
 * Matching on sent_at means it can never delete a claim another request made.
 */
export async function releaseGuideEmail(db: D1Like, email: string, claim: number): Promise<void> {
  await db.prepare('DELETE FROM guide_sends WHERE email = ?1 AND sent_at = ?2').bind(normal(email), claim).run();
}

export type VisitorStatus = 'ok' | 'over' | 'unknown';

/**
 * Per-visitor cap for a public form. Callers ALWAYS capture the lead; this only
 * decides whether to also send emails, texts and workflows:
 *   'ok'      within the cap: send as normal
 *   'over'    over the cap for this form: capture, but send nothing
 *   'unknown' no IP or the limiter's storage failed: capture, send nothing that
 *             costs money or could be abused (GHL's own new-contact alert still runs)
 */
export async function visitorStatus(
  env: { LEAD_DB?: unknown },
  request: Request,
  scope: string
): Promise<VisitorStatus> {
  const db = env.LEAD_DB as D1Like | undefined;
  const ip = request.headers.get('CF-Connecting-IP');
  if (!db || !ip) return 'unknown';
  try {
    return (await allowIp(db, ip, Date.now(), scope)) ? 'ok' : 'over';
  } catch (err) {
    console.error('[limits] IP check failed', err);
    return 'unknown';
  }
}

/**
 * Idempotency for form submissions: true the first time an id is seen (within a
 * day), false for a repeat. A repeat means the visitor's earlier request already
 * did the work (e.g. the response was lost), so the caller returns success without
 * capturing or notifying again.
 */
export async function claimSubmission(db: D1Like, id: string, now = Date.now()): Promise<boolean> {
  await db.prepare('DELETE FROM form_submissions WHERE at <= ?1').bind(now - DAY_MS).run().catch(() => {});
  const row = await db
    .prepare('INSERT INTO form_submissions (id, at) VALUES (?1, ?2) ON CONFLICT (id) DO NOTHING RETURNING id')
    .bind(id, now)
    .first<{ id: string }>();
  return row !== null;
}
