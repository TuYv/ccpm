/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── New token palette (CSS-var backed) ──
        bg: "var(--bg)",
        surface: "var(--surface)",
        card: { DEFAULT: "var(--card)", 2: "var(--card-2)" },
        hairline: { DEFAULT: "var(--hairline)", strong: "var(--hairline-strong)" },
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          ink: "var(--accent-ink)",
        },
        green: { DEFAULT: "var(--green)", soft: "var(--green-soft)" },
        amber: { DEFAULT: "var(--amber)", soft: "var(--amber-soft)" },
        red: { DEFAULT: "var(--red)", soft: "var(--red-soft)" },
        blue: { DEFAULT: "var(--blue)", soft: "var(--blue-soft)" },

        // ── Legacy app.* palette (REMOVED IN PHASE 5) ──
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
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        popover: "0 18px 48px rgba(0, 0, 0, 0.38)", // legacy
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        control: "6px", // legacy
        panel: "8px",   // legacy
      },
    },
  },
  plugins: [],
};
