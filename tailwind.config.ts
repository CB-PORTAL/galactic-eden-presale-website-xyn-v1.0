/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'portal-spin': 'spin 20s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 0.8 },
        }
      }
    }
  },
  plugins: []
};