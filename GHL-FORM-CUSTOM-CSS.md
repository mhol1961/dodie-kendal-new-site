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

## The hex values, derived from DESIGN.md tokens

These are **exact** sRGB conversions from the site's oklch tokens — not
eyeballed. If `DESIGN.md` ever changes, regenerate via the Node snippet in
the project (see commit history) and resync this file.

| Token | Hex | Used for |
|---|---|---|
| `bg-raised` | `#FDFCF8` | Form background, input background |
| `bg-sunken` | `#ECE7DF` | Disabled state, subtle dividers |
| `ink-primary` | `#221811` | Body text, input text |
| `ink-secondary` | `#584A40` | Field labels |
| `ink-muted` | `#6D6059` | Placeholder text, helper text |
| `brand-primary` | `#D55759` | Submit/Next buttons, focus accents |
| `brand-hover` | `#C13A46` | Button hover state |
| `border-subtle` | `#DCD6D1` | Input borders (default) |
| `border-strong` | `#B7ACA1` | Input borders (focused/hover) |

Body font is `'Inter'` (already correct — the site uses Inter Variable for
body, and GHL serves Inter via Google Fonts). Display font (Fraunces) is
not used inside form fields; we keep Inter throughout for legibility.

---

## Paste this exact block into GHL Custom CSS

