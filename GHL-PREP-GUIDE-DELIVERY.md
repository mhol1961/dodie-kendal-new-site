# Prep-Guide Auto-Delivery — build spec

> **Goal (from Dodie, 2026-06-17):** Automatically email the QHHT Pre-session
> Integration Guide to anyone who **books a session** or signs up for the
> **Inner Activation Value Stack**, with no manual step.
>
> This doc is the build-ready spec: paste-ready email copy + the exact GHL
> workflow changes. Pair with `GHL-INTEGRATION.md` and `ENV.md`.

---

## 1. Decisions locked (2026-06-17)

| Decision | Choice |
| --- | --- |
| **Timing** | Both — deliver immediately on booking **and** a gentle reminder ~2 days before the session. Implement by **modifying Dodie's existing automations**, not building parallel ones. |
| **Value Stack trigger** | A **tag** applied by the Value Stack form / questionnaire submission (e.g. `inner-activation`). Workflow triggers on *tag added*. |
| **Greeting** | **Personalize in the email** (`{{contact.first_name}}`); ship a **generic PDF**. The PDF currently hardcodes "Welcome, John!" — Dodie to re-export from Canva with **"Welcome, beautiful soul!"** (already used in an earlier version per the file metadata). |
| **PDF delivery** | **Link**, not attachment (better inbox deliverability). Hosted on the site. |

## 2. The hosted guide

- File: `public/dodie/qhht-pre-session-prep-guide.pdf` (renamed from the
  space-filled original so the URL is clean).
- Public URL after deploy: **`https://dodiekendall.com/dodie/qhht-pre-session-prep-guide.pdf`**
- ⚠️ Replace this file with Dodie's re-exported **generic** version (no "John")
  before launch. Same filename = no other change needed.

## 3. Workflow changes (in Dodie's QHHT subaccount only — `6pOamCMOsrYqjbufLI5y`)

> ⚠️ **API limitation (verified 2026-06-17):** GHL's public API is read-only for
> workflows (no detail/step endpoint — returns 404), and the experimental CLI can
> only *create new* workflows, not edit existing ones. **Editing the steps of an
> existing workflow must be done in the GHL UI.** Since the plan is to modify
> existing automations (to avoid duplicate emails), these edits are UI edits.

### Relevant existing workflows (live, pulled 2026-06-17)

| Workflow | ID | Status | Role |
| --- | --- | --- | --- |
| **QHHT Deposit & Prep** | `b853c622-bc90-4c89-942d-be55def4a349` | published | **Primary target** — likely already sends prep info post-booking |
| QHHT Appointment Confirmation | `7b506f41-a7fe-43ff-ab20-cbe0be6b24db` | published | Confirmation email on booking |
| Calendar Booking DK QHHT | `088116af-e3d6-4ed6-9559-93e1159833e5` | published | Booking trigger |
| Questionnaire submitted (removes from reminder) | `461e844e-eac9-4c81-9369-c29e283bebe5` | draft | **Value Stack path** — fires on questionnaire submit |
| Appointment Reminders - No-Fluff Template | `e9558eb3-e861-49c4-8b7c-4975859f252d` | draft | Candidate home for the 2-day reminder |

Booking calendar: **`BMH5KWMN8ncgnlLupep5`** — "Dodie Kendall QHHT Hypnotherapy Book a Session".

### Path A — Booking
1. Open **QHHT Deposit & Prep** in the GHL UI. **If it already sends a prep
   guide**, just update the link/attachment to the hosted URL in §2 — done.
   Otherwise add an **email step** sending **Email 1** (below) after the existing
   confirmation email.
2. For the ~2-day-before reminder, add a **Wait until 2 days before appointment**
   step + **Email 2**, or fold it into the existing reminder workflow.

### Path B — Inner Activation Value Stack
1. Trigger: **Contact tag added = `inner-activation`** (applied by the Value
   Stack form / questionnaire submission) — or add an email step to the existing
   **Questionnaire submitted** workflow.
2. Send **Email 1** (same guide). No appointment date exists for this path, so
   **skip the 2-day reminder** unless/until a session is also booked.

> If a contact both books *and* buys the stack, dedupe by gating Email 1 on a
> "guide already sent" tag (`prep-guide-sent`) so they don't get it twice.

---

## 4. Paste-ready email copy

Merge field: `{{contact.first_name}}`. Voice per `BRAND-VOICE.md` (warm,
second-person, gentle — not hype-y). Link button → the hosted PDF URL above.

### Email 1 — on booking / on Value Stack signup

**Subject:** Your guide for what's ahead
**Preview text:** A few gentle ways to prepare before we meet.

```
Welcome, {{contact.first_name}}.

You've taken a real step toward your own self-discovery — and I'm glad
you're coming in.

Before we meet, I've put together a short Pre-session Integration Guide.
It walks you through a few gentle ways to prepare: how to settle your
energy, how to shape the questions you'd like to bring, and what to expect
on the day. None of it is heavy. Most of it you can do in the days leading
up to your session.

  →  Read your Pre-session Integration Guide
     (button → https://dodiekendall.com/dodie/qhht-pre-session-prep-guide.pdf)

One small piece of homework: somewhere quiet, write down three to five
questions you'd like to ask your Higher Self. Bring them with you. We'll
go through them together.

There's nothing you need to get "right" here. Come as you are.

With warmth,
Dodie

—
QHHT is a complementary practice, not medical or psychological treatment.
It does not diagnose, treat, cure, or prevent any condition.
```

### Email 2 — ~2 days before the session (booking path only)

**Subject:** A gentle check-in before your session
**Preview text:** Your questions, a little rest, and what to expect.

```
Hi {{contact.first_name}},

Your session is almost here. A few small things help it land well:

  •  Drink plenty of water over the next couple of days.
  •  Eat light, and ease off caffeine and alcohol the day before.
  •  Get good sleep the night before — a rested mind is more open.
  •  Finish your three to five questions and bring them with you.

If you'd like to revisit the full guide, it's here:

  →  Read the Pre-session Integration Guide
     (button → https://dodiekendall.com/dodie/qhht-pre-session-prep-guide.pdf)

You don't need to prepare perfectly. Trust the process — your experience
will be exactly what you need it to be. See you soon.

With warmth,
Dodie

—
QHHT is a complementary practice, not medical or psychological treatment.
It does not diagnose, treat, cure, or prevent any condition.
```

---

## 5. What's needed to finish (blockers)

1. **Dodie's QHHT Private Integration Token** — *not* in the repo
   (`GHL_PRIVATE_INTEGRATION_TOKEN` is empty in `.dev.vars`; it lives only as a
   Cloudflare Secret, which is write-only). Paste it into `.dev.vars` (or hand it
   over) so the existing workflows can be listed and modified programmatically.
2. **Firebase refresh token** (`GHL_FIREBASE_REFRESH_TOKEN`) — only if we end up
   *editing workflow internals* via the experimental API. The public API is
   read-only for workflows; the *Appointment booked* trigger config may still
   require a one-time touch in the GHL UI.
3. **Generic PDF re-export** from Dodie (drop "John" → "Welcome, beautiful soul!").
4. **Confirm the Value Stack tag name** the form/questionnaire applies
   (assumed `inner-activation`).
5. **Calendar ID** (`GHL_CALENDAR_ID`) for verifying the booking trigger targets
   the right calendar.

---

*Last updated: 2026-06-17.*
