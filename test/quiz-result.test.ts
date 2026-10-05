// Run: npm run test:unit
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resultFor, GENERAL_RESULT, QUIZ_RESULTS, type QuizResult } from '../src/lib/quiz.ts';

const r = (id: string, match: Record<string, string>, approved: boolean): QuizResult => ({
  id, match, approved, heading: id, body: id,
});

test('unapproved drafts never show; the general result does', () => {
  assert.ok(QUIZ_RESULTS.length > 0);
  for (const draft of QUIZ_RESULTS) {
    assert.equal(resultFor({ ...draft.match }, QUIZ_RESULTS).id, draft.approved ? draft.id : 'general');
  }
  assert.equal(resultFor({}, []), GENERAL_RESULT);
});

test('first approved result whose every answer matches wins', () => {
  const results = [
    r('off', { draw: 'past-lives' }, false),
    r('both', { draw: 'past-lives', mindset: 'have-questions' }, true),
    r('draw', { draw: 'past-lives' }, true),
  ];
  assert.equal(resultFor({ draw: 'past-lives', mindset: 'have-questions' }, results).id, 'both');
  assert.equal(resultFor({ draw: 'past-lives', mindset: 'ready-open' }, results).id, 'draw');
  assert.equal(resultFor({ draw: 'release' }, results).id, 'general');
});
