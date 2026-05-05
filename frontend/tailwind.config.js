/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        cyber: {
          bg: 'hsl(var(--cyber-bg))',
          surface: 'hsl(var(--cyber-surface))',
          green: 'hsl(var(--cyber-green))',
          red: '#ff003c',
          amber: '#ff9f1c',
          blue: '#00f0ff',
        },
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(57,255,20,0.4)' },
          '50%': { boxShadow: '0 0 18px 6px rgba(57,255,20,0.5)' },
        },
        'pulse-crit': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(255,0,60,0.5)' },
          '50%': { boxShadow: '0 0 22px 8px rgba(255,0,60,0.7)' },
        },
        'scan': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        'flicker': {
          '0%,100%': { opacity: 1 },
          '47%': { opacity: 1 },
          '48%': { opacity: 0.7 },
          '49%': { opacity: 1 },
          '78%': { opacity: 0.85 },
          '79%': { opacity: 1 },
        },
        'arc-flow': {
          '0%': { strokeDashoffset: '60' },
          '100%': { strokeDashoffset: '0' },
        },
        'ping-slow': {
          '0%': { transform: 'scale(1)', opacity: 0.7 },
          '100%': { transform: 'scale(2.6)', opacity: 0 },
        },
        'glitch': {
          '0%,100%': { transform: 'translate(0,0)' },
          '20%': { transform: 'translate(-1px,1px)' },
          '40%': { transform: 'translate(1px,-1px)' },
          '60%': { transform: 'translate(-1px,-1px)' },
          '80%': { transform: 'translate(1px,1px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'pulse-crit': 'pulse-crit 1.6s ease-in-out infinite',
        'scan': 'scan 6s linear infinite',
        'flicker': 'flicker 4s linear infinite',
        'arc-flow': 'arc-flow 1.6s linear infinite',
        'ping-slow': 'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        'glitch': 'glitch 0.4s steps(1,end) infinite',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(57,255,20,0.45)',
        'neon-red': '0 0 22px rgba(255,0,60,0.5)',
        'neon-amber': '0 0 18px rgba(255,159,28,0.45)',
        'inset-grid': 'inset 0 0 0 1px rgba(255,255,255,0.04)',
      },
      backgroundImage: {
        'grid-fade': 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)',
        'cyber-grid': "linear-gradient(rgba(57,255,20,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.04) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-32': '32px 32px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
