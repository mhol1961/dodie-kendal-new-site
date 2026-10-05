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

export const IP_MAX_PER_HOUR = 5;
const HOUR_S = 60 * 60;
const DAY_MS = 24 * HOUR_S * 1000;

const normal = (email: string) => email.trim().toLowerCase();

/** Counts this sign-up against the IP's hourly cap; false once it is exceeded. */
export async function allowIp(db: D1Like, ip: string, now = Date.now()): Promise<boolean> {
  const bucket = Math.floor(now / 1000 / HOUR_S);
  const row = await db
    .prepare(
      `INSERT INTO ip_hits (ip, bucket, n) VALUES (?1, ?2, 1)
       ON CONFLICT (ip, bucket) DO UPDATE SET n = n + 1
       RETURNING n`
    )
    .bind(ip, bucket)
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

/**
 * Per-visitor cap for any public form endpoint (5 per IP per hour, shared across
 * forms). Fails OPEN on a storage error or missing binding: Turnstile still guards,
 * and a lead must never be lost to a database hiccup.
 */
export async function visitorAllowed(
  env: { LEAD_DB?: unknown },
  request: Request
): Promise<boolean> {
  const db = env.LEAD_DB as D1Like | undefined;
  const ip = request.headers.get('CF-Connecting-IP');
  if (!db || !ip) return true;
  try {
    return await allowIp(db, ip);
  } catch (err) {
    console.error('[limits] IP check failed, allowing', err);
    return true;
  }
}
