/** @type {import('tailwindcss').Config} */
//
// Tokens here mirror src/styles/global.css and DESIGN.md.
// When a token changes, update DESIGN.md first, then global.css, then here.
//
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: ['class'], // we don't ship a dark mode at launch, but keep the door open
  theme: {
    extend: {
      colors: {
        // Background layers
        'bg-base':     'oklch(var(--bg-base) / <alpha-value>)',
        'bg-raised':   'oklch(var(--bg-raised) / <alpha-value>)',
        'bg-sunken':   'oklch(var(--bg-sunken) / <alpha-value>)',
        // Ink
        'ink':         'oklch(var(--ink-primary) / <alpha-value>)',
        'ink-secondary':'oklch(var(--ink-secondary) / <alpha-value>)',
        'ink-muted':   'oklch(var(--ink-muted) / <alpha-value>)',
        'ink-inverse': 'oklch(var(--ink-inverse) / <alpha-value>)',
        // Brand
        'brand':       'oklch(var(--brand-primary) / <alpha-value>)',
        'brand-hover': 'oklch(var(--brand-primary-hover) / <alpha-value>)',
        'accent':      'oklch(var(--brand-accent) / <alpha-value>)',
        'sage':        'oklch(var(--brand-sage) / <alpha-value>)',
        // Semantic
        'success':     'oklch(var(--success) / <alpha-value>)',
        'warning':     'oklch(var(--warning) / <alpha-value>)',
        'error':       'oklch(var(--error) / <alpha-value>)',
        'info':        'oklch(var(--info) / <alpha-value>)',
        // Borders
        'border-subtle':'oklch(var(--border-subtle) / <alpha-value>)',
        'border-strong':'oklch(var(--border-strong) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Cormorant', 'Georgia', 'serif'],
        body:    ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // matches DESIGN.md scale
        '2xs': ['0.6875rem', { lineHeight: '1.4' }],
        'xs':  ['0.75rem',   { lineHeight: '1.4' }],
        'sm':  ['0.875rem',  { lineHeight: '1.5' }],
        'base':['1rem',      { lineHeight: '1.65' }],
        'lg':  ['1.125rem',  { lineHeight: '1.65' }],
        'xl':  ['1.25rem',   { lineHeight: '1.5' }],
        '2xl': ['1.5rem',    { lineHeight: '1.35' }],
        '3xl': ['1.875rem',  { lineHeight: '1.25' }],
        '4xl': ['2.5rem',    { lineHeight: '1.15' }],
        '5xl': ['3.5rem',    { lineHeight: '1.1' }],
        '6xl': ['5rem',      { lineHeight: '1.05' }],
        '7xl': ['6.5rem',    { lineHeight: '1' }],
      },
      borderRadius: {
        'sm':   '0.375rem',
        'md':   '0.75rem',
        'lg':   '1.25rem',
        'xl':   '2rem',
        'pill': '4rem',
      },
      spacing: {
        'section':    '6rem',
        'section-sm': '4rem',
        'prose':      '1.25rem',
      },
      boxShadow: {
        'sm':   '0 1px 2px 0 oklch(0.25 0.02 60 / 0.05)',
        'md':   '0 4px 12px -2px oklch(0.25 0.02 60 / 0.08)',
        'lg':   '0 12px 32px -6px oklch(0.25 0.02 60 / 0.12)',
        'glow': '0 0 0 1px oklch(0.55 0.14 32 / 0.25), 0 8px 24px -8px oklch(0.55 0.14 32 / 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '250ms',
        'slow': '450ms',
      },
      transitionTimingFunction: {
        'standard':   'cubic-bezier(0.2, 0, 0, 1)',
        'decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      maxWidth: {
        'prose': '65ch',
      },
      backgroundImage: {
        'sunrise': 'linear-gradient(135deg, oklch(var(--bg-gradient-from)) 0%, oklch(var(--bg-gradient-to)) 100%)',
      },
    },
  },
  plugins: [],
};
