import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ostaad Vendor Coverage Map — Kolkata & West Bengal Ops",
  description:
    "Live internal operations coverage map connected read-only to Ostaad's Cloudflare D1 database.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F4] text-[#23384F] antialiased">{children}</body>
    </html>
  );
}
