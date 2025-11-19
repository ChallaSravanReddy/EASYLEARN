/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#ffd700',
        dark: '#181824',
        light: '#fafafa',
        // Dark mode colors
        dark: {
          primary: '#181824',
          secondary: '#1f2937',
          background: '#111827',
          surface: '#1f2937',
          text: '#f9fafb',
          'text-secondary': '#d1d5db',
          border: '#374151',
          'border-light': '#4b5563',
        },
        light: {
          primary: '#ffd700',
          secondary: '#f3f4f6',
          background: '#ffffff',
          surface: '#f9fafb',
          text: '#181824',
          'text-secondary': '#6b7280',
          border: '#e5e7eb',
          'border-light': '#d1d5db',
        }
      },
      fontFamily: {
        'caveat': ['Caveat', 'cursive'],
      },
    },
  },
  plugins: [],
}
