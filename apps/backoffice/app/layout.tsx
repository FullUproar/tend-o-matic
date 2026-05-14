import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "backoffice — tend-o-matic",
  description: "Manager and admin web",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
