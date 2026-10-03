// Double opt-in confirm links for the free-guide sign-up. The link carries the GHL
// contact id plus an HMAC of id + email, so only someone who received the email
// can confirm that address. Secret: OPTIN_SECRET (Worker secret). Tested in
// test/optin.test.ts.

const enc = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const message = (contactId: string, email: string) => `${contactId}.${email.trim().toLowerCase()}`;

export function optinToken(secret: string, contactId: string, email: string): Promise<string> {
  return hmacHex(secret, message(contactId, email));
}

export async function verifyOptinToken(
  secret: string | undefined,
  contactId: string,
  email: string,
  token: string
): Promise<boolean> {
  if (!secret || !contactId || !email || !/^[0-9a-f]{64}$/.test(token)) return false;
  const expected = await optinToken(secret, contactId, email);
  let diff = 0; // constant-time compare
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

export function confirmUrl(siteUrl: string, contactId: string, token: string): string {
  const u = new URL('/api/confirm-optin', siteUrl);
  u.searchParams.set('c', contactId);
  u.searchParams.set('t', token);
  return u.href;
}
