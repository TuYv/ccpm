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
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        control: "6px",
        panel: "8px",
      },
    },
  },
  plugins: [],
};
