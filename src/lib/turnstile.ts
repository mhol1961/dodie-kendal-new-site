// Cloudflare Turnstile server-side check (siteverify).
//
// The browser widget alone proves nothing: a bot can skip it and POST
// straight to the API. Only this call, made with the secret key, tells us
// whether the token is real, unused, and was minted on our own site.

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const SITEVERIFY_TIMEOUT_MS = 10_000;

/** Apex + www hostnames for a site URL, whichever of the two it names. */
export function allowedHostnames(siteUrl: string): string[] {
  const apex = new URL(siteUrl).hostname.replace(/^www\./, '');
  return [apex, `www.${apex}`];
}

interface VerifyOptions {
  /** TURNSTILE_SECRET_KEY, read from the Worker runtime env. */
  secret: string | undefined;
  /** The form's cf-turnstile-response field. */
  token: string | undefined;
  /** CF-Connecting-IP, passed to Cloudflare as an extra signal. */
  ip: string | null;
  /** Hostnames the token is allowed to come from. */
  hostnames: string[];
}

/** Returns true only for a valid token issued on one of `hostnames`.
 *  Fails closed: no secret, no token, a failed challenge, a token from
 *  another hostname, or any network/parse error or timeout all return false. */
export async function verifyTurnstile({ secret, token, ip, hostnames }: VerifyOptions): Promise<boolean> {
  if (!secret) {
    console.error('[turnstile] TURNSTILE_SECRET_KEY is not set');
    return false;
  }
  if (!token) return false;

  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    const outcome = (await res.json()) as {
      success?: boolean;
      hostname?: string;
      'error-codes'?: string[];
    };
    if (outcome.success !== true) {
      console.log('[turnstile] rejected', outcome['error-codes']);
      return false;
    }
    if (!outcome.hostname || !hostnames.includes(outcome.hostname)) {
      console.log('[turnstile] wrong hostname', outcome.hostname);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[turnstile] siteverify failed', err);
    return false;
  }
}
