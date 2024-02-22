/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "projects/hqf/src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "c60": "#f4dcda",
        "c30": "#f3be98",
        "c10": "#e67d24",
        "c10-active": "#ec9756",
        "c10-text": "#ffffff",
        "c-text": "#0c0c0c",
        "c-disabled": colors.gray["300"]
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "wiggle": "wiggle 1s ease-in-out infinite"
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
