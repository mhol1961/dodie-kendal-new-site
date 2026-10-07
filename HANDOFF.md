# HANDOFF — dodiekendall.com

> Written for a developer who has never seen this project. Read this file top to
> bottom before touching anything. No secret values appear here — names only.
>
> A companion document for the site owners, written in non-technical language
> ("Website Ownership and Continuity Kit"), is delivered to Dodie and Clint directly.
> It is generated from this file and deliberately not tracked in the repo.

---

## 1. What this site is

`dodiekendall.com` is the marketing and booking site for **Dodie Kendall**, a
Quantum Healing Hypnosis Technique (QHHT) practitioner in Stuart, Florida.
It replaces an older GoHighLevel-hosted site. GoHighLevel (GHL) is now used
purely as the CRM/booking backend — no page building, no hosting.

**Owners:** Dodie and Clint Kendall.
**Built and maintained by:** Mark Holland / IntellaGrow.

Pages live under `src/pages/`: home, about, QHHT explainer, book, contact, FAQ,
testimonials, resources, videos, insights (blog), free-guide + three paid-traffic
landing pages, privacy, terms. Server endpoints live in `src/pages/api/`
(`contact`, `lead-magnet`, `quiz`, `videos.json`, `health`).

**Sister site:** `guidingwinds-unplug.com` — same client, different brand,
**separate repository**. It is mentioned here only because its deploy path
differs (see §4).

---

## 2. Stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 7.x, static output — prerendered pages plus `export const prerender = false` (SSR) for `/book`, `/404` and `/api/*` |
| Styling | Tailwind CSS 3 via PostCSS (`postcss.config.mjs`) + a small hand-ported subset of shadcn/ui primitives |
| Language | TypeScript (strict) |
| Content | Astro Content Collections (`src/content/insights`, `src/content/testimonials`), Markdown/MDX |
| Hosting | Cloudflare Workers (Workers Assets serves `dist/client/`; the Worker, bundled into `dist/server/`, handles SSR routes) |
| Adapter | `@astrojs/cloudflare` |
| Node | 22.12+ (see `engines` in `package.json` and `.nvmrc`) |

Config files: `astro.config.mjs`, `tailwind.config.mjs`, `wrangler.toml`,
`tsconfig.json`.

Do not introduce a client-side framework runtime. Interactivity is plain
progressive-enhancement JS inside `.astro` components.

---

## 3. Running it locally

```bash
git clone https://github.com/mhol1961/dodie-kendal-new-site.git
cd dodie-kendal-new-site
npm install

cp .dev.vars.example .dev.vars   # fill in real values; .dev.vars is gitignored
npm run dev                      # http://localhost:5400
```

`.dev.vars` (not `.env`) is what the Cloudflare `platformProxy` reads in dev, so
the `/api/*` endpoints see the same variables they will see in production. A
missing value does not crash the dev server — the endpoints return a
configuration error instead.

Other scripts:

```bash
npm run build       # → ./dist  (plus a postbuild step writing dist/.assetsignore)
npm run preview     # serve the production build locally
npm run typecheck   # astro check
npm run lint
npm run test:feed   # unit test for the YouTube feed parser
npm run test:e2e    # Playwright
```

If you are developing on a Windows drive mounted into WSL (`/mnt/c/...`), file
watching does not work; run dev with `WATCHPACK_POLLING=true` or expect stale
bundles.

---

## 4. How a change gets published

### dodiekendall.com: push to `main` publishes (Cloudflare Workers Builds)

**Pushing to `main` is the only way this site deploys** (since 2026-10-07, same as
Guiding Winds). Cloudflare's GitHub build runs `npm run build` then `npx wrangler deploy`.
Pushes to any other branch only upload a test version (not live), reachable at
`https://<first 8 chars of version id>-dodie-kendal-new-site.mhollandanalyst.workers.dev`
(`npx wrangler versions list`). Do not run `wrangler deploy` by hand; `npm run deploy`
now refuses. Emergency rollback: `npx wrangler rollback`.

**Nothing unapproved on `main`.** Whatever is on `main` goes live on push. Keep
unreleased work on branches (e.g. `feature/town-pages`, gated by `RELEASED`).

**Build-time values live in the committed `.env.production`** (public values only,
they ship in the HTML): the Turnstile site key now, and `PUBLIC_FB_PIXEL_ID` /
`PUBLIC_CF_BEACON_TOKEN` when they exist. Node is pinned by `.node-version`. Never put a
secret there; secrets are Worker Secrets (`wrangler secret put`), which deploys keep.

**D1 migrations are NOT applied by the automatic build.** Before pushing a commit that
adds a file in `migrations/`, apply it first: `npm run db:migrate` (tables are created
`IF NOT EXISTS`, so applying early is safe). Without the tables, the free-guide form
still captures leads but sends no guide emails (logged as `limit-unavailable`).

