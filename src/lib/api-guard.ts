// Shared safety for the form endpoints (/api/contact, /api/lead-magnet, /api/quiz).

/** A parsed body is only usable if it is a plain object: not null, an array, text or a number. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The reply for a request that is not a form submission at all. */
export const BAD_REQUEST = {
  error: 'Bad request',
  message: 'This request was not a valid form submission.',
};

const SERVER_ERROR = {
  error: 'Server error',
  message: 'Something went wrong on our side. Please try again.',
};

/** Last line of defence: an error nobody planned for becomes a clean reply, never a crash. */
export function guard<A extends unknown[]>(
  name: string,
  handler: (...args: A) => Response | Promise<Response>
): (...args: A) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error(`[${name}] unexpected error`, err);
      return new Response(JSON.stringify(SERVER_ERROR), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}
