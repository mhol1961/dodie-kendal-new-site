# dodiekendall.com: SEO, AEO, CRO and security audit

- **Date:** 2026-10-05
- **Scope:** live site https://dodiekendall.com and repo at commit `3902b2e`
- **Type:** report only. No site files were changed, nothing was built or deployed, and no forms were submitted.
- **Method:** three parallel read-only audits.
  - **SEO:** skills `seo-audit`, `searchfit-seo:technical-seo` / `on-page-seo` / `internal-linking`, `scaled-content-guard`.
  - **AEO:** `searchfit-seo:ai-visibility`, `seo-geo`, `searchfit-seo:schema-markup`, `verify-structured-data`.
  - **CRO + security:** `ui-ux-cro-master`, `cro-landing-page`, `security-audit` (passive only).
- **Merging:** where two audits found the same issue, it appears once below.

**Tags**
- **[Code fix]**: Claude can do it in the repo.
- **[Needs Dodie]**: needs her input, content or a decision.
- **[Needs Mark: dashboard]**: Google, GHL or Cloudflare settings.

---

## 0. Precondition: Dodie's 12-item list and the /design sitemap fix

All 12 items are confirmed live, plus the /design sitemap fix. Each was checked on the live site before the audit started:

1. Phone 772-247-5534 everywhere; the old number is gone.
2. Contact location line reads "In-person sessions · Stuart, FL".
3. Skip-the-form line is updated.
4. No trailing slash: `/page/` returns a 301 to `/page`, and canonicals, sitemap and internal links all match.
5. robots.txt lists the sitemap; the sitemap is valid with 15 URLs, and noindex pages are excluded (including /design).
6. Homepage H1 includes "QHHT in Stuart, FL" as a single H1.
7. About, Contact and Insights titles are exact.
8. Trust strip includes "Level 2 QHHT Practitioner".
9. Each blog post has its own share image.
10. FAQPage and BlogPosting schema are live and validated.
11. Speed: videos are deferred, media compressed, phones get stills.
12. Local-area layout and the hidden pricing slot are in code, unpublished (`/areas/*` returns 404).

**Still open from Dodie's list: none.** Two related loose ends are listed below as new findings:
- **Item 2:** the remote-session wording on the FAQ and landing page 2 was listed, not changed, as instructed (see M5).
- **Item 9:** non-post pages use the fallback share image, which turns out to be blank (see M8).

---

## 1. Must fix

### M1. The site loads over insecure http:// with no redirect to https://, and there is no HSTS
**Tag:** [Needs Mark: dashboard]

- **Evidence:**
  - `curl -I http://dodiekendall.com/` and `http://dodiekendall.com/free-guide` both return `HTTP/1.1 200 OK`.
  - `http://www.dodiekendall.com/` takes 2 hops.
  - No `Strict-Transport-Security` header on any response.
  - Forms post to relative `/api/...`, so on an http page, email addresses travel unencrypted.
- **Fix:** Cloudflare, SSL/TLS, Edge Certificates: turn on **Always Use HTTPS**, then enable **HSTS**.
  - Start with a 6-month max-age and include subdomains; skip preload at first.
  - Code fallback if wanted: in `worker-entry.mjs`, 301 any `http:` request to https.

### M2. The paid session calendar is cut off on phones, so visitors don't see the time slots
**Tag:** [Code fix]

- **Evidence:**
  - `src/components/BookingEmbed.astro` uses a fixed `min-height: 720px` with no auto-resize.
  - GHL content measured 889px tall on an iPhone 13 and 1025px on desktop.
  - The box ends at the month grid, so the slot list and the booking form sit in a hidden inner scroll area.
  - The discovery-call calendar has the same limit.
- **Fix:**
  - Load GHL's `form_embed.js` (already used on /contact) with the iframe ids it expects, so the calendars resize themselves.
  - Interim: give the calendars a taller minimum height on small screens.

### M3. Ad paths send people to the wrong place
**Tag:** [Code fix]

**(a) Landing page 2: "Book your session" lands on the free call.**
- **Evidence:**
  - All LP2 booking CTAs go to `/book` (`landing-page-2.astro:90,187,218,224`).
  - On a phone, /book shows the free discovery-call calendar first (top at 668px). The paid calendar starts at about 2745px, four screens further down.
  - Nothing above the fold on /book jumps to either option.
