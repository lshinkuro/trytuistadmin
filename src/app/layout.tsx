import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/presentation/providers/AppProviders";

export const metadata: Metadata = {
  title: { default: "TryTuist Admin", template: "%s · TryTuist Admin" },
  description: "Kelola pesanan, harga, dan promo TryTuist.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f2f4" },
    { media: "(prefers-color-scheme: dark)", color: "#14171b" },
  ],
};

// Pasang tema tersimpan sebelum render supaya tidak berkedip (dibungkus try/catch: storage bisa diblokir).
const themeScript = `try{var t=localStorage.getItem("tt-admin-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
