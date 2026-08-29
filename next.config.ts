import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Next clones request bodies at 10MB by default; PDF menus can be much larger.
    proxyClientMaxBodySize: "50mb",
  },
  serverExternalPackages: ["pdfjs-dist", "exceljs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
