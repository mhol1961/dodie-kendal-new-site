// /book screening before the $50 deposit. Runs in the browser only: the answers are
// never sent or stored anywhere (no form, no fetch, no storage).
export type ScreeningState = 'wait' | 'open' | 'talk';

/** Any "yes" means talk first. The calendar opens only on all "no" plus the policy box. */
export function screeningState(answers: Array<string | undefined>, agreed: boolean): ScreeningState {
  if (answers.includes('yes')) return 'talk';
  return agreed && answers.every((a) => a === 'no') ? 'open' : 'wait';
}
