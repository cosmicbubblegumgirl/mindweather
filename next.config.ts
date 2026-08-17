import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const standalone = process.env.MINDWEATHER_STANDALONE === "1";

const nextConfig: NextConfig = {
  agentRules: false,
  output: standalone ? "standalone" : "export",
  trailingSlash: !standalone,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
