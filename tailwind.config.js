/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './App.tsx', './index.tsx'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#10b981', dark: '#059669', light: '#34d399', 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
        secondary: { DEFAULT: '#6366f1', dark: '#4f46e5', light: '#818cf8' },
        accent: { DEFAULT: '#f59e0b', dark: '#d97706', light: '#fbbf24' },
        surface: { DEFAULT: '#ffffff', 2: '#f8fafc', 3: '#f1f5f9' },
      },
      fontFamily: { sans: ['Vazirmatn', 'Tahoma', 'sans-serif'], nastaliq: ['IranNastaliq', 'serif'] },
      borderRadius: { 'sm': '8px', 'md': '12px', 'lg': '16px', 'xl': '20px', '2xl': '24px', '3xl': '28px' },
      boxShadow: {
        'glow': '0 0 40px rgba(16, 185, 129, 0.2)',
        'glow-lg': '0 0 60px rgba(16, 185, 129, 0.3)',
        'elevated': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'floating': '0 20px 60px rgba(0, 0, 0, 0.12)',
      },
    }
  },
  plugins: [],
}
