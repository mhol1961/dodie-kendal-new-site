# Auto-send the QHHT Prep Guide on Booking — GHL Workflow Setup

## What this does

When someone books a session on Dodie's GHL calendar (from /book), GHL
automatically sends them an email that includes the QHHT Subject
Preparation Guide. No manual step — it fires the moment the appointment
is confirmed.

The PDF lives at: `https://dodiekendall.com/QHHT-Subject-Preparation-Guide-1.pdf`
(public URL once DNS cuts over; until then, the Cloudflare Workers
preview URL works the same way).

The booking page also shows a "Preview the prep guide" callout below the
calendar — so anyone who wants to read it before booking can. Same PDF.

---

## The two ways to send it — pick one

### Option 1 (Recommended) — Link in the email body

The email contains a button/link that downloads the PDF from the website.

**Pros:**
- Email stays small → better deliverability, less likely to land in spam.
- The PDF is always the latest version — update the file in the repo and
  every future email links to the new version automatically.
- Clicks are trackable in GHL (the email click report shows who downloaded
  the guide).
- Dodie doesn't have to re-upload to GHL each time the guide is revised.

**Cons:**
- Requires the contact to click. ~5–10% of users won't.

### Option 2 — Attach the PDF directly to the email

GHL Media Library hosts the PDF; the workflow attaches it on send.

**Pros:**
- One-click — the PDF sits in their inbox as an attachment.
- Works offline (they can open the email-attached file later without internet).

**Cons:**
- Larger email payload (1 MB attachment) → slightly worse deliverability.
- If Dodie updates the guide, the file in GHL Media Library has to be
  re-uploaded; old workflows still point at the old version unless edited.
- Some corporate email filters strip or block PDF attachments.

**My take:** Go with Option 1 for production. Cleaner, more maintainable,
trackable. If a specific client says "I never got the attachment," send
a one-off email manually with the attached version.

---

## Setup steps in GHL (Option 1 — link in email)

1. **Log in to Dodie's GHL subaccount** (the one that owns
   `links.guidingwinds-unplug.com`).

2. **Navigate to Automation → Workflows** in the left sidebar.

3. **Create a new workflow:**
   - Click **+ Create Workflow** → **Start from Scratch**.
   - Name it: `QHHT — Booking Confirmation + Prep Guide`.
   - Click **Build Workflow**.

4. **Add the trigger:**
   - Click **+ Add New Trigger**.
   - Trigger type: **Calendar — Appointment Status**.
   - Filter: **In Calendar = [Dodie's QHHT 5-hour calendar]** (whichever
     calendar the /book page is pointing at — same GHL_CALENDAR_ID from
     the env vars).
   - Filter: **Appointment Status = Confirmed** (this fires the moment
     GHL confirms the booking; "Booked" works too but "Confirmed" filters
     out test/pending states).
   - Click **Save Trigger**.

5. **Add a "Send Email" action:**
   - Click the **+** below the trigger.
   - Choose **Send Email**.
   - **From Name:** Dodie Kendall
   - **From Email:** dodiekendall@gmail.com (or her verified sending
     address — whichever GHL has authenticated in Settings → Email Services).
   - **Subject:** `Your QHHT session is confirmed — here's your prep guide`
     (or whatever fits Dodie's voice).
   - **Body:** Use the email template below. Customize freely.

6. **Save and Publish:**
   - Top-right: toggle the workflow from **Draft** to **Publish**.
   - Confirm "All future" enrollment so new bookings trigger it.
   - **Important:** GHL workflows do NOT fire retroactively. Anyone who
     booked before you published this workflow won't receive the email —
     send those manually one-time, or use the **Test Workflow** button on
     a specific contact.

7. **Test it:**
   - Open the booking page in an incognito window.
   - Book a real (or test) slot.
   - Verify the email arrives within ~30 seconds.
   - Click the PDF link in the email — should download the prep guide.

---

## Email body template (paste into the Send Email body field)

```
Hi {{contact.first_name}},

Your QHHT session is confirmed for {{appointment.start_time}} — I'm
looking forward to working with you.

Before our session, please take a few minutes to read through the prep
guide. It walks you through what to expect, what to wear, what to eat
(and not eat) the day-of, and a short list of three questions to start
thinking about. You don't have to memorize anything — just be familiar.

→ Download the prep guide: https://dodiekendall.com/QHHT-Subject-Preparation-Guide-1.pdf

Two days before your session I'll send a brief follow-up with your three
questions in writing. The morning of the session I'll send a quick
check-in text.

If you have any questions in the meantime, just reply to this email.

Looking forward to it,
Dodie
```

GHL merge tags used:
- `{{contact.first_name}}` — auto-fills from the contact record
- `{{appointment.start_time}}` — auto-fills from the booked appointment

Both are standard GHL tags; they'll resolve to the real values at send time.

---

## Setup steps in GHL (Option 2 — attach PDF directly)

Only do this if you decide against Option 1.

1. **Upload the PDF to GHL Media Library:**
   - Sidebar → **Media** → **Upload**.
   - Upload `QHHT-Subject-Preparation-Guide-1.pdf` from your computer.
   - Note the file ID or URL GHL assigns it.

2. **Build the workflow as above (steps 1–4).**

3. **In the Send Email action:**
   - Body: same template, but remove the download link line.
   - At the bottom of the email composer, click **Attach File** →
     select the prep guide from Media Library.
   - Save.

4. **Remember:** If Dodie updates the prep guide later, she needs to
   re-upload the new version to Media Library AND edit this workflow's
   attachment to point at the new file. Otherwise it keeps sending the
   old PDF forever.

---

## What to bring up on tonight's call with Dodie

1. **Which option?** (recommend Option 1 — link in email)
2. **Confirm the from-email is verified** in GHL (otherwise email lands in
   spam — GHL → Settings → Email Services → Domain authentication).
3. **Does she want SMS too?** GHL can also fire a confirmation SMS via the
   same workflow — add a **Send SMS** action after the email. Short and
   sweet: "Hey {{contact.first_name}} — confirmed for {{appointment.start_time}}.
   Just emailed you the prep guide. Reply with any questions. — Dodie"
4. **Does she want a reminder email** 2 days before the session with the
   three questions? Easy to add as a **Wait Until X days before
   appointment** step in the same workflow. (Currently the booking page
   step 02 says "Your three questions — Two days before your session I'll
   send a short note..." — automating that closes the loop.)

---

## Once the workflow is live, watch for:

- **First few real bookings** — check the workflow execution log in GHL
  to confirm the email actually went out.
- **Spam folder** — ask the first few clients to check spam if they don't
  see the confirmation. If multiple report spam, Dodie's sending-domain
  authentication may need a tighter SPF/DKIM setup.
- **Click-through rate** on the PDF link (Option 1 only) — GHL reports
  this under the workflow's analytics. If <50% click, consider adding the
  link more prominently or switching to Option 2.
