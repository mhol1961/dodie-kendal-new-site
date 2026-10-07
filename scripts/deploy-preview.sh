#!/usr/bin/env bash
# Private preview for Dodie: every built-but-unreleased page (all town pages),
# noindex everywhere, and nothing reaches GHL (worker-entry.mjs SITE_PREVIEW guard,
# no calendars/chat/contact form/pixel/analytics in the build).
#
# Deploys a SEPARATE Worker with no custom domain and no D1 or GHL bindings, so it
# can never replace or write to the live site. Then rebuild before the next live
# deploy (`npm run deploy` does), since this leaves a preview build in dist/.
#   bash scripts/deploy-preview.sh
set -euo pipefail
cd "$(dirname "$0")/.."
NAME="${PREVIEW_WORKER:-dodie-preview-k7q3m9}"

# Turnstile's always-pass test key: the real key only works on dodiekendall.com,
# and the preview never verifies tokens (its /api/* never reaches the app).
PUBLIC_SITE_PREVIEW=1 PUBLIC_CF_BEACON_TOKEN= PUBLIC_FB_PIXEL_ID= \
  PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA npx astro build

node -e '
const fs = require("fs");
const c = JSON.parse(fs.readFileSync("dist/server/wrangler.json", "utf8"));
c.name = process.argv[1];
c.workers_dev = true;
c.vars = { SITE_PREVIEW: "1" };
c.d1_databases = [];
fs.writeFileSync("dist/server/wrangler.preview.json", JSON.stringify(c));
' "$NAME"

npx wrangler deploy --config dist/server/wrangler.preview.json

# Never leave a preview build where a plain `wrangler deploy` would ship it live.
rm -rf dist .wrangler/deploy
