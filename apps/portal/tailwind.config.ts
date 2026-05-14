import type { Config } from "tailwindcss";

// Brand palette inlined per-app for now. Source of truth lives in
// packages/ui/src/tokens.ts; when a proper pnpm-lockfile lands and
// workspace deps work cleanly in Vercel, these apps will import the
// shared preset again.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: "#EEDDB7",
        paper: "#F4E7C8",
        cream: "#F8F0DA",
        ink: "#2E2A1F",
        "ink-soft": "#5A4F3A",
        kraft: {
          50: "#E8D8B5",
          100: "#D8C293",
          300: "#A88554",
          500: "#7A5A36",
          700: "#604024",
          900: "#3A2814",
        },
        mustard: {
          300: "#F0CB6B",
          400: "#E6B53A",
          500: "#D6A11F",
          600: "#B88A20",
          700: "#8A661A",
        },
        leaf: {
          300: "#6FB66F",
          500: "#3E8E3E",
          600: "#2F7A2F",
          700: "#1F4F23",
          900: "#0F2A12",
        },
        clay: {
          300: "#E0936A",
          500: "#C5673A",
          700: "#8C3F1F",
          900: "#5B2810",
        },
        brand: {
          DEFAULT: "#E6B53A",
          ink: "#1F4F23",
          accent: "#C5673A",
        },
        success: "#3E8E3E",
        danger: "#C8302C",
        warn: "#E6B53A",
        info: "#7A5A36",
      },
      fontFamily: {
        display: [
          "ui-serif",
          "Georgia",
          "Cambria",
          "\"Times New Roman\"",
          "Times",
          "serif",
        ],
        script: [
          "ui-serif",
          "\"Apple Chancery\"",
          "\"Snell Roundhand\"",
          "cursive",
        ],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "\"Segoe UI\"",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
