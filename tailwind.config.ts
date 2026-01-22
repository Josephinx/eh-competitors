import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        bg: {
          app: 'var(--color-bg-app)',
          sidebar: 'var(--color-bg-sidebar)',
          card: 'var(--color-bg-card)',
          'card-hover': 'var(--color-bg-card-hover)',
          input: 'var(--color-bg-input)',
          modal: 'var(--color-bg-modal)',
          login: 'var(--color-bg-login)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light: 'var(--color-border-light)',
          focus: 'var(--color-border-focus)',
        },
        status: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
        },
        tier: {
          core: '#F26522',
          adjacent: '#4B5563',
          contrast: 'transparent',
        },
        matrix: {
          'row-alt': 'var(--color-matrix-row-alt)',
          header: 'var(--color-matrix-header)',
          priority: 'var(--color-matrix-priority)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        sidebar: '260px',
        'sidebar-collapsed': '64px',
        header: '64px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px var(--color-shadow)',
        md: '0 4px 6px var(--color-shadow)',
        lg: '0 10px 15px var(--color-shadow)',
        modal: '0 25px 50px var(--color-shadow-heavy)',
      },
      zIndex: {
        dropdown: '100',
        sticky: '200',
        'modal-backdrop': '300',
        modal: '400',
        toast: '500',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
}

export default config
