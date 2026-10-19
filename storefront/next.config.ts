import type { NextConfig } from "next";

// Port 3001 (web admin 3000, API 8080). Backend hanya dipanggil dari server (/api/*),
// jadi browser tidak pernah melihat API key maupun token.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
