/** @type {import('tailwindcss').Config} */

const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/**/*.{html,ts,js}",
  ],
  theme: {
    extend: {
      // windows xp palette https://lospec.com/palette-list/windows-xp-color
      // fg => foreground
      // bg => background
      colors: {
        "c60-bg": "#000000",
        "c60-fg": "#FFFFFF",

        "c30-bg": "#FFFFFF",
        "c30-fg": "#000000",

        "c10-bg": "#75b600",
        "c10-fg": "#FFFFFF",

        "c10-bg-active": "#a2fa07",
        "c10-fg-active": "#FFFFFF",

        "fg-disabled": "#FFFFFF",
        "bg-disabled": colors.gray["300"],

        "header1-bg": "#a1b5fe",
        "header1-fg": "#ffffff",
        "header2-bg": "#485fea",
        "header2-fg": "#ffffff",
        "header3-bg": "#1621c9",
        "header3-fg": "#ffffff",

        "danger1-bg": "#fea75d",
        "danger1-fg": "#ffffff",
        "danger2-bg": "#e55000",
        "danger2-fg": "#ffffff",
        "danger3-bg": "#9b1e00",
        "danger3-fg": "#ffffff",

        "warn1-bg": "#def222",
        "warn1-fg": "#ffffff",
        "warn2-bg": "#d3a801",
        "warn2-fg": "#ffffff",
        "warn3-bg": "#8a7500",
        "warn3-fg": "#ffffff",
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
  ],
};
