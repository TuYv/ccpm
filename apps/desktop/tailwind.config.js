/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#171717",
          surface: "#202022",
          sidebar: "#1d1d1f",
          panel: "#242426",
          panelRaised: "#2a2a2d",
          row: "#202022",
          rowHover: "#29292c",
          rowActive: "#17251b",
          card: "#242426",
          cardHover: "#29292c",
          cardActive: "#17251b",
          border: "#343438",
          borderSubtle: "#2b2b2f",
          borderStrong: "#48484d",
          accent: "#0a84ff",
          accentHover: "#0070e0",
          focus: "#4ea1ff",
          text: "#f5f5f7",
          secondary: "#b2b2b8",
          muted: "#7c7c84",
          disabled: "#57575f",
          link: "#4ea1ff",
          green: "#34c759",
          orange: "#ff9500",
          red: "#ff453a",
        },
      },
      borderRadius: {
        control: "6px",
        panel: "8px",
      },
      boxShadow: {
        popover: "0 18px 48px rgba(0, 0, 0, 0.38)",
      },
    },
  },
  plugins: [],
};
