import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/presentation/providers/AppProviders";

export const metadata: Metadata = {
  title: { default: "TryTuist: pesan kopi & makanan", template: "%s · TryTuist" },
  description: "Pesan menu TryTuist dari outlet terdekat, antar ke rumah.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f2f4" },
    { media: "(prefers-color-scheme: dark)", color: "#14171b" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
