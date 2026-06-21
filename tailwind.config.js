/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Editorial / architectural system: muted earthy neutrals, restrained type,
    // material imagery does the colour work. (Structure borrowed from DESIGN.md,
    // recoloured — no Miro canary yellow / pastels.)
    extend: {
      colors: {
        // Canvas & surfaces — warm off-white paper stock
        paper: '#F5F2EC',
        surface: '#FBFAF6',
        'surface-raised': '#FFFFFF',
        sand: '#EDE8DE',

        // Ink scale (warm near-blacks → muted greys)
        ink: '#1B1812',
        graphite: '#3A352D',
        stone: '#6A645A',
        silt: '#938C7F',
        mute: '#B6AE9F',

        // Hairlines / dividers
        hairline: '#E2DCD0',
        'hairline-soft': '#ECE7DC',
        'hairline-strong': '#CFC7B8',

        // Brand accent — reclaimed clay / terracotta
        clay: '#9C5B3B',
        'clay-deep': '#7C4327',
        'clay-soft': '#E7D3C5',
        'clay-tint': '#F2E4DA',

        // Ecological accent — moss / patina green (carbon, eco capital)
        moss: '#586343',
        'moss-soft': '#DCE0CF',
        'moss-tint': '#EBEEE1',

        // Material-family swatch tints (placeholder imagery)
        family: {
          panel: '#B98A63', // terracotta / precast / stone panels
          glazing: '#8FA7A6', // glass — cool teal-grey
          substructure: '#9AA0A4', // aluminium / steel
          shading: '#A8946F', // louvres / fins / secondary
        },

        // Semantic
        success: '#4F7A52',
        warning: '#B5882E',
        danger: '#9E4A3C',
      },
      fontFamily: {
        // Editorial serif for display, grotesque sans for UI/body
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // type scale (rem)
        micro: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.06em' }],
        caption: ['0.8125rem', { lineHeight: '1.45' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        body: ['1rem', { lineHeight: '1.6' }],
        subtitle: ['1.125rem', { lineHeight: '1.55' }],
        h5: ['1.25rem', { lineHeight: '1.35' }],
        h4: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h3: ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        h2: ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h1: ['3.25rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        display: ['4.5rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '22px',
      },
      spacing: {
        section: '6rem',
        'section-lg': '9rem',
      },
      maxWidth: {
        content: '1280px',
        prose: '68ch',
      },
      boxShadow: {
        card: '0 1px 2px rgba(27, 24, 18, 0.04), 0 8px 24px -12px rgba(27, 24, 18, 0.12)',
        raised: '0 2px 4px rgba(27, 24, 18, 0.05), 0 18px 40px -16px rgba(27, 24, 18, 0.18)',
        overlay: '0 12px 48px -8px rgba(27, 24, 18, 0.28)',
      },
      letterSpacing: {
        label: '0.08em',
      },
    },
  },
  plugins: [],
};
