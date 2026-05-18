// GHL API client. Server-side only — never bundled to the client.
// See GHL-INTEGRATION.md for endpoint and field mapping reference.

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

export interface ContactPayload {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  source: string;
  customField?: Record<string, string | boolean>;
}

export class GhlError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'GhlError';
  }
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Version: GHL_API_VERSION,
  };
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof GhlError && err.status >= 500) {
      await new Promise((r) => setTimeout(r, 500));
      return await fn();
    }
    throw err;
  }
}

export async function upsertContact(payload: ContactPayload, env: {
  GHL_PRIVATE_INTEGRATION_TOKEN: string;
  GHL_LOCATION_ID: string;
}): Promise<{ id: string }> {
  return withRetry(async () => {
    const res = await fetch(`${GHL_BASE}/contacts/`, {
      method: 'POST',
      headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
      body: JSON.stringify({ locationId: env.GHL_LOCATION_ID, ...payload }),
    });
    if (!res.ok) {
      throw new GhlError(res.status, `upsertContact failed: ${await res.text()}`);
    }
    const json = (await res.json()) as { contact?: { id: string } };
    if (!json.contact?.id) throw new GhlError(500, 'upsertContact: no id returned');
    return { id: json.contact.id };
  });
}

export async function applyTag(
  contactId: string,
  tag: string,
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  await withRetry(async () => {
    const res = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
      body: JSON.stringify({ tags: [tag] }),
    });
    if (!res.ok) {
      throw new GhlError(res.status, `applyTag failed: ${await res.text()}`);
    }
  });
}

export async function triggerWorkflow(
  contactId: string,
  workflowId: string,
  env: { GHL_PRIVATE_INTEGRATION_TOKEN: string }
): Promise<void> {
  await withRetry(async () => {
    const res = await fetch(
      `${GHL_BASE}/contacts/${contactId}/workflow/${workflowId}`,
      {
        method: 'POST',
        headers: authHeaders(env.GHL_PRIVATE_INTEGRATION_TOKEN),
      }
    );
    if (!res.ok) {
      throw new GhlError(res.status, `triggerWorkflow failed: ${await res.text()}`);
    }
  });
}