- **Fix:**
  - Add section anchors to /book: `#discovery` and `#reserve`.
  - Put two jump buttons under the H1: "Free 30-minute call" and "Reserve a session, $50 deposit".
  - Point the LP2 CTAs at `/book#reserve`.

**(b) Landing page 3: "Book a free 15-min call" goes to the contact form.**
- **Evidence:**
  - `landing-page-3.astro:65,177,187` link to `/contact`, which has full site navigation, the chat widget and a form, but no calendar.
  - The real offer is the free **30-minute** call on /book.
  - `contact.astro:41` also says "free 15-min".
- **Fix:** Relabel to "Book a free 30-minute call", link to `/book#discovery` (or embed the discovery calendar on LP3), and update the contact page copy.
  - Dodie confirms there is no separate 15-minute call (see M5).

### M4. Bookings from ads are not tracked or attributed
**Tag:** [Code fix] plus [Needs Mark: dashboard]

- **Evidence:**
  - Ad details (utm_*, fbclid) are captured into GHL from the three site forms, but the booking iframes get a bare URL (`BookingEmbed.astro`).
  - A booking from an ad arrives in GHL with no source.
  - No booking or "Schedule" event fires.
  - The GHL calendar frames already load Meta's `fbevents.js`.
- **Fix:**
  - **[Code fix]** Append the stored utm_*/fbclid values to the calendar iframe URLs. Confirm GHL records them with one test booking.
  - **[Needs Mark: dashboard]** Once a Pixel ID exists, add it in both GHL calendars' tracking settings, or add a GHL "Appointment booked" workflow that sends the event to Meta server-side.

### M5. Contradictory facts that visitors and AI assistants will repeat
**Tag:** [Needs Dodie] (she confirms the truth, then a [Code fix] updates every spot)

| Topic | One place says | Another says |
|---|---|---|
| Remote sessions | FAQ "Where do sessions take place?" (`src/content/faq/logistics-01-where.json`): "Remote sessions are conducted over Zoom... many of my clients are remote" (also in the FAQ schema). LP2 (`landing-page-2.astro:66,185`): "Remote sessions are available", "Remote available" | FAQ "Do you offer remote sessions?": "Not currently, all sessions are in person"; /book and /qhht say in person only |
| Discovery call length | `contact.astro:41`, LP3: "15-min" | /book: "free 30-minute call" (the real calendar is 30 minutes) |
| Booking confirmation | "Booking confirmed within 24 hours" (`index.astro:122`, `landing-page-2.astro:98,217`) | /book: "Right after you book, you'll get an email confirming" (the calendar auto-confirms) |
| Session length | Post "What happens in a QHHT session" body: "about 3 hours" plus 2 hours plus 30 minutes | Same post's quick answer and the rest of the site: 2 to 3 hours of session, about 5 hours total |
| FAQ count | /faq copy: "Twenty answers" (`faq.astro:94,228`) | 19 questions on the page |
| Prep-guide timing | FAQ: "after you book" | /book: "two days before"; /qhht: "before we meet" |

### M6. A testimonial makes a medical claim
**Tag:** [Needs Dodie]

- **Evidence:** `src/content/testimonials/kat-well.json`, live on /testimonials: "we got to the root of my debilitating depression that decades of therapy couldn't heal... this method works!!"
  - This conflicts with `COMPLIANCE.md` §4.
  - AI assistants quote exactly this kind of line when asked "can QHHT heal depression".
- **Fix:** Dodie removes it, or asks the client for an excerpt without the health outcome. Consider a visible "individual experiences vary" line on /testimonials.

### M7. Cloudflare blocks ChatGPT's and Claude's training crawlers while robots.txt invites them
**Tag:** [Needs Mark: dashboard]

- **Evidence:** robots.txt allows all bots. The homepage and /faq return:
  - **403 "Your request was blocked." from Cloudflare:** GPTBot, ClaudeBot, CCBot, Bytespider.
  - **200:** OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Googlebot, Google-Extended, Bingbot.
- Nothing in the site code blocks bots, so this is a Cloudflare zone setting (Security, Bots, "Block AI bots" / AI Crawl Control).
- **Effect:** live AI search can read the site, but what ChatGPT and Claude learn about Dodie during training cannot.
- **Fix:** Allow GPTBot and ClaudeBot. Blocking CCBot and Bytespider can stay if wanted.

