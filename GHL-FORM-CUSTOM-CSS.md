# QHHT Quiz — GHL Form Builder Custom CSS

Paste the CSS below into the GHL form builder for the **QHHT Quiz** form to
make it match dodiekendall.com.

**Where it goes (GHL UI):**
Sites → Forms → **QHHT Quiz** → ⚙️ Settings → **Styles & Options** → **Custom CSS**.
(In some GHL builds it's labeled "Custom Style" or sits under the form's
"Style" tab. The slot accepts plain CSS; GHL injects it into the form's
`<head>` at render time, which is the *only* way to style cross-origin
iframe contents.)

After pasting, click **Save** in GHL, then hard-refresh the contact page on
the site (Ctrl/Cmd-Shift-R) to see the change. The site's existing iframe
wrapper (rounded card, soft border, raised bg) stays the same — this CSS
restyles the form's *internals*.

---

## Why v2 (2026-06-02)

**v1 problem:** Field background `#FDFCF8` (rgb 253, 252, 248) is visually
indistinguishable from pure white. The CSS was loading and winning the
cascade — the value itself was just too subtle to register. On the site,
that color works because warm-near-white cards sit against a warm-cream
page background; inside the GHL iframe there's no page context, so the
fields looked stock white.

**v2 fix — paper-on-cream-card aesthetic:**
- **Form wrapper** takes the obviously warm cream (`#ECE7DF`).
- **Fields stay crisp white** — they read as clean writing surfaces sitting
  ON the cream card.
- **Borders** bump from `#DCD6D1` (subtle) to `#B7ACA1` (visible warm tan),
  with thickness 1.5px so they show without being heavy.
- **Multi-select dropdown chevron** + terms checkboxes pick up the brand
  coral accent.
- Stronger focused-field glow so click states feel intentional.

If the new look feels too cream-heavy, the dial to turn is the form-wrapper
background — drop it to `#F3EFE8` (between bg-base and bg-sunken) or back
to white for a more minimal look.

---

## The hex values, derived from DESIGN.md tokens

These are **exact** sRGB conversions from the site's oklch tokens — not
eyeballed. If `DESIGN.md` ever changes, regenerate via the Node snippet in
the project (see commit history) and resync this file.

| Token | Hex | Used for in v2 |
|---|---|---|
| `bg-base` | `#F8F5EF` | (held in reserve for fallback) |
| `bg-sunken` | `#ECE7DF` | **Form wrapper background** (cream card) |
| `bg-raised` | `#FDFCF8` | Hover/focus subtle backgrounds |
| Pure white | `#FFFFFF` | **Field/input interiors** (paper on cream) |
| `ink-primary` | `#221811` | Body text, input text |
| `ink-secondary` | `#584A40` | Field labels |
| `ink-muted` | `#6D6059` | Placeholder text, helper text |
| `brand-primary` | `#D55759` | **Submit + Next buttons, focus glow, chevron, checkboxes** |
| `brand-hover` | `#C13A46` | Button hover state |
| `border-subtle` | `#DCD6D1` | Subtle dividers between sections |
| `border-strong` | `#B7ACA1` | **Input borders (visible warm tan)** |

Body font is `'Inter'` (already correct — the site uses Inter Variable for
body, and GHL serves Inter via Google Fonts). Display font (Fraunces) is
not used inside form fields; we keep Inter throughout for legibility.

---

## Paste this exact block into GHL Custom CSS

> ⚠️ **Replace any existing CSS in the slot** with this block. If you append
> instead of replace, both blocks render and you get the cascade fight that
> caused v1 to look subtle.