**URLs: one per page, no trailing slash.** `astro.config.mjs` sets `trailingSlash: 'never'`
and `build.format: 'file'`; `worker-entry.mjs` (wrangler `main`) answers `/page/`, `*.html`
and legacy URLs with real 301s, then hands off to the Astro worker. `public/_redirects`
does NOT work here (the adapter follows it internally, so browsers get a 200). Add
legacy redirects to the `LEGACY` map in `worker-entry.mjs`.

Everything else in §5 is a Worker runtime binding, read via `import { env } from 'cloudflare:workers'`.

Verify in the Cloudflare dashboard under the Worker's **Builds** tab (each push), the
**Overview → Versions** list, or by curling the site and grepping for your change. The Worker also serves at its `*.workers.dev` subdomain, which is
useful for verifying before the custom domain is checked.

Deploy target details are in `wrangler.toml`: Worker name, `main`, the `[assets]`
block (`directory = "./dist"`, binding `ASSETS`, `run_worker_first = true`), and
the non-secret `[vars]`. The build generates the final config (`dist/server/wrangler.json`).

> Important: every `wrangler deploy` **resets plain-text variables set in the
> dashboard** but preserves Secrets. Therefore non-secret runtime vars must live
> in `wrangler.toml [vars]`, and secrets must be set with `wrangler secret put`
> (or the dashboard's Secrets section) — never in the toml.

### guidingwinds-unplug.com — Cloudflare Pages, via GitHub push

The sister site (separate repo) is on **Cloudflare Pages** bound to its GitHub
repository: pushing to `main` triggers a build and publishes automatically. Pull
requests get preview deployments. No `wrangler` step is needed there.

### Branching

`main` is deployable. Feature branches off `main`, squash-merge back.
Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).

---

## 5. Environment variables and secrets — names only

No values appear in this repo or this file. `ENV.md` carries the same inventory
with purposes; `.env.example` and `.dev.vars.example` carry the names with empty
values.

| Name | Secret? | Where it lives in production | Purpose |
| --- | --- | --- | --- |
| `GHL_PRIVATE_INTEGRATION_TOKEN` | **secret** | Cloudflare Worker **Secret** (`wrangler secret put`) | Auth for every GoHighLevel API call from `src/lib/ghl.ts` |
| `GHL_LOCATION_ID` | no | `wrangler.toml [vars]` | Dodie's GHL subaccount (location) id |
| `GHL_CALENDAR_ID` | no | `wrangler.toml [vars]` | The QHHT booking calendar embedded on `/book` |
| `LEAD_DB` | no | `wrangler.toml [[d1_databases]]` (schema: `migrations/`) | Free-guide abuse limits (per-address daily email, per-IP hourly cap) |
| `OPTIN_SECRET` | **secret** | Cloudflare Worker Secret | Signs double opt-in confirm links for the free guide |
| `TURNSTILE_SECRET_KEY` | **secret** | Cloudflare Worker Secret | Spam check on the free-guide sign-up; without it every sign-up is rejected |
| `PUBLIC_TURNSTILE_SITE_KEY` | no | build environment (`.env.production`) | Turnstile widget site key; the build fails without it |
| `GHL_WORKFLOW_CONTACT_AUTORESPONDER_ID` | no | `wrangler.toml [vars]` (when used) | Contact-form auto-responder workflow |
| `SITE_URL` | no | build environment (defaults to the canonical URL in `astro.config.mjs`) | Canonicals, OG tags, sitemap, JSON-LD |
| `PUBLIC_CF_BEACON_TOKEN` | no | build environment (`.env.production`) | Enables Cloudflare Web Analytics (production builds only) |
| `PUBLIC_FB_PIXEL_ID` | no | build environment | Enables `MetaPixel.astro`. Blank renders nothing. **If you change tracking, update `/privacy` in the same commit.** |
| `RESEND_API_KEY` | **secret** | Cloudflare Worker Secret (optional; currently not provisioned) | Fallback transactional email if the GHL write path fails |
| `FALLBACK_EMAIL_TO` | no | Worker var (optional) | Recipient for that fallback |
| `FALLBACK_EMAIL_FROM` | no | Worker var (optional) | Verified sender for that fallback |
| `BOOKING_CALENDAR_FALLBACK_URL` | no | Worker var (optional) | Direct calendar link shown if the booking iframe fails |
| `SENTRY_DSN` | secret | not provisioned | Reserved for future error monitoring |
| `LOGFLARE_API_KEY` | secret | not provisioned | Reserved for future log shipping |

### GoHighLevel identifiers that are NOT environment variables

Three GHL bindings are hard-coded in source, so a move to a different GHL subaccount
must change these too or those leads keep flowing to the old tenant:

