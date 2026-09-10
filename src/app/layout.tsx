import type { Metadata, Viewport } from "next";
import { PWARegister } from "@/components/app/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adhikar — National Land Acquisition Management System",
  description:
    "Real-time land acquisition command center digitizing India's RFCTLARR Act 2013 statutory processes, deadlines, compensation, and rehabilitation.",
  manifest: "/manifest.webmanifest",
  other: {
    google: "notranslate",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#002b49",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