```css
/* =========================================================================
   QHHT Quiz — site-matched skin v2 (dodiekendall.com warm-earth palette)
   Tokens map to DESIGN.md. Do not edit hex values here directly; update
   DESIGN.md and regenerate via the project's oklch->hex script.
   v2: white fields on cream-card wrapper, visible warm-tan borders, brand
       coral accents on chevrons + checkboxes.
   ========================================================================= */

/* --- Form wrapper / surface --- */
/* Make the form's container obviously warm cream so white fields read */
#_builder-form,
.hl_form-builder--main-full,
.hl_form-builder--main,
.hl_wrapper--inner-full,
.hl_wrapper--inner.form-builder,
.form-builder--wrap,
body {
  background-color: #ECE7DF !important;
}

/* Inner form-builder padding — a little air around the fields */
.hl_form-builder--main {
  padding: 36px 24px !important;
}

/* The white "card" the actual fields sit inside */
#_builder-form .form-builder--wrap {
  background-color: #ECE7DF !important;
  box-shadow: none !important;
  border: none !important;
}

/* --- Text inputs, number, date picker --- */
#_builder-form .form-builder--item input[type=text][class=form-control],
#_builder-form .form-builder--item .date-picker-custom-style,
#_builder-form .form-builder--item input[type=number] {
  background-color: #FFFFFF !important;
  color: #221811 !important;
  border: 1.5px solid #B7ACA1 !important;
  border-radius: 8px !important;
  padding: 11px 14px !important;
  box-shadow: 0 1px 2px 0 rgba(34, 24, 17, 0.04) !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  background-clip: inherit !important;
  transition: border-color 150ms ease, box-shadow 150ms ease !important;
}

/* --- Multi-line --- */
#_builder-form textarea {
  background-color: #FFFFFF !important;
  color: #221811 !important;
  border: 1.5px solid #B7ACA1 !important;
  border-radius: 8px !important;
  padding: 11px 14px !important;
  box-shadow: 0 1px 2px 0 rgba(34, 24, 17, 0.04) !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  background-clip: inherit !important;
  transition: border-color 150ms ease, box-shadow 150ms ease !important;
  min-height: 96px !important;
}

/* --- Phone, email, multi-select tag wrapper --- */
#_builder-form input[type=tel],
#_builder-form input[type=email],
#_builder-form .multiselect .multiselect__tags {
  background-color: #FFFFFF !important;
  color: #221811 !important;
  border: 1.5px solid #B7ACA1 !important;
  border-radius: 8px !important;
  padding: 11px 14px !important;
  box-shadow: 0 1px 2px 0 rgba(34, 24, 17, 0.04) !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  background-clip: inherit !important;
  transition: border-color 150ms ease, box-shadow 150ms ease !important;
}

/* --- Focus state on every input variant — coral glow --- */
#_builder-form .form-builder--item input[type=text][class=form-control]:focus,
#_builder-form input[type=tel]:focus,
#_builder-form input[type=email]:focus,
#_builder-form input[type=number]:focus,
#_builder-form textarea:focus,
#_builder-form .form-control:focus,
#_builder-form .form-control:active:focus,
#_builder-form .multiselect .multiselect__tags:focus-within {
  outline: none !important;
  border-color: #D55759 !important;
  background-color: #FFFFFF !important;
  box-shadow: 0 0 0 3px rgba(213, 87, 89, 0.20) !important;
}

/* --- Phone country selector (intl-tel-input) --- */
#_builder-form .iti--allow-dropdown input,
#_builder-form .iti--allow-dropdown input[type=tel] {
  padding-left: 48px !important;
}
#_builder-form .countryphone { height: inherit; }
#_builder-form .multi_select_form { border-radius: 8px !important; }

/* --- Date picker / multi-select internals --- */
#_builder-form .form-builder--item .date-picker-custom-style input[type=text],
#_builder-form .form-builder--item .multiselect .multiselect__placeholder {
  padding: 0 !important;
  background-color: #FFFFFF !important;
  color: #221811 !important;
  font-size: 16px !important;
}
#_builder-form .form-builder--item .multiselect .multiselect__input {
  background-color: #FFFFFF !important;
  color: #221811 !important;
}
#_builder-form .form-builder--item .multiselect .multiselect__select {
  background: transparent !important;
  z-index: 10;
}
/* Multi-select dropdown chevron — color the arrow brand coral */
#_builder-form .multiselect__select::before {
  border-color: #D55759 transparent transparent !important;
}
#_builder-form .form-builder--item .multiselect,
.multiselect__single {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 24px;
  color: #221811 !important;
  background-color: #FFFFFF !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
}
#_builder-form .form-builder--item .multiselect__placeholder {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 24px;
  color: #6D6059 !important;
  background-color: #FFFFFF !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
}
/* Multi-select dropdown panel (the list that pops on click) */
#_builder-form .multiselect__content-wrapper {
  background-color: #FFFFFF !important;
  border: 1.5px solid #B7ACA1 !important;
  border-top: none !important;
  border-radius: 0 0 8px 8px !important;
  box-shadow: 0 8px 24px -8px rgba(34, 24, 17, 0.15) !important;
}
#_builder-form .multiselect__option {
  color: #221811 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  padding: 10px 14px !important;
}
#_builder-form .multiselect__option--highlight {
  background-color: rgba(213, 87, 89, 0.10) !important;
  color: #221811 !important;
}
#_builder-form .multiselect__option--selected {
  background-color: rgba(213, 87, 89, 0.20) !important;
  color: #221811 !important;
  font-weight: 500 !important;
}

/* --- Field width container --- */
#_builder-form .field-container {
  width: 100% !important;
  max-width: 900px !important;
}

/* --- Placeholders, every browser flavor --- */
#_builder-form ::-webkit-input-placeholder {
  color: #6D6059 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  opacity: 1 !important;
}
#_builder-form ::placeholder,
.signature-placeholder {
  color: #6D6059 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
}
#_builder-form :-ms-input-placeholder,
#_builder-form ::-ms-input-placeholder {
  color: #6D6059 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
}
#_builder-form .input-icon { color: #6D6059 !important; }

/* --- Labels --- */
#_builder-form label,
#_builder-form .label-alignment,
#_builder-form .field-label {
  color: #584A40 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.02em !important;
  margin-bottom: 6px !important;
}
#_builder-form label * {
  color: #584A40 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
}
#_builder-form .text-element * {
  color: inherit !important;
  font-family: 'Inter', system-ui, sans-serif !important;
}
#_builder-form .short-label {
  color: #6D6059 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 12px !important;
  font-weight: 400 !important;
  -webkit-font-smoothing: auto;
}

/* --- Buttons: submit, Next, Back, generic --- */
#_builder-form .form-builder--btn-submit .btn,
#_builder-form .button-element,
#_builder-form .btn.btn-dark {
  background-color: #D55759 !important;
  color: #FFFFFF !important;
  border: none !important;
  border-radius: 999px !important;
  padding: 13px 32px !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
  box-shadow: 0 2px 6px 0 rgba(34, 24, 17, 0.12) !important;
  cursor: pointer !important;
  transition: background-color 150ms ease, box-shadow 150ms ease, transform 100ms ease !important;
  min-width: 160px !important;
}
#_builder-form .form-builder--btn-submit .btn:hover,
#_builder-form .button-element:hover,
#_builder-form .btn.btn-dark:hover {
  background-color: #C13A46 !important;
  box-shadow: 0 6px 16px 0 rgba(193, 58, 70, 0.28) !important;
}
#_builder-form .form-builder--btn-submit .btn:active,
#_builder-form .button-element:active {
  transform: translateY(1px) !important;
}
#_builder-form .form-builder--btn-submit .btn:focus-visible,
#_builder-form .button-element:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 3px #ECE7DF, 0 0 0 5px #B54C3A !important;
}

/* --- Loading state on submit --- */
#_builder-form .loader-submit {
  background-color: #C13A46 !important;
  color: #FFFFFF !important;
}

/* --- Heading element (question prompts inside the form) --- */
#_builder-form .heading-element,
#_builder-form .heading-element * {
  color: #221811 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.01em !important;
}

/* --- Terms & conditions checkboxes (the two consent boxes) --- */
#_builder-form input[type=checkbox],
#_builder-form input[type=radio] {
  accent-color: #D55759 !important;
  width: 18px !important;
  height: 18px !important;
  cursor: pointer !important;
}
#_builder-form .checkbox-container {
  display: flex !important;
  align-items: flex-start !important;
  gap: 10px !important;
  padding: 8px 0 !important;
}
#_builder-form .terms-text-container,
#_builder-form .terms-and-conditions {
  color: #584A40 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 13px !important;
  line-height: 1.55 !important;
}

/* --- Product / order summary text (only if a paywall step is added later) --- */
#_builder-form .product-summary-amount-large,
#_builder-form .product-summary-amount-normal,
#_builder-form .product-summary-label-bold,
#_builder-form .product-summary-label-large,
#_builder-form .product-summary-label-normal,
#_builder-form .product-summary-label-small,
#_builder-form .crossed-amount,
#_builder-form .variant-tag {
  color: #221811 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
}

/* --- Subtle row separation between fields --- */
#_builder-form .form-field-wrapper { margin-bottom: 16px !important; }

/* --- Validation error text --- */
#_builder-form .validation-error,
#_builder-form .error {
  color: #B54C3A !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}
```

