import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // 'standalone' was disabled because Next 16 has an open ENOENT bug copying
  // page_client-reference-manifest.js for route groups (parens, e.g. (dashboard))
  // when tracing for the standalone bundle. Vercel does not need standalone.
  // Re-enable only if self-hosting via Docker, and only after Next patches.
  // output: "standalone",
  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagekit.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
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

export default withSerwist(nextConfig);
