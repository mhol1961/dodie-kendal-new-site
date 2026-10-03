-- Free-guide abuse limits (src/lib/guide-limits.ts). D1 is SQLite: each statement
-- below is used as a single atomic upsert, so concurrent requests can't double-claim.

-- One guide email per address per 24h. sent_at = epoch ms of the last claimed send.
CREATE TABLE IF NOT EXISTS guide_sends (
  email   TEXT PRIMARY KEY,
  sent_at INTEGER NOT NULL
);

-- Per-IP sign-up counter per hour bucket (bucket = floor(epoch_s / 3600)).
CREATE TABLE IF NOT EXISTS ip_hits (
  ip     TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  n      INTEGER NOT NULL,
  PRIMARY KEY (ip, bucket)
);