---

## After pasting, sanity-check these in the live form:

1. **Form sits on warm cream** (`#ECE7DF`) — clearly different from white.
2. **Field interiors are crisp white** — looks like writing paper on cream.
3. **Field borders are visible warm tan** (`#B7ACA1`) — you should see them at a glance.
4. **Click into a field** — border turns brand coral with a soft 3px glow.
5. **Submit button** — coral pill, bigger feel than v1 (160px min-width).
6. **Terms checkboxes** — coral accent when checked (was default blue).
7. **Multi-select chevron arrow** — should pick up coral (was default grey).
8. **Multi-select dropdown panel** — when you click the "What's drawing you to QHHT?" dropdown, the panel should have white bg, tan border, and hovering an option should tint it soft coral.

If any element still looks off, screenshot it and tell me what step in the
quiz you're on. The only classes I can't see from outside are anything
rendered conditionally after a user interaction (validation errors,
submit success state, conditional question variants); send those when they
appear and I'll add the missing selectors.

---

## Why this approach beats alternatives

- **Cross-origin iframe content can't be styled from the parent page.** The
  browser blocks `iframe.contentDocument` access between different origins.
- GHL's form builder has a Custom CSS slot **specifically because** of this
  — they inject the CSS into the iframe's `<head>` from inside, where the
  same-origin rule doesn't apply.
- The alternative — fully reimplementing the quiz as native Astro markup
  posting to GHL's submission endpoint — works for flat contact forms but
  requires rebuilding multi-step branching/scoring logic by hand. Not worth
  it when this CSS gets the same visual result.
