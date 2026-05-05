import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // distDir: "build",
  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagekit.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  experimental: {},

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
