/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#F5C842",
          dark: "#D4A017",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#F5C842",
          500: "#D4A017",
        },
        brand: {
          bg: "#F7F9F7",
          card: "#FFFFFF",
          ink: "#1A1A2E",
          muted: "#6B7280",
          border: "#E5E7EB",
        },
        status: {
          success: "#4ADE80",
          warning: "#F59E0B",
          danger: "#F87171",
          info: "#60A5FA",
          purple: "#A78BFA",
          checkedout: "#9CA3AF",
        },
        dark: {
          bg: "#1A1A2E",
          card: "#252330",
        },
      },
      fontFamily: {
        heading: ["'Plus Jakarta Sans'", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        drawer: "-8px 0 30px -10px rgb(0 0 0 / 0.18)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
}
