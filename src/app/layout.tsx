import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promo Video Maker - Generate promo videos for any GitHub repo",
  description:
    "Paste a GitHub repo URL, add optional instructions, and instantly generate a sleek animated promo video powered by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
