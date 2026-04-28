/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg:          "#1e1e1e",
          surface:     "#252526",
          card:        "#2a2a2c",
          cardHover:   "#303033",
          cardActive:  "#1c2d4a",
          border:      "#3a3a3c",
          accent:      "#0a84ff",
          accentHover: "#0070e0",
          text:        "#ffffff",
          secondary:   "#9da5b4",
          muted:       "#6b7280",
          link:        "#4ea1ff",
          green:       "#34c759",
          orange:      "#ff9500",
          red:         "#ff453a",
        },
      },
    },
  },
  plugins: [],
};
