// Transactional email helpers. Currently used only as a fallback when GHL is unavailable.
// See ADR-003 for the rationale and provider selection (Resend).

export class NotifyError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'NotifyError';
  }
}

interface FallbackEmailInput {
  /** Short summary used for the subject line. */
  formName: string;
  /** Validated payload, already redacted of honeypot/internal fields. */
  payload: Record<string, unknown>;
  /** Optional context lines added above the payload dump. */
  context?: string[];
}

interface NotifyEnv {
  RESEND_API_KEY: string;
  FALLBACK_EMAIL_TO?: string;
  FALLBACK_EMAIL_FROM?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPayload(payload: Record<string, unknown>): { html: string; text: string } {
  const entries = Object.entries(payload);
  const rows = entries
    .map(([k, v]) => {
      const value = typeof v === 'string' ? v : JSON.stringify(v);
      return `<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:6px 0;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`;
    })
    .join('');
  const html = `<table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse;">${rows}</table>`;
  const text = entries.map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('\n');
  return { html, text };
}

/**
 * Send a fallback email via Resend when the primary CRM path (GHL) fails.
 * Returns true on success, false on failure. Never throws — the caller has already
 * accepted the lead and we must not regress to a 5xx just because the fallback also failed.
 */
export async function sendFallbackEmail(input: FallbackEmailInput, env: NotifyEnv): Promise<boolean> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[notify] RESEND_API_KEY not configured — fallback email skipped');
    return false;
  }

  const to = env.FALLBACK_EMAIL_TO || 'dodiekendall@gmail.com';
  const from = env.FALLBACK_EMAIL_FROM || 'no-reply@dodiekendall.com';
  const subject = `[FALLBACK – CRM unavailable] ${input.formName}`;
  const { html, text } = renderPayload(input.payload);
  const contextHtml = (input.context ?? []).map((c) => `<p>${escapeHtml(c)}</p>`).join('');
  const contextText = (input.context ?? []).join('\n');

  const body = {
    from,
    to: [to],
    subject,
    html: `<div style="font-family:system-ui,sans-serif;max-width:560px;">
      <p>The GHL CRM was unreachable when this submission came in. The lead has been preserved here so it can be added manually once GHL is healthy.</p>
      ${contextHtml}
      ${html}
    </div>`,
    text: `The GHL CRM was unreachable when this submission came in. The lead has been preserved here so it can be added manually once GHL is healthy.\n\n${contextText}\n\n${text}`,
  };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[notify] Resend returned ${res.status}: ${await res.text().catch(() => '')}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[notify] Resend request failed', err);
    return false;
  }
}
