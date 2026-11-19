import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRecord, guard, BAD_REQUEST } from '../src/lib/api-guard.ts';

test('only a plain object counts as a form submission', () => {
  for (const bad of [null, undefined, [], [1], 'x', 7, true]) assert.equal(isRecord(bad), false);
  assert.equal(isRecord({}), true);
  assert.equal(isRecord({ website: '' }), true);
  // JSON.parse('null') is what used to crash the form endpoints.
  assert.equal(isRecord(JSON.parse('null')), false);
  assert.equal(BAD_REQUEST.error, 'Bad request');
});

test('guard turns an unexpected error into a clean 500 and passes normal replies through', async () => {
  const ok = await guard('t', async () => new Response('fine', { status: 201 }))();
  assert.equal(ok.status, 201);
  assert.equal(await ok.text(), 'fine');

  const err = console.error;
  console.error = () => {};
  try {
    const boom = await guard('t', async () => { throw new Error('secret detail'); })();
    assert.equal(boom.status, 500);
    const body = await boom.text();
    assert.equal(JSON.parse(body).error, 'Server error');
    assert.ok(!body.includes('secret detail'), 'error detail must not reach the caller');
    const sync = await guard('t', () => { throw new TypeError('x'); })();
    assert.equal(sync.status, 500);
  } finally {
    console.error = err;
  }
});
