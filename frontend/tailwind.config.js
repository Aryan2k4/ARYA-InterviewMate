/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        blue: { DEFAULT: "#0066FF", dark: "#0052CC", dim: "rgba(0,102,255,0.08)" },
        bg: { DEFAULT: "#0A0A0F", card: "#111118", raised: "#16161F", hover: "#1C1C28" },
        line: { DEFAULT: "rgba(255,255,255,0.06)", hover: "rgba(255,255,255,0.10)" },
        t1: "#F0F0F5",
        t2: "#8888A0",
        t3: "#44445A",
        success: "#00C896",
        warn: "#F5A623",
        danger: "#FF4444",
      },
      borderRadius: { card: "16px", inner: "12px", btn: "10px" },
      boxShadow: {
        blue: "0 8px 24px rgba(0,102,255,0.3)",
        card: "0 1px 3px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
