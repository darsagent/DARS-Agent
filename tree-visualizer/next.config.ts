import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: "export", // Ensures Next.js exports static files
  images: {
    unoptimized: true, // Required for GitHub Pages
  },
  basePath: "/DARS-Agent",
  webpack(config) {
    config.resolve.fallback = {
      // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped.
      ...config.resolve.fallback,

      fs: false, // the solution
    };

    return config;
  },
};

export default nextConfig;
