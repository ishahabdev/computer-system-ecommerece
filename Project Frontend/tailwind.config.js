/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        proxima: ["proxima-nova", "sans-serif"],
      },
      // Admin dashboard theming. These map to CSS variables declared on the
      // `.admin-theme` wrapper in index.css, so the same class works in both
      // dark and light mode — only the variable values change. Scoped to admin
      // (the storefront never uses `admin-*` classes).
      colors: {
        admin: {
          bg: "var(--a-bg)",
          panel: "var(--a-panel)",
          "panel-2": "var(--a-panel-2)",
          "panel-3": "var(--a-panel-3)",
          fg: "var(--a-fg)",
          "fg-soft": "var(--a-fg-soft)",
          "fg-muted": "var(--a-fg-muted)",
          "fg-dim": "var(--a-fg-dim)",
          "fg-faint": "var(--a-fg-faint)",
          line: "var(--a-line)",
          "line-2": "var(--a-line-2)",
          "line-strong": "var(--a-line-strong)",
          "line-stronger": "var(--a-line-stronger)",
          "line-hover": "var(--a-line-hover)",
          hover: "var(--a-hover)",
          active: "var(--a-active)",
          invert: "var(--a-invert)",
          "invert-fg": "var(--a-invert-fg)",
        },
      },
    },
  },
  plugins: [],
}