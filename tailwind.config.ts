/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'portal-purple': '#4c1d95',
        'portal-blue': '#93c5fd',
      },
      backdropBlur: {
        'md': '12px',
      },
      maxWidth: {
        'portal': '400px',
      }
    }
  },
  plugins: []
};