/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Aptos", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        ink: "#17201a",
        paper: "#f7f4ec",
        grid: "#d9d2c1",
        steel: "#40505c",
        signal: "#0d9488",
        load: "#b42318",
      },
    },
  },
  plugins: [],
};