### M8. The default share image is a blank cream rectangle
**Tag:** [Code fix]

- **Evidence:**
  - `public/og-image.jpg` is 1200x630, 4,769 bytes, a single flat color.
  - It is the share image for 12 of the 15 indexed pages, including home, /qhht and /book, which ads and social shares point at.
  - It is also the LocalBusiness `image` in `src/lib/schema.ts`.
- **Fix:** Generate a branded default with the existing share-image generator ("Dodie Kendall · QHHT · Stuart, FL"), or crop a 1200x630 photo of Dodie. Point `DEFAULT_OG_IMAGE` and the schema image at it.

### M9. No plain answer to "What is QHHT?" or "Is QHHT safe?"
**Tag:** [Needs Dodie] for the wording; [Code fix] to place it

- **Evidence:**
  - The /qhht section labeled "What is QHHT" opens with a metaphor ("A library you have always carried"). No sentence on the site says "QHHT is ...".
  - No FAQ covers safety, who it is not right for, what hypnosis feels like, or "what if I can't relax".
- **Fix:** One or two plain sentences directly under the /qhht heading, using the language `COMPLIANCE.md` §3 already approves:
  - a hypnosis-based method developed by Dolores Cannon
  - the session length
  - that it is not medical care

  Plus 2 or 3 new FAQs in Dodie's own words on safety and suitability. Adding them to the FAQ data keeps the schema in sync automatically.

### M10. Two conversion steps break their promise on phones
**Tag:** [Code fix] (plus [Needs Dodie] for the quiz result wording)

**(a) Quiz.**
- **Evidence:**
  - The quiz button says "See my result" (`QhhtQuiz.astro:106`), but the success screen only says "Thank you... I'll be in touch".
  - Its next step is the $300 "Book a session", not the free call.
- **Fix:**
  - Show a short instant result based on the answers; the answer mapping already exists in `src/lib/quiz.ts`.
  - Make the free 30-minute call the main next step.

**(b) /free-guide on a phone.**
- **Evidence:**
  - The email field sits behind the sticky "Send me the free guide" bar on load.
  - Tapping the bar scrolls but doesn't put the cursor in the field.
- **Fix:**
  - Move the form above the long paragraph on mobile.
  - Hide the sticky bar while the form is on screen.
  - Make the bar focus the email field.

---

## 2. Should fix

