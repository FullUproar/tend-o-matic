import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "portal — tend-o-matic",
  description: "Super-admin / tenant onboarding / fleet view",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
