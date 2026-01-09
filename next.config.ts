import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drukdekoracje.pl",
      },
    ],
  },
};

export default nextConfig;