| ID | Finding | Evidence | Fix | Tag |
|---|---|---|---|---|
| S1 | No security headers at all | Live responses carry only content-type, cache-control, server | Add in `worker-entry.mjs`: nosniff, Referrer-Policy, X-Frame-Options SAMEORIGIN, Permissions-Policy, then a report-only CSP allowlisting GHL, Turnstile, Cloudflare analytics, Meta, YouTube-nocookie, fonts.bunny.net | [Code fix] |
| S2 | Quiz and contact endpoints have no rate limit | Only `/api/lead-magnet` uses `allowIp`. Each passing quiz emails the typed address and emails and texts Dodie (SMS costs money); contact triggers an autoresponder | Reuse `allowIp` (`src/lib/guide-limits.ts`) in `quiz.ts` and `contact.ts` | [Code fix] |
| S3 | Two blog titles cut off with "…" | "How to Prepare for Your First Quantum Healing Session · D…", "Past-Life Regression vs. QHHT: What's the Difference? · D…" (`seo.ts` truncates at 57) | Drop the brand suffix when it doesn't fit; never truncate | [Code fix] |
| S4 | /book meta description cut off mid-word ("…reserve your tim") | Source is 190 characters, sliced to 155 | Rewrite to 155 or fewer; fail the build on over 160 instead of slicing | [Code fix] |
| S5 | Em/en dashes in 12 of 15 meta descriptions, plus headings and alt text | e.g. `index.astro:18`, `about.astro:22`, `contact.astro:14` ("24–48"), the 3 posts, `DEFAULT_DESCRIPTION`; contact H1 "Write me a note — I read every one.", "Or — easier still:", /qhht "Sessions and practice — answered.", the lead-magnet cover alt on every page; about 159 more in body copy | Rewrite descriptions to 140 to 155 characters with "QHHT" and "Stuart, FL", no dashes; fix headings and alt text; schedule a body-copy dash pass | [Code fix] |
| S6 | Blog dates show one day early | Visible "May 17" vs schema 2026-05-18 on all 3 posts (`toLocaleDateString` without timeZone at `insights/[...slug].astro:68,127`, `insights/index.astro:107,149`) | Add `timeZone: 'UTC'` and wrap dates in a `<time datetime>` tag | [Code fix] |
| S7 | No custom 404 page | Unknown URLs return a correct 404 status with Astro's default dark page, no navigation | Add `src/pages/404.astro` (noindex) with links to /qhht, /book, /insights, /contact and the phone | [Code fix] |
| S8 | About page has no credentials and no required disclaimer | /about never says "Level 2" or gives training detail; lacks the "not a licensed physician, psychologist or psychotherapist" statement `COMPLIANCE.md` §5 requires there | Add a short credentials block and the §5 disclaimer; add `hasCredential` to the Person schema. Dodie supplies certification year and rough session count | [Needs Dodie] |
| S9 | No profile links, no address, Google Business Profile status unknown | No `sameAs` in schema; no GBP, Maps, Facebook or QHHT-directory link; address is city-only; /testimonials says reviews come from Google but doesn't link them | Add the YouTube channel to `sameAs` now ([Code fix]); then get the GBP URL, Facebook page and QHHT Official directory URL; the site address should match exactly what GBP shows (street address only if GBP shows it) | [Needs Mark: dashboard] |
| S10 | Possible name mismatch with QHHT directory | Affiliate shop slug is "doreenkendall"; the site only says "Dodie Kendall" | If her certification is under Doreen Kendall, add `alternateName` to the Person schema | [Needs Dodie] |
| S11 | Search Console and GBP hygiene | `/sitemap.xml` returns 404 (the correct file is `/sitemap-index.xml`) | Confirm GBP is claimed and verified with matching name, phone and website; confirm `sitemap-index.xml` is the submitted sitemap; request indexing of the 3 posts after S3 ships; same in Bing | [Needs Mark: dashboard] |
| S12 | "Hypnotherapy" and healing wording conflicts with the not-therapy position | GHL paid calendar title "Dodie Kendall QHHT Hypnotherapy Book a Session"; `book.astro:150` "first hypnotherapy session"; home H1 "and deep healing."; past-life post "meaningful relief from patterns", "Both can be deeply healing"; what-happens post uses "chronic pain" as an example | Rename the calendar ([Needs Mark: dashboard]); change "hypnotherapy" to "QHHT" on /book ([Code fix]); Dodie decides on the hero and post wording, per `COMPLIANCE.md` §3 | [Needs Dodie] |
| S13 | Price appears in schema on pages that don't show it | `qhhtService()` (offers $300) emitted on home, /qhht, /free-guide, which don't show "$300" | Show "$300, $50 deposit" on /qhht (also answers "how much is QHHT"), or emit the offer only on /book | [Code fix] |
| S14 | Main titles and H1s carry no search terms | /qhht "Quantum Healing Hypnosis Technique · Dodie Kendall QHHT", /book, /faq, /testimonials, /videos titles; H1s like "Select a time that feels right.", "Common questions, honest answers." | Use `exactTitle` (e.g. "Book a QHHT Session in Stuart, FL · Dodie Kendall") and the home-page pattern of a small location line inside the H1, keeping Dodie's headline | [Code fix] |
| S15 | Blog posts are cut off from the main pages | Posts are linked only from /insights and each other; post bodies link only to /book and /contact | Add contextual links from /qhht, /faq and /book to the matching posts, and from each post to /qhht and /about | [Code fix] |
| S16 | /videos is nearly empty to search engines | Video titles load by JavaScript after the page; the crawled page has about 140 words and two identical H2s | Render the video list at build or request time with titles, dates and links, plus VideoObject schema | [Code fix] |
| S17 | /qhht repeats /faq's questions | All 10 /qhht FAQ questions are also on /faq; text similarity 0.37 against a 0.40 limit | Remove the FAQ schema from /qhht and shorten its visible block to 3 or 4 questions with a link to /faq | [Code fix] |
| S18 | Prep-guide PDFs are indexable (3 copies) | No X-Robots-Tag on any of the 3 URLs; the main one is linked site-wide via the no-JavaScript fallback | Add `X-Robots-Tag: noindex` to the PDF rules in `public/_headers` | [Code fix] |
| S19 | Spam check adds friction | Visible managed widget; submitting before it finishes shows a red error | `data-appearance="interaction-only"`; on submit without a token, show "Checking…" and wait up to 5 seconds | [Code fix] |
| S20 | No booking button in the header on phones and tablets | Header "Book a Session" hidden below 1024px; home hero secondary CTA is "Read Dodie's story" | Compact "Book" button at every width; hero secondary CTA becomes "Free 30-minute call" | [Code fix] |
| S21 | No social proof next to the $300 decision on /book | 0 testimonials on /book | Add the existing 3-quote testimonial grid between the price tiles and the paid calendar | [Code fix] |
| S22 | /book is heavy on phones | Load event at 14.0s on iPhone 13 (no throttling), 157 requests; about 1MB of YouTube player scripts | Replace the YouTube embed with a click-to-play preview | [Code fix] |
| S23 | Free guide offers no path to booking | /free-guide has 0 links to /book; success message links only to the PDF | Add "Want to talk it through first? Book a free 30-minute call" to the success message and the soft close | [Code fix] |
| S24 | Sticky bar on landing pages covers the footer disclaimer | Footer has no bottom padding; the bar stays visible after sign-up | Pad the footer on mobile; hide the bar after success | [Code fix] |
| S25 | AI receptionist line has no disclosure | 772-247-5534 is the AI receptionist; Florida requires all-party consent to record calls | Confirm the greeting says it is an AI assistant and that calls may be recorded | [Needs Mark: dashboard] |
| S26 | Quiz asks for a phone number without SMS consent wording | `QhhtQuiz.astro:83`; consent text says "reach out" only | Confirm no GHL workflow texts quiz leads; if one does, add explicit SMS consent wording | [Needs Mark: dashboard] |
| S27 | Nothing published since May 20 | 3 posts, no update dates | One real post a month from Dodie's own experience (see N12 for topics); no templated or city pages | [Needs Dodie] |

