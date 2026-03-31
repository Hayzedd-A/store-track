import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  allowedDevOrigins: [
    "http://[IP_ADDRESS]",
    "http://localhost:3311",
    "http://192.168.3.2",
  ],
};

export default nextConfig;
