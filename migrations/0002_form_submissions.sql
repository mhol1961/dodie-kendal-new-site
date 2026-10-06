-- Idempotency for public form submissions (src/lib/guide-limits.ts claimSubmission):
-- a retried request with the same client-generated id must not notify twice.
CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  at INTEGER NOT NULL
);
