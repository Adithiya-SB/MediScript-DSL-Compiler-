/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f9fc',
        card: '#ffffff',
        primary: '#6c47ff',
        secondary: '#4f8ef7',
        border: '#e5e7eb',
        textPrimary: '#111827',
        textSecondary: '#6b7280',
        textMuted: '#9ca3af',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        codeBg: '#1e1e2e',
        codeText: '#cdd6f4',
        badgePurple: '#ede9fe',
        badgeText: '#6c47ff',
      },
      fontFamily: {
        ui: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
