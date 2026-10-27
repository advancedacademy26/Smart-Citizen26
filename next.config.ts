import type { NextConfig } from "next";

// STATIC_EXPORT=true is set by the GitHub Actions workflow
// (.github/workflows/deploy-pages.yml) to produce a fully static build that
// GitHub Pages can host directly — no Node.js server required.
// Locally / in this sandbox, this stays unset so the app builds and runs as
// a normal Next.js server (needed for `build_and_start` + /api/health).
const isStaticExport = process.env.STATIC_EXPORT === "true";

// When deployed to a GitHub Pages *project* site (https://user.github.io/repo-name/),
// every asset & route must be prefixed with "/repo-name". The workflow computes
// this automatically and passes it in as NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        images: { unoptimized: true },
        trailingSlash: true,
      }
    : {}),
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
