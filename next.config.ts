import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Port default Next.js (3000). Backend Go tetap di 8080 dan hanya dipanggil dari server
  // (Route Handler /api/*), jadi browser tidak pernah melihat API key maupun token.
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Hanya mode dev: izinkan dibuka dari HP lewat IP Wi-Fi laptop (mis. http://192.168.18.13:3000).
  // Tanpa ini Next memblokir JavaScript dev (403) sehingga halaman tidak interaktif.
  allowedDevOrigins: ["192.168.*.*", "172.*.*.*", "10.*.*.*", "*.local"],
};

export default nextConfig;
