# dodiekendall.com

Marketing + booking site for **Dodie Kendall** — Quantum Healing Hypnosis Technique (QHHT) practitioner based in Stuart, Florida.

This is a rebuild of an existing GoHighLevel-hosted site. The new build lives on a modern static stack and uses GoHighLevel purely as a CRM/booking backend via its public API.

## Quick facts

- **Stack:** Astro + Tailwind CSS + a hand-curated subset of shadcn/ui, deployed to Cloudflare Workers.
- **Booking:** Existing GHL 5-hour / $300 / $50-deposit calendar, embedded inside the new design.
- **Sister site:** [guidingwinds-unplug.com](https://guidingwinds-unplug.com) — same client, separate brand and codebase.
- **Reference site:** [shiftedsouls.com](https://shiftedsouls.com) — prior QHHT build by the same agency (visual + IA reference).
- **Agency:** IntellaGrow.

## Documentation map

If you're new to this repo, read in this order:

1. **[CLAUDE.md](./CLAUDE.md)** — project context, stack, conventions, AI-skill invocations, hard rules.
2. **[DESIGN.md](./DESIGN.md)** — Google-spec design system with oklch tokens, typography, components, do's and don'ts.
3. **[PRD.md](./PRD.md)** — goals, audience, conversion funnel, page hierarchy, success metrics.
4. **[TECH-SPEC.md](./TECH-SPEC.md)** — Astro structure, integration points, form schemas, hosting/DNS plan, SEO/schema baseline.
5. **[BUILD-PROMPTS.md](./BUILD-PROMPTS.md)** — sequential build prompts for phase-by-phase execution.
6. **[ADR/](./ADR/)** — architecture decision records.

Supporting docs:

- Brand & content: [BRAND-VOICE.md](./BRAND-VOICE.md), [COPY-DECK.md](./COPY-DECK.md), [CONTENT-INVENTORY.md](./CONTENT-INVENTORY.md)
- SEO: [SEO-PLAN.md](./SEO-PLAN.md), [KEYWORDS.md](./KEYWORDS.md), [SCHEMA.md](./SCHEMA.md)
- Integrations: [GHL-INTEGRATION.md](./GHL-INTEGRATION.md), [ENV.md](./ENV.md)
- Compliance (QHHT is hypnosis — this matters): [COMPLIANCE.md](./COMPLIANCE.md), [LEGAL-DISCLAIMERS.md](./LEGAL-DISCLAIMERS.md), [INTAKE-FORMS.md](./INTAKE-FORMS.md), [PRIVACY-NOTES.md](./PRIVACY-NOTES.md)
- QA & launch: [QA-CHECKLIST.md](./QA-CHECKLIST.md), [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md), [POST-LAUNCH-PLAN.md](./POST-LAUNCH-PLAN.md), [MAINTENANCE-GUIDE.md](./MAINTENANCE-GUIDE.md)
- Project management: [ROADMAP.md](./ROADMAP.md), [BACKLOG.md](./BACKLOG.md), [CHANGELOG.md](./CHANGELOG.md), [HANDOFF.md](./HANDOFF.md)

## Local development

```bash
# Install deps
npm install

# Run dev server
npm run dev          # http://localhost:5400

# Production build
npm run build        # outputs ./dist

# Preview production build
npm run preview
```

## Environment variables

See [ENV.md](./ENV.md) for the full list (names + purpose, no values). For local development copy `.dev.vars.example` to `.dev.vars` — that is what the Cloudflare platform proxy reads, so the `/api/*` endpoints see the same variables they get in production. **Never commit `.dev.vars` or `.env*` files containing secrets.**

## Deployment

**A GitHub push does not publish this site.** The live site updates only when a new
Worker version is uploaded:

```bash
git push origin main
npm run build        # set SITE_URL, PUBLIC_PLAUSIBLE_DOMAIN, PUBLIC_FB_PIXEL_ID first
npx wrangler deploy  # uploads dist/ + dist/_worker.js/index.js
```

- **Production:** Cloudflare Workers, static assets served from `dist/` via Workers Assets; the Worker handles the SSR routes (`/book`, `/api/*`). Target config lives in `wrangler.toml`.
- **Verifying a deploy:** the Worker's **Overview → Versions** list in the Cloudflare dashboard, or curl the site and grep for your change. The dashboard's "Builds" tab is a dead Git-integrated pipeline — ignore it.
- **Full procedure, including secrets and build-time variables:** [HANDOFF.md](./HANDOFF.md) section 4.
- **Domain cutover from GHL:** see [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md).

> The sister site, guidingwinds-unplug.com, is a separate repo on Cloudflare Pages, where pushing to `main` *does* publish. Don't carry that habit over to this one.

## Contributing

This is a client project; commits should follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`). Open a PR against `main`; PRs squash-merge after review.

## License

Proprietary — © 2026 Dodie Kendall QHHT. All rights reserved. Built and maintained by [IntellaGrow](mailto:mhollandanalyst@gmail.com).