| Where | What is hard-coded |
| --- | --- |
| `src/pages/contact.astro` | the GHL **form id** (appears as `data-form-id`, `id` and `data-layout-iframe-id` on the iframe) — this iframe, not `/api/contact`, is the live contact form |
| `src/components/ChatWidget.astro` | the GHL **chat widget id** (`data-widget-id`) and the practice phone number |
| `src/pages/api/*.ts` | nothing hard-coded — these read the variables above |

`/api/contact` is currently **unused by any page**; it exists to back a future
chat/AI path. `/api/quiz` and `/api/lead-magnet` are live. When migrating tenants,
verify every lead surface: booking iframe, contact iframe, chat widget, quiz, and
lead magnet.

`PUBLIC_*` variables are inlined into the client bundle at build time — never put
anything sensitive behind that prefix. Everything else is read server-side via
`import { env } from 'cloudflare:workers'`.

Rotation: rotate the GHL token roughly every 6 months or on any staffing change —
issue a new Private Integration Token in Dodie's GHL subaccount, `wrangler secret
put` it, redeploy, then revoke the old one.

---

## 6. External services this site depends on

| Service | What it does here | Notes |
| --- | --- | --- |
| **Cloudflare** | Hosting (Workers + Workers Assets for this site; Pages for the sister site), DNS, TLS | The whole site is down if this account is down |
| **GitHub** (`mhol1961/dodie-kendal-new-site`) | Source of truth for the code | Not in the serving path — the live site keeps running if GitHub is unreachable |
| **GoHighLevel** | CRM, contact records, the booking calendar embedded on `/book`, the contact form iframe on `/contact`, the chat widget, automation workflows, prep-guide email delivery | Embeds are served from `api.leadconnectorhq.com` and `widgets.leadconnectorhq.com`. Must be **Dodie's own subaccount** — never an agency subaccount |
| **YouTube** | The `/videos` "Latest Videos" section reads the channel RSS feed via `/api/videos.json`; thumbnails are a click-to-play facade so no YouTube JS loads until clicked | Feed failure degrades gracefully |
| **Meta (Facebook) Pixel** | Ad conversion tracking, active only when `PUBLIC_FB_PIXEL_ID` is set | Whatever is live must be reflected on `/privacy` |
| **Cloudflare Web Analytics** | Privacy-first analytics, production builds only, when `PUBLIC_CF_BEACON_TOKEN` is set | No cookies |
| **Google Search Console / Bing Webmaster** | Search indexing and diagnostics | Registered under the owners' email |
| **Stripe** | **Not used.** No Stripe code, keys, or checkout exist in this repo | Booking deposits are collected inside GoHighLevel, not by this site |

---

## 7. Domain and DNS

- `dodiekendall.com` is the canonical domain; the zone is managed in **Cloudflare
  DNS**, and the registrar is held by the owners.
- The apex record points at the Cloudflare Worker (CNAME with flattening at the
  apex); `www` redirects to the apex. TLS is Cloudflare-issued; there is nothing
  to renew manually.
- Custom-domain binding lives on the Worker itself (Cloudflare dashboard →
  the Worker → Domains & Routes). The `*.workers.dev` subdomain stays available
  as a verification URL.
- The site was cut over from the old GHL-hosted site; `LAUNCH-CHECKLIST.md`
  records the cutover sequence and the rollback (repoint DNS at the previous GHL
  targets, wait ~5 minutes).
- The sister site's domain is a separate Cloudflare zone pointed at its
  Cloudflare Pages project.

---

## 8. Where to look next

| Question | File |
| --- | --- |
| Conventions, hard rules, which skills to run | `CLAUDE.md` |
| Design tokens and component system | `DESIGN.md` |
| Requirements and page hierarchy | `PRD.md` |
| Technical detail, form schemas | `TECH-SPEC.md` |
| GHL endpoints, form + calendar wiring | `GHL-INTEGRATION.md` |
| Variable inventory with purposes | `ENV.md` |
| Compliance language limits (QHHT is hypnosis, not medicine) | `COMPLIANCE.md`, `LEGAL-DISCLAIMERS.md` |
| Launch/rollback and routine upkeep | `LAUNCH-CHECKLIST.md`, `MAINTENANCE-GUIDE.md` |

> **Those older docs predate the move to Cloudflare Workers.** `README.md`, `ENV.md`,
> `TECH-SPEC.md`, `LAUNCH-CHECKLIST.md`, `CLAUDE.md` and `ADR/ADR-001` still describe
> Cloudflare **Pages** with push-to-deploy, and `wrangler.toml` carries a comment from
> that era saying every push triggers a deploy. That Git-integrated build pipeline is
> dead — it has not run successfully since an early wrangler-3 failure. §4 of this file
> is the authoritative deploy procedure; where those files disagree, this one wins.

Two standing rules worth repeating: **no medical or therapeutic claims** anywhere
in copy or metadata, and **no lead data routed anywhere but Dodie's own GHL
subaccount**.
