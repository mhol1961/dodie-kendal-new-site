// Browser behaviour for the free-guide forms (LeadMagnetGate + /free-guide).
import { readAttribution, trackLead } from './attribution-client.ts';
// `outcomeFor` is pure and unit-tested (test/lead-magnet-form.test.ts).

const GUIDE_LINK =
  ' <a href="/dodie-kendall-prep-guide.pdf" target="_blank" rel="noopener" class="font-semibold underline text-brand hover:text-brand-hover">Open your prep guide &rarr;</a>';

export type Outcome = 'emailed' | 'ready' | 'not-captured' | 'retry-check' | 'invalid-email' | 'rate-limited';

/** Maps the /api/lead-magnet response (status null = network failure) to what we tell the visitor. */
type Body = { captured?: boolean; emailed?: boolean; reason?: string } | null;

export function outcomeFor(status: number | null, body: Body): Outcome {
  if (status === 400) return 'retry-check';
  if (status === 422) return 'invalid-email';
  if (status === 429) return 'rate-limited';
  if (status === 200 && body?.captured) {
    // A repeat sign-up looks identical to a fresh send: the form can't reveal who signed up.
    return body.emailed === true || body.reason === 'recent' ? 'emailed' : 'ready';
  }
  // 202: GHL was down but the details reached Dodie by the fallback email.
  if (status === 202) return 'ready';
  // 5xx, malformed reply, network failure: nothing was saved. The guide is public,
  // so still hand it over, but say so honestly and keep the address for a retry.
  return 'not-captured';
}

const MESSAGES: Record<Outcome, { html: string; ok: boolean }> = {
  emailed: {
    ok: true,
    html: 'Beautiful, your guide is ready, and a copy is in your inbox or on its way (check spam too). If the email asks, tap Confirm so Dodie can keep in touch.' + GUIDE_LINK,
  },
  ready: { ok: true, html: 'Beautiful, your guide is ready.' + GUIDE_LINK },
  'not-captured': {
    ok: false,
    html: 'We couldn’t save your sign-up just now, so we can’t email you a copy. Here’s the guide anyway; please try again later to get it by email.' + GUIDE_LINK,
  },
  'retry-check': {
    ok: false,
    html: 'Please complete the security check above, then try again. If it won’t load (some browser add-ons block it), you can open the guide directly.' + GUIDE_LINK,
  },
  'invalid-email': { ok: false, html: 'Please check your email address.' },
  'rate-limited': {
    ok: false,
    html: 'Too many sign-ups from this connection. Please try again later, or open the guide directly.' + GUIDE_LINK,
  },
};

type Turnstile = { reset: (el: Element) => void };

export function wireLeadMagnetForm(form: HTMLFormElement | null): void {
  const status = form && document.getElementById(form.dataset.status ?? '');
  if (!form || !status) return;
  const email = form.querySelector<HTMLInputElement>('[name="email"]')!;
  const trap = form.querySelector<HTMLInputElement>('[name="website"]');
  const widget = form.querySelector('.cf-turnstile');

  const show = (outcome: Outcome) => {
    status.innerHTML = MESSAGES[outcome].html;
    status.className = `mt-4 text-sm ${MESSAGES[outcome].ok ? 'text-success' : 'text-error'}`;
  };
  // Tokens are single-use: every completed attempt needs a fresh one.
  const resetCheck = () => {
    const ts = (window as { turnstile?: Turnstile }).turnstile;
    if (widget && ts) ts.reset(widget);
  };

  // Named in TurnstileWidget's data-error-callback: the check failed or was blocked.
  (window as unknown as Record<string, unknown>).onLeadMagnetTurnstileError = () => show('retry-check');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!email.value || !email.checkValidity()) {
      show('invalid-email');
      email.focus();
      return;
    }
    const token = form.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value;
    if (!token) {
      show('retry-check');
      return;
    }
    status.textContent = 'Sending…';
    status.className = 'mt-4 text-sm text-ink-muted';

    let res: Response | null = null;
    let body: Body = null;
    try {
      res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          consentMarketing: true,
          form: form.dataset.form,
          attribution: readAttribution(),
          website: trap?.value ?? '',
          'cf-turnstile-response': token,
        }),
      });
      body = await res.json().catch(() => null);
    } catch {
      /* network failure: outcomeFor(null) still hands over the guide */
    }
    const outcome = outcomeFor(res?.status ?? null, body);
    // Saved in GHL (200 captured, or 202 fallback): count it as a lead in Meta.
    if ((res?.status === 200 && body?.captured) || res?.status === 202) trackLead();
    show(outcome);
    if (MESSAGES[outcome].ok) form.reset();
    resetCheck();
  });
}
