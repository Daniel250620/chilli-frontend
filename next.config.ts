import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // La CSF (hasta 10 MB) viaja en una server action; el default es 1 MB.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
