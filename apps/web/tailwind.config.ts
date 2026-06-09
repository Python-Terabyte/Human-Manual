import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     '#0A0A0F',
          surface:  '#12121A',
          elevated: '#1C1C28',
          overlay:  '#24243A',
        },
        primary: {
          '400': '#818CF8',
          '500': '#6366F1',
          '600': '#4F46E5',
        },
        secondary: {
          '400': '#FB923C',
          '500': '#F97316',
          '600': '#EA580C',
        },
        accent: {
          '400': '#22D3EE',
          '500': '#06B6D4',
        },
        border: {
          subtle:  'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.10)',
          strong:  'rgba(255,255,255,0.20)',
        },
      },
      fontFamily: {
        display: ['var(--font-cal)', 'Inter', 'system-ui', 'sans-serif'],
        body:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)',
        'gradient-hero':    'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
        'gradient-orange':  'linear-gradient(135deg, #F97316 0%, #EC4899 100%)',
        'gradient-dark':    'linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)',
        'glow-primary':     'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-sm':    '0 0 20px rgba(99,102,241,0.2)',
        'glow-md':    '0 0 40px rgba(99,102,241,0.3)',
        'glow-lg':    '0 0 80px rgba(99,102,241,0.4)',
        'glow-cyan':  '0 0 40px rgba(6,182,212,0.25)',
        'card':       '0 4px 24px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.2)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'gradient':   'gradient 8s ease infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.2)' },
          '50%':      { boxShadow: '0 0 60px rgba(99,102,241,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
