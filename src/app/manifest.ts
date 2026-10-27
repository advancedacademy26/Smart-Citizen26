import type { MetadataRoute } from "next";
import { SCHOOL_NAME, EVENT_NAME } from "@/lib/branding";

// When deployed to a GitHub Pages project site, every asset/URL must be
// prefixed with "/repo-name" (see next.config.ts + deploy workflow).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// This manifest has no dynamic/request-dependent behaviour, so mark it
// static — required for the GitHub Pages static export build.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${EVENT_NAME} — ${SCHOOL_NAME} Visitor Passport`,
    short_name: `${EVENT_NAME} Passport`,
    description: `Visitor passport & stamp collection for the ${EVENT_NAME} exhibition at ${SCHOOL_NAME}`,
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#0b1f44",
    theme_color: "#0b1f44",
    orientation: "portrait",
    icons: [
      {
        src: `${basePath}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