```css
/* =========================================================================
   QHHT Quiz — site-matched skin (dodiekendall.com warm-earth palette)
   Tokens map to DESIGN.md. Do not edit hex values here directly; update
   DESIGN.md and regenerate via the project's oklch->hex script.
   ========================================================================= */

/* --- Text inputs, number, date picker --- */
#_builder-form .form-builder--item input[type=text][class=form-control],
#_builder-form .form-builder--item .date-picker-custom-style,
#_builder-form .form-builder--item input[type=number] {
  background-color: #FDFCF8 !important;
  color: #221811 !important;
  border: 1px solid #DCD6D1 !important;
  border-radius: 8px !important;
  padding: 10px 12px !important;
  box-shadow: 0 1px 2px 0 rgba(34, 24, 17, 0.05) !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  background-clip: inherit !important;
  transition: border-color 150ms ease, box-shadow 150ms ease !important;
}

/* --- Multi-line --- */
#_builder-form textarea {
  background-color: #FDFCF8 !important;
  color: #221811 !important;
  border: 1px solid #DCD6D1 !important;
  border-radius: 8px !important;
  padding: 10px 12px !important;
  box-shadow: 0 1px 2px 0 rgba(34, 24, 17, 0.05) !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  background-clip: inherit !important;
  transition: border-color 150ms ease, box-shadow 150ms ease !important;
}

/* --- Phone, email, multi-select tag wrapper --- */
#_builder-form input[type=tel],
#_builder-form input[type=email],
#_builder-form .multiselect .multiselect__tags {
  background-color: #FDFCF8 !important;
  color: #221811 !important;
  border: 1px solid #DCD6D1 !important;
  border-radius: 8px !important;
  padding: 10px 12px !important;
  box-shadow: 0 1px 2px 0 rgba(34, 24, 17, 0.05) !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  background-clip: inherit !important;
  transition: border-color 150ms ease, box-shadow 150ms ease !important;
}

/* --- Focus state on every input variant --- */
#_builder-form .form-builder--item input[type=text][class=form-control]:focus,
#_builder-form input[type=tel]:focus,
#_builder-form input[type=email]:focus,
#_builder-form input[type=number]:focus,
#_builder-form textarea:focus,
#_builder-form .multiselect .multiselect__tags:focus-within {
  outline: none !important;
  border-color: #D55759 !important;
  box-shadow: 0 0 0 3px rgba(213, 87, 89, 0.18) !important;
}

/* --- Phone country selector (intl-tel-input) --- */
#_builder-form .iti--allow-dropdown input,
#_builder-form .iti--allow-dropdown input[type=tel] {
  padding-left: 44px !important;
}
#_builder-form .countryphone { height: inherit; }
#_builder-form .multi_select_form { border-radius: 8px !important; }

/* --- Date picker / multi-select internals --- */
#_builder-form .form-builder--item .date-picker-custom-style input[type=text],
#_builder-form .form-builder--item .multiselect .multiselect__placeholder {
  padding: 0;
  background-color: #FDFCF8;
  color: #221811;
  font-size: 16px;
}
#_builder-form .form-builder--item .multiselect .multiselect__input {
  background-color: #FDFCF8 !important;
}
#_builder-form .form-builder--item .multiselect .multiselect__select {
  background: transparent;
  z-index: 10;
}
#_builder-form .form-builder--item .multiselect,
.multiselect__single {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 24px;
  color: #221811 !important;
  background-color: #FDFCF8 !important;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
}
#_builder-form .form-builder--item .multiselect__placeholder {
  padding: 0 !important;
  margin: 0 !important;
  min-height: 24px;
  color: #6D6059 !important;
  background-color: #FDFCF8 !important;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
}

/* --- Field width container --- */
#_builder-form .field-container { width: 100%; max-width: 900px; }

/* --- Placeholders, every browser flavor --- */
#_builder-form ::-webkit-input-placeholder {
  color: #6D6059;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
  opacity: 1;
}
#_builder-form ::placeholder,
.signature-placeholder {
  color: #6D6059 !important;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
}
#_builder-form :-ms-input-placeholder,
#_builder-form ::-ms-input-placeholder {
  color: #6D6059 !important;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 400;
}
#_builder-form .input-icon { color: #6D6059; }

/* --- Labels --- */
#_builder-form label,
#_builder-form label * {
  color: #584A40 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  letter-spacing: 0.02em !important;
}
#_builder-form .text-element * {
  color: inherit;
  font-family: 'Inter', system-ui, sans-serif;
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
  color: #FDFCF8 !important;
  border: none !important;
  border-radius: 999px !important;        /* matches site's rounded-pill */
  padding: 12px 28px !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-size: 15px !important;
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
  box-shadow: 0 1px 3px 0 rgba(34, 24, 17, 0.10) !important;
  cursor: pointer !important;
  transition: background-color 150ms ease, box-shadow 150ms ease, transform 100ms ease !important;
}
#_builder-form .form-builder--btn-submit .btn:hover,
#_builder-form .button-element:hover,
#_builder-form .btn.btn-dark:hover {
  background-color: #C13A46 !important;
  box-shadow: 0 4px 12px 0 rgba(193, 58, 70, 0.25) !important;
}
#_builder-form .form-builder--btn-submit .btn:active,
#_builder-form .button-element:active {
  transform: translateY(1px) !important;
}
#_builder-form .form-builder--btn-submit .btn:focus-visible,
#_builder-form .button-element:focus-visible {
  outline: none !important;
  box-shadow: 0 0 0 3px #FDFCF8, 0 0 0 5px #B54C3A !important;
}

/* --- Loading state on submit --- */
#_builder-form .loader-submit {
  background-color: #C13A46 !important;
  color: #FDFCF8 !important;
}

/* --- Heading element inside quiz steps (question prompts) --- */
#_builder-form .heading-element,
#_builder-form .heading-element * {
  color: #221811 !important;
  font-family: 'Inter', system-ui, sans-serif !important;
  font-weight: 600 !important;
  letter-spacing: -0.01em !important;
}

/* --- Form wrapper bg (the surface behind everything) --- */
#_builder-form,
.hl_form-builder--main-full,
.hl_form-builder--main,
.hl_wrapper--inner-full,
.hl_wrapper--inner.form-builder {
  background-color: #FDFCF8 !important;
}

/* --- Product/order summary text (only if a paywall step is added later) --- */
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
#_builder-form .form-field-wrapper { margin-bottom: 14px !important; }
```

---

## After pasting, sanity-check these in the live form:

1. **Inputs** — bg `#FDFCF8`, border `#DCD6D1`, text `#221811`, focused with a soft coral ring.
2. **Labels** — `#584A40`, slightly smaller (14px) and uppercased-leaning weight.
3. **Placeholders** — `#6D6059`, lighter weight.
4. **Submit / Next button** — coral `#D55759`, pill shape, hover deepens to `#C13A46` with a soft glow.
5. **Quiz step headings** — warm near-black `#221811`, slightly tighter letter-spacing.

If any element still looks off, screenshot it and tell me the selector or
visual area — most likely GHL emits a class I didn't see in the static HTML
(some quiz components only render after a step click). I'll add a rule.

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
  it when this CSS gets the same visual result for a quiz.
