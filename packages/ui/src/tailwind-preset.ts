import type { Config } from "tailwindcss";
import { palette, semantic } from "./tokens";

// Shared Tailwind preset. Apps extend this from their tailwind.config.ts.
const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        parchment: palette.parchment,
        paper: palette.paper,
        cream: palette.cream,
        ink: palette.ink,
        "ink-soft": palette.inkSoft,
        kraft: palette.kraft,
        mustard: palette.mustard,
        leaf: palette.leaf,
        clay: palette.clay,
        // Semantic aliases — prefer these in app code so theme changes
        // don't have to chase every color call site.
        brand: {
          DEFAULT: semantic.brand,
          ink: semantic.brandInk,
          accent: semantic.brandAccent,
        },
        success: semantic.success,
        danger: semantic.danger,
        warn: semantic.warn,
        info: semantic.info,
      },
      fontFamily: {
        // Real type lands later; for now use system fallbacks that read
        // "warm" — vertical metrics matter most on the till.
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
};

export default preset;
