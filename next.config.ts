import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // 禁用 Turbopack 以解决 module resolution 错误
    turbo: {
      enabled: false,
    },
  },
};

export default nextConfig;
