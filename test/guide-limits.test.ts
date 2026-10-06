// Run: npm run test:unit
// Runs the real SQL against real SQLite (node:sqlite) with the real migration,
// so it exercises the same upsert semantics D1 uses in production.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import {
  allowIp,
  claimGuideEmail,
  releaseGuideEmail,
  IP_MAX_PER_HOUR,
  visitorStatus,
  claimSubmission,
  type D1Like,
} from '../src/lib/guide-limits.ts';

function d1(): D1Like {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync('migrations/0001_lead_limits.sql', 'utf8'));
  db.exec(readFileSync('migrations/0002_form_submissions.sql', 'utf8'));
  return {
    prepare(sql) {
      const stmt = db.prepare(sql);
      return {
        bind: (...v) => ({
          first: async () => (stmt.get(...(v as never[])) ?? null) as never,
          run: async () => stmt.run(...(v as never[])),
        }),
      };
    },
  };
}

const T0 = Date.UTC(2026, 9, 3, 12, 0, 0);
const DAY = 24 * 3600_000;

test('concurrent claims for one address: exactly one wins', async () => {
  const db = d1();
  const results = await Promise.all(Array.from({ length: 10 }, () => claimGuideEmail(db, 'a@b.co', T0)));
  assert.equal(results.filter((r) => r !== null).length, 1);
});

test('claim is case/space-insensitive and lasts 24h', async () => {
  const db = d1();
  assert.notEqual(await claimGuideEmail(db, 'A@B.co', T0), null);
  assert.equal(await claimGuideEmail(db, ' a@b.co ', T0 + DAY - 1), null);
  assert.notEqual(await claimGuideEmail(db, 'a@b.co', T0 + DAY), null, 'expired claim can be re-claimed');
  assert.notEqual(await claimGuideEmail(db, 'other@b.co', T0), null);
});

test('release frees only our own claim', async () => {
  const db = d1();
  const mine = await claimGuideEmail(db, 'a@b.co', T0);
  await releaseGuideEmail(db, 'a@b.co', 12345); // someone else's claim value: no effect
  assert.equal(await claimGuideEmail(db, 'a@b.co', T0 + 1), null);
  await releaseGuideEmail(db, 'a@b.co', mine!);
  assert.notEqual(await claimGuideEmail(db, 'a@b.co', T0 + 2), null);
});

test('IP cap: IP_MAX_PER_HOUR allowed, then blocked; other IPs and next hour unaffected', async () => {
  const db = d1();
  const hits = await Promise.all(Array.from({ length: IP_MAX_PER_HOUR + 3 }, () => allowIp(db, '1.2.3.4', T0)));
  assert.equal(hits.filter(Boolean).length, IP_MAX_PER_HOUR);
  assert.equal(await allowIp(db, '5.6.7.8', T0), true);
  assert.equal(await allowIp(db, '1.2.3.4', T0 + 3600_000), true);
});

test('a storage error surfaces as a rejection (the endpoint decides fail-open/closed)', async () => {
  const broken: D1Like = {
    prepare: () => ({ bind: () => ({ first: async () => { throw new Error('D1 down'); }, run: async () => { throw new Error('D1 down'); } }) }),
  };
  await assert.rejects(claimGuideEmail(broken, 'a@b.co'));
  await assert.rejects(allowIp(broken, '1.2.3.4'));
});

test('a failed cleanup after an over-limit count still denies (decision is made first)', async () => {
  let calls = 0;
  const staged: D1Like = {
    prepare: (sql) => ({
      bind: () => ({
        first: async () => ({ n: IP_MAX_PER_HOUR + 1 }) as never,
        run: async () => {
          calls++;
          if (sql.startsWith('DELETE')) throw new Error('cleanup failed');
        },
      }),
    }),
  };
  assert.equal(await allowIp(staged, '1.2.3.4', T0), false);
  assert.equal(calls, 1, 'cleanup was attempted');
});

test('a failed cleanup does not block a valid claim', async () => {
  const db = d1();
  const flaky: D1Like = {
    prepare: (sql) => (sql.startsWith('DELETE') ? { bind: () => ({ first: async () => null, run: async () => { throw new Error('x'); } }) } : db.prepare(sql)),
  };
  assert.notEqual(await claimGuideEmail(flaky, 'a@b.co', T0), null);
});

test('each form has its own counter, so the quiz cannot use up the guide sign-up', async () => {
  const db = d1();
  for (let i = 0; i < IP_MAX_PER_HOUR; i++) assert.equal(await allowIp(db, '9.9.9.9', T0, 'quiz'), true);
  assert.equal(await allowIp(db, '9.9.9.9', T0, 'quiz'), false);
  assert.equal(await allowIp(db, '9.9.9.9', T0, 'guide'), true, 'other form unaffected');
});

test('visitorStatus: ok, over, and unknown when the limiter cannot answer', async () => {
  const db = d1();
  const req = (ip?: string) => new Request('https://x', { headers: ip ? { 'CF-Connecting-IP': ip } : {} });
  assert.equal(await visitorStatus({ LEAD_DB: db }, req('1.1.1.1'), 'contact'), 'ok');
  for (let i = 0; i < IP_MAX_PER_HOUR; i++) await visitorStatus({ LEAD_DB: db }, req('2.2.2.2'), 'contact');
  assert.equal(await visitorStatus({ LEAD_DB: db }, req('2.2.2.2'), 'contact'), 'over');
  assert.equal(await visitorStatus({}, req('1.1.1.1'), 'contact'), 'unknown', 'no binding');
  assert.equal(await visitorStatus({ LEAD_DB: db }, req(), 'contact'), 'unknown', 'no IP');
  const broken: D1Like = { prepare: () => ({ bind: () => ({ first: async () => { throw new Error('x'); }, run: async () => { throw new Error('x'); } }) }) };
  assert.equal(await visitorStatus({ LEAD_DB: broken }, req('1.1.1.1'), 'contact'), 'unknown', 'storage error');
});

test('a submission id is processed once; a retry with the same id is recognised', async () => {
  const db = d1();
  const id = '6f1c2a54-0d0e-4a9b-9c55-1d2f3e4a5b6c';
  assert.equal(await claimSubmission(db, id, T0), true);
  assert.equal(await claimSubmission(db, id, T0 + 1000), false);
  assert.equal(await claimSubmission(db, 'a6f1c2a5-0d0e-4a9b-9c55-1d2f3e4a5b6c', T0), true);
  assert.equal(await claimSubmission(db, id, T0 + DAY + 1), true, 'expires after a day');
});
