/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Hanken Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: "#191c1e",
        paper: "#f9f8f6",
        surface: "#f8f9fb",
        muted: "#f3f4f6",
        line: "#c4c7c7",
        grid: "#e5e7eb",
        steel: "#444748",
        signal: "#006a61",
        signalSoft: "#86f2e4",
        signalMist: "#f0fdfa",
        load: "#e45405",
        loadMist: "#fff7ed",
      },
      boxShadow: {
        tool: "0 4px 20px rgba(0, 0, 0, 0.05)",
      },
    },
  },
  plugins: [],
};
