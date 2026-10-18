import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Port default Next.js (3000). Backend Go tetap di 8080 dan hanya dipanggil dari server
  // (Route Handler /api/*), jadi browser tidak pernah melihat API key maupun token.
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

// next.config.js
module.exports = {
  allowedDevOrigins: ['172.20.10.3'],
}

export default nextConfig;
