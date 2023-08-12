/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-angle': 'linear-gradient(160deg, var(--tw-gradient-stops))'
      },
      animation: {
        loading: "bgAnimation 7s linear infinite",
      },
      keyframes: {
        bgAnimation: {
          "0%, 100%": { opacity: 0 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};