/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-angle": "linear-gradient(160deg, var(--tw-gradient-stops))",
      },
      animation: {
        loading: "bgAnimation 7s linear infinite",
        blur: "blur 0.5s linear",
      },
      transitionProperty: {
        visible:
          "visibility 0s, opacity 0.5s linear, background-blur 0.5s linear",
      },

      keyframes: {
        blur: {
          "0%": { "backdrop-filter": "blur(0px)" },
          "100%": { "backdrop-filter": "blur(5px)" },
        },
        bgAnimation: {
          "0%, 100%": { opacity: 0 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
