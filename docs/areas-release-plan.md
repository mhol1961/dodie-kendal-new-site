# Town pages: release plan

Town pages live at `/qhht/{town}` and go live one at a time (about one a week) so
Google sees steady, real additions, never a batch of city pages. Dodie approved all
five on 2026-10-08.

| Town | Slug | Release date | Status |
|---|---|---|---|
| Port St. Lucie | `port-st-lucie` | 2026-10-08 | Live |
| Jupiter | `jupiter` | 2026-10-15 | Waiting |
| Palm City | `palm-city` | 2026-10-22 | Waiting |
| Jensen Beach | `jensen-beach` | 2026-10-29 | Waiting |
| Hobe Sound | `hobe-sound` | 2026-11-05 | Waiting |

## Releasing the next town ("release the next town")

1. `src/data/areas/index.ts`: add the next slug to `RELEASED` (the one-line change),
   e.g. `['port-st-lucie', 'jupiter']`. That builds the page and adds it to the
   sitemap, the "Areas I serve" lists (`/qhht` and footer) and "Also serving" links.
2. `public/llms.txt`: add the town's line under the Book line.
3. Update the Status column above, push to `main` (the push deploys), then check the
   live page: indexable, canonical `https://dodiekendall.com/qhht/{slug}`, in
   `/sitemap-0.xml`, photo credit line above the footer (if it has a photo).

Unreleased towns stay out of the live build entirely (pages, links, sitemap, map and
photo files). Dodie's private preview (`bash scripts/deploy-preview.sh`) shows all five.