---

## 3. Nice to have

| ID | Finding | Fix | Tag |
|---|---|---|---|
| N1 | No `/llms.txt` (404) | Static `public/llms.txt` with name, one-line summary (Level 2 QHHT practitioner, in-person studio, Stuart FL, Dolores Cannon lineage), facts (about 5 hours, $300 with $50 deposit, recording included, free 30-minute call, not medical care), contact, links to key pages and posts | [Code fix] |
| N2 | Sitemap has no `lastmod` and uniform priority/changefreq | Add `lastmod` via the sitemap `serialize` option (post update or publish date; page file's last commit); drop priority and changefreq | [Code fix] |
| N3 | `/sitemap.xml` returns 404 | Add `'/sitemap.xml': '/sitemap-index.xml'` to the `LEGACY` map in `worker-entry.mjs` | [Code fix] |
| N4 | Missing share metadata | Add `og:image:alt`, `og:image:width`/`height`, `og:locale`, `article:published_time` | [Code fix] |
| N5 | Home breadcrumb schema is a single item with no URL | Remove it; consider visible breadcrumbs on inner pages | [Code fix] |
| N6 | Post byline isn't linked | Link "Dodie Kendall" to /about and add a short author box at the end of each post | [Code fix] |
| N7 | Home H2 words run together ("What clients sayafter a session.") | Add a space between the two spans in `TestimonialGrid.astro` | [Code fix] |
| N8 | Duplicate location line in the home hero ("…· Stuart, FL" eyebrow plus "QHHT in Stuart, FL") | Remove the duplicate from the eyebrow; keep the H1 line from Dodie's list | [Code fix] |
| N9 | Small tap targets (landing "Call" link 50x21, hamburger 40x40) | Make tap targets at least 44x44 | [Code fix] |
| N10 | "/free-guide: Yours in one click" is not accurate | Change to "Free guide · 4 pages · Instant" | [Code fix] |
| N11 | Unused public files and a stray screenshot | `/full-page-homepage.png` (2.3MB site screenshot) and about 7 unreferenced images are public; move them out of `public/` after confirming no GHL email links them (keep the spaced-name PDF) | [Code fix] |
| N12 | Blog topics only Dodie can write | (1) How to write your session questions, with real anonymized examples; (2) Is QHHT real? What I tell skeptics; (3) Does QHHT conflict with faith?; (4) Living with your recording, the weeks after; (5) Why I trained in Dolores Cannon's method, Level 1 to 2. About one a month, each linked from /qhht or /faq | [Needs Dodie] |
| N13 | "Theta brainwave state" stated as physiology | Attribute it ("Dolores Cannon described…") so AI summaries don't present it as established science | [Needs Dodie] |
| N14 | Dolores Cannon block doesn't name her organization | Name and link QHHT Official; optionally cite 1 or 2 of her books | [Code fix] |
| N15 | Double opt-in gives little reason to click Confirm (the PDF is handed over on the page) | Offer a confirm-only bonus (e.g. a "3 questions" worksheet) or accept fewer confirmations | [Needs Dodie] |
| N16 | Meta Lead event is browser-only | Add a server-side event with a matching event ID once the pixel is live | [Code fix] |
| N17 | No conversion analytics outside Meta | Cloudflare Web Analytics appears to be running at the edge already (`/cdn-cgi/rum` seen), but it records no conversions; decide on goal tracking (Zaraz or Plausible goals) or rely on Meta | [Needs Mark: dashboard] |
| N18 | Confirm-link endpoint triggers a GHL lookup for any well-formed request | Rate-limit `/api/confirm-optin` by IP | [Code fix] |
| N19 | Dodie's personal cell number hardcoded in server code (not exposed to browsers) | Move to a `wrangler.toml` variable | [Code fix] |
| N20 | Typos in YouTube titles shown on /videos ("Didn'tCome", "Ai is mind  You are Spirit…") | Fix the titles in YouTube | [Needs Dodie] |

---

## 4. Passed checks (no action needed)

**SEO**
- Every sitemap URL returns 200 with a matching self-canonical and no noindex.
- The 5 noindex pages are excluded from the sitemap.
- All 69 internal links and assets return 200. External links resolve.
- Slash, `/index.html` and `www` redirect in one hop.
- `lang` and viewport are set on every page.
- Every image has an alt attribute.
- Phone and "Stuart, FL" are consistent across pages and schema.
- Affiliate links use `rel="sponsored"`.
- Cache-hit response times are 0.1 to 0.24s.
- Scaled-content check: sameness, cadence, experience and network pass. Footprint is a warning, covered by S9.

**AEO**
- FAQPage on /faq (19) and /qhht (10) matches the visible text exactly.
- BlogPosting has author, image and dates.
- No rating or review schema without visible reviews (correct as is).
- Content is server-rendered, except /videos (S16).
- Every post opens with a "Quick answer" block.
- A disclaimer is on every page.

**CRO**
- The pixel stays off until a Pixel ID is set.
- The Lead event fires only on a saved lead.
- utm and fbclid values reach GHL from all three forms.
- Landing pages are noindex and light (250 to 460KB).
- No horizontal scroll and no layout shift.

**Security**
- No secrets in the live JavaScript or HTML.
- No source maps.
- `/.env`, `/.git`, `/.dev.vars`, `wrangler.toml`, `package.json`, `/_worker.js` and `/CLAUDE.md` all return 404.
- Turnstile is verified server-side, fails closed and checks the hostname.
- Honeypots and server-side validation are on every form.
- No CORS exposure and no mixed content.
- Names are escaped in email HTML.
- The free-guide endpoint has database-backed limits.

---

## 5. Question coverage for AI assistants

| Question | Where the site answers it | Quality |
|---|---|---|
| What is QHHT? | /qhht (metaphor) | Weak (M9) |
| Is QHHT safe? | Nowhere | Missing (M9) |
| How long is a session? | /faq, /qhht, /book, post | Good (one inconsistency, M5) |
| What happens in a session? | /faq, /qhht, post | Good |
| How much does it cost? | /faq, /book | Good there; missing on /qhht and home (S13) |
| Is QHHT hypnosis? | Inside another FAQ answer | Weak (M9) |
| Past-life regression vs QHHT | /faq and a dedicated post | Good |
| Who was Dolores Cannon? | /qhht | Good (N14) |
| Can QHHT heal X? | /faq answers say it is not medical treatment | Good, but contradicted by a testimonial (M6) |
| How do I prepare? | /faq and a post | Good |
| Who is Dodie? | /about narrative, home founder block | Weak (S8) |
| Credentials | Home, /faq, /qhht; not /about or schema | Weak (S8) |
| Where? | Everywhere | Good; remote is contradicted (M5) |
| How do I book? | /book | Good, but calendar cut off on phones (M2) |
| Reviews | /testimonials | Weak: no Google link or count (S9) |
