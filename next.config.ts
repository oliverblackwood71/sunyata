import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/sunyata",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
