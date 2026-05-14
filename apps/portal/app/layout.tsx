import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tend-O-Matic — Cannabis POS, compliance-first",
  description:
    "Cannabis point-of-sale built compliance-first, by people who actually like the people behind the counter. Live limit headroom, line-itemized tax, versioned rulesets. Michigan + Illinois.",
  openGraph: {
    title: "Tend-O-Matic — Cannabis POS, compliance-first",
    description:
      "Your budtender works faster. Your compliance officer sleeps better.",
    type: "website",
    url: "https://www.tend-o-matic.com",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
