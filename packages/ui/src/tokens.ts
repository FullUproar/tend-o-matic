// Design tokens drawn from the tend-o-matic brand poster.
//
// Application guidance:
//   - The till runs hot and long. Use the "ink on parchment" pairing for
//     primary surfaces — light background, dark ink text — with leaf,
//     mustard, and clay reserved for chrome, accents, and the limit
//     fuel-gauge. Avoid deep kraft as a background on the till.
//   - Portal chrome, marketing surfaces, and printed receipts can lean
//     harder into kraft + mustard + clay; legibility is less constrained
//     and brand identity carries more weight there.
//   - Loud-failures-quiet-successes (see docs/ux-principles.md): success
//     is `leaf` and intentionally subdued; danger is its own bright red,
//     not clay, so it doesn't blend into the brand palette.

export const palette = {
  parchment: "#EEDDB7",
  paper: "#F4E7C8",
  cream: "#F8F0DA",
  ink: "#2E2A1F",
  inkSoft: "#5A4F3A",

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
} as const;

export const semantic = {
  bg: palette.parchment,
  surface: palette.cream,
  text: palette.ink,
  textMuted: palette.inkSoft,
  border: palette.kraft[700],

  brand: palette.mustard[400],
  brandInk: palette.leaf[700],
  brandAccent: palette.clay[500],

  // Loud failures, quiet successes.
  success: palette.leaf[500],
  danger: "#C8302C",
  warn: palette.mustard[400],
  info: palette.kraft[500],
} as const;

export type Palette = typeof palette;
export type Semantic = typeof semantic;
