import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client"],
  // @ts-ignore
  turbopack: {
    resolveAlias: {
      "whatwg-encoding": "@exodus/bytes/encoding.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias["whatwg-encoding"] = "@exodus/bytes/encoding.js";
    return config;
  },
};

export default nextConfig;
