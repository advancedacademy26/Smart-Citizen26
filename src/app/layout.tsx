import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SCHOOL_NAME, EVENT_NAME, EVENT_SUBTITLE } from "@/lib/branding";

// When deployed to a GitHub Pages project site, every asset must be
// prefixed with "/repo-name" (see next.config.ts + deploy workflow).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: `${EVENT_NAME} — ${SCHOOL_NAME} | Visitor Passport`,
  description: `Welcome to ${EVENT_NAME}, ${EVENT_SUBTITLE} at ${SCHOOL_NAME}! Register, collect stamps & earn your National Digital Certificate.`,
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: `${basePath}/icon.svg`,
  },
  appleWebApp: {
    capable: true,
    title: `${EVENT_NAME} Passport`,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1f44",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-slate-900 antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // updateViaCache: 'none' forces the browser to always fetch
                  // sw.js itself fresh from the network when checking for
                  // updates, instead of potentially reusing an HTTP-cached
                  // copy of the old service worker script. Without this, a
                  // stale sw.js could keep controlling a page for up to 24
                  // hours (the browser-enforced max) even after a new
                  // version has been deployed.
                  navigator.serviceWorker
                    .register('${basePath}/sw.js', { updateViaCache: 'none' })
                    .then(function (registration) {
                      // Proactively ask the browser to check for a newer
                      // sw.js on every page load, rather than waiting for
                      // its own internal update heuristics.
                      registration.update().catch(function () {});
                    })
                    .catch(function () {});

                  // If a new service worker takes control of this page
                  // (i.e. a fresh version was just activated), reload once
                  // automatically so the visitor immediately sees the
                  // latest version instead of a stale cached page from
                  // before the update.
                  var hasReloaded = false;
                  navigator.serviceWorker.addEventListener('controllerchange', function () {
                    if (hasReloaded) return;
                    hasReloaded = true;
                    window.location.reload();
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
