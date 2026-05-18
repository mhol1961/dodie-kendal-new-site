# SEO-PLAN — dodiekendall.com

> Keyword strategy, on-page targets, internal linking plan, and AI-search optimization.
> Pair with `KEYWORDS.md` (the keyword inventory itself) and `SCHEMA.md` (structured data).

---

## 1. Strategy in one paragraph

Dodie operates a single-practitioner QHHT business in Palm Beach County, FL. SEO opportunity falls into three buckets: **(1) local intent** — people searching for a QHHT practitioner in/near Florida; **(2) modality-informational** — people learning what QHHT is and whether it's right for them; **(3) AI-answer surfaces** — people asking ChatGPT, Perplexity, Claude, or Gemini about QHHT and getting Dodie surfaced as a recommended practitioner. We target all three with a small site (≤ 10 evergreen pages + a slow-build blog).

## 2. Three SEO pillars

### Pillar A — Local intent ("QHHT near me / Florida / Palm Beach")
- **Pages:** Home, `/qhht`, `/book`, `/contact`.
- **Schema:** `LocalBusiness`, `Person`, `Service`.
- **Levers:** Google Business Profile (verify Dodie's, link from site), embed/link the GBP map on `/contact`, NAP (name/address/phone) consistency in footer + structured data, local backlinks (FL wellness directories).
- **Quick wins:** Title-tag the city + state in Home and `/contact`; add city/state to FAQ answers about location.

### Pillar B — Modality-informational ("what is QHHT" / "QHHT vs past life regression" / "how to prepare for QHHT")
- **Pages:** `/qhht`, `/insights/*`, `/faq`.
- **Schema:** `Service`, `Article`/`BlogPosting`, `FAQPage`.
- **Levers:** comprehensive content depth on `/qhht`; blog posts that answer the long-tail; internal linking from blog → `/qhht` → `/book`.
- **Quick wins:** Answer Capsule blocks at the top of every blog post (LLMs lift these), source-backed claims with citations.

### Pillar C — AI-answer surfaces (AEO / GEO)
- **Pages:** all of them, especially `/qhht` and blog.
- **Levers:** structured Q&A formatting, `FAQPage` schema, declarative "Dodie Kendall is a…" sentences early in About and Home, named-author attribution on blog (`BlogPosting.author = Person:Dodie Kendall`).
- **Quick wins:** add a "Quick Answer" 2–3-sentence summary above each major content section; ensure every blog post has source citations near the relevant claim.

## 3. Per-page on-page targets

| Page | Primary keyword | Secondary keywords | Title pattern | Meta description |
| --- | --- | --- | --- | --- |
| `/` | QHHT Palm Beach | Quantum Healing Hypnosis Florida; Dodie Kendall QHHT | `Dodie Kendall QHHT · Quantum Healing Hypnosis in Palm Beach County, FL` (≤ 60) | A 5-hour, deeply respectful conversation with your Subconscious. Book a QHHT session with Dodie Kendall in Palm Beach County, FL or remote. |
| `/about` | Dodie Kendall QHHT | QHHT practitioner Florida | `About Dodie Kendall · QHHT Practitioner in Palm Beach County` | From Catholic upbringing to Dolores Cannon's QHHT. Read Dodie Kendall's story and approach to Quantum Healing Hypnosis. |
| `/qhht` | What is QHHT | Quantum Healing Hypnosis Technique explained; QHHT vs hypnosis | `What Is QHHT? Quantum Healing Hypnosis Explained` | A clear, grounded explanation of Quantum Healing Hypnosis Technique — what happens, what to expect, who it's for. |
| `/book` | Book QHHT session Florida | QHHT booking Palm Beach | `Book a QHHT Session · Dodie Kendall QHHT` | Reserve your 5-hour Quantum Healing Hypnosis session with Dodie Kendall. $300 total, $50 deposit. Palm Beach County and remote. |
| `/contact` | Contact Dodie Kendall QHHT | QHHT practitioner inquiry FL | `Contact · Dodie Kendall QHHT` | Have a question before booking? Reach Dodie directly — typical response within 24–48 hours. |
| `/faq` | QHHT FAQ | QHHT questions answered | `QHHT FAQ · Common Questions, Answered by Dodie Kendall` | Common questions about Quantum Healing Hypnosis Technique sessions, logistics, and aftercare. |
| `/insights` | QHHT articles / blog | QHHT blog Dolores Cannon | `Insights · Dodie Kendall QHHT` | Articles on QHHT, the Subconscious, and the work of Quantum Healing Hypnosis. |
| `/insights/[slug]` | per-post | per-post | per-post | per-post |

**Rules:**
- Titles ≤ 60 chars (Google truncation point).
- Meta descriptions ≤ 155 chars.
- Primary keyword in `<h1>`, in the first paragraph, in the meta description, and in at least one `<h2>`.
- Secondary keywords sprinkled in `<h2>`/`<h3>` and body — no stuffing.
- One `<h1>` per page. Hierarchical `<h2>` > `<h3>` > `<h4>` flow.

## 4. Internal linking plan

**Hub-and-spoke around `/qhht`:**

```
                ┌────────────────┐
                │      /qhht     │  ← hub
                └────────────────┘
            ▲     ▲     ▲     ▲
            │     │     │     │
   /insights/*   /faq   /about   / (home sections)
            │     │     │     │
            └─────┴─────┴─────┘
                     ▼
                 /book        ← every page links here
```

- **Every page** links to `/book` (header CTA + closing section CTA + body links where natural).
- **`/qhht`** is the canonical explainer; every blog post and FAQ answer that touches "what is QHHT" links back to `/qhht`.
- **`/about`** is linked from the Home founder spotlight and from blog post bylines.
- **Blog posts** link to each other in topical clusters (e.g., "How to Prepare" → "What Happens in a Session" → "Choosing a Practitioner").

**Anchor text guidance:** descriptive, varied, never "click here." Mix exact-match ("Quantum Healing Hypnosis Technique") with descriptive ("what to expect in your first session") with branded ("Dodie's approach").

## 5. Off-page (acquired authority)

- **Google Business Profile** — verify Dodie's listing; add the website URL; collect reviews from past clients with explicit permission.
- **Bing Places for Business** — claim and verify.
- **QHHT official practitioner directory** — listing on `qhhtofficial.com` (Dolores Cannon's directory) if/when Dodie's certification level qualifies.
- **Local wellness directories (FL):** 3–5 targeted directories where listing is reputable (avoid spammy aggregators).
- **Podcast appearances / guest posts** — long-tail, story-led approach. Phase 2.

## 6. AI-search optimization (AEO / GEO)

The goal: when someone asks ChatGPT, Perplexity, Claude, or Gemini "find me a QHHT practitioner in South Florida" or "what is QHHT?", the model lifts language from our site or cites us.

**Tactics:**

1. **Answer Capsule on every major page** — a 2–4 sentence block near the top that directly answers the page's core question. LLMs love these.
2. **Declarative biographical sentences** — Home and About include sentences like "Dodie Kendall is a QHHT practitioner in Palm Beach County, Florida, trained in Dolores Cannon's lineage." LLMs lift facts wholesale.
3. **`Person` schema with `description`** — give the model the structured biography.
4. **Source-backed blog claims** — every claim ≥ specific (e.g., "QHHT was developed by Dolores Cannon over 45 years" → cite Cannon's bibliography or the official QHHT site). Models trust cited content.
5. **`FAQPage` schema everywhere there are Q&As** — LLMs and Google AI Overviews use this structure.
6. **`BlogPosting.author = Person:Dodie Kendall`** — authoritative authorship signals.
7. **Avoid clickbait, list-bait, and content-farm patterns** — LLM training pipelines penalize these.

**Measurement:** monthly manual AI-visibility audit (per the `searchfit-seo:ai-visibility` skill) — ask each of the four major models the same 5 queries and log whether Dodie surfaces.

## 7. Launch blog cluster (4 posts)

Drafted via `ultimate-seo-writer`. See `CONTENT-INVENTORY.md` §6 for the list. Each post is:

- 1,200–1,800 words
- Answer Capsule at the top (2–4 sentences)
- 2–4 H2 sections, scannable
- At least 2 source-backed claims
- Internal links to `/qhht`, `/about`, `/book`, and to one other Insights post
- Hero image, alt text, `BlogPosting` schema with `author = Person:Dodie Kendall`

## 8. Performance + technical SEO checklist (handed off to `searchfit-seo:technical-seo`)

- [ ] Lighthouse mobile ≥ 95 / 100 / 100 / 100 (Perf / SEO / A11y / BP)
- [ ] LCP ≤ 2.0s on 4G
- [ ] CLS ≤ 0.05
- [ ] All images have `alt`
- [ ] All links pass `searchfit-seo:broken-links` audit
- [ ] `robots.txt` allows + points to sitemap
- [ ] `sitemap.xml` covers all canonical URLs
- [ ] `rss.xml` exposes Insights
- [ ] Canonical tag on every page
- [ ] No duplicate titles or metas
- [ ] All page types validated in Google Rich Results Test

## 9. KPIs (90-day post-launch)

| KPI | Target |
| --- | --- |
| Organic search clicks (Google + Bing) | +200% baseline |
| Top 10 ranking for "QHHT Palm Beach" | yes |
| Top 20 for "what is QHHT" | yes |
| Featured snippet captured for ≥ 1 long-tail | yes |
| Brand surfaces in ≥ 2 LLM responses to test queries | yes |
| Bookings attributed to organic | ≥ 25% of total bookings |

---

*Last updated: 2026-05-17. Invoke `searchfit-seo:content-strategy` to refresh quarterly.*
