"use client";

import { useEffect, useRef, useState } from "react";
import { STATION_MAP } from "@/lib/stations";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
}

const READER_ELEMENT_ID = "qr-reader-region";

/**
 * Full-screen in-app QR scanner. Opens the device camera, reads a QR code,
 * and navigates the visitor to the matching /scan/[id] (or /) page
 * automatically — no need to leave the PWA or use the phone's separate
 * camera app.
 *
 * Note: this deliberately uses a full browser navigation
 * (window.location.assign) rather than Next.js's client-side router.push.
 * On a statically-exported GitHub Pages site, client-side route
 * transitions can be unreliable in combination with the custom service
 * worker and the GitHub Pages sub-path — this showed up as "the page
 * can't be displayed" right after a successful scan. A full navigation
 * (the same thing that happens when a visitor scans with their phone's
 * native camera app or Google Lens, both of which just open the URL
 * directly) hits the real, pre-built static HTML file every time and is
 * far more robust.
 */
export function QRScannerModal({ open, onClose }: QRScannerModalProps) {
  const [error, setError] = useState<string>("");
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const hasHandledResult = useRef(false);

  useEffect(() => {
    if (!open) return;
    hasHandledResult.current = false;
    setError("");
    setStarting(true);

    let cancelled = false;

    const start = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const instance = new Html5Qrcode(READER_ELEMENT_ID);
        scannerRef.current = instance;

        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (hasHandledResult.current) return;
            hasHandledResult.current = true;
            handleDecoded(decodedText);
          },
          () => {
            // per-frame decode failures are expected while scanning; ignore
          },
        );
        if (!cancelled) setStarting(false);
      } catch (err) {
        console.error("QR scanner start failed", err);
        if (!cancelled) {
          setStarting(false);
          setError(
            "Couldn't access the camera. Please allow camera permission in your browser settings, or make sure no other app is using the camera.",
          );
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        instance
          .stop()
          .then(() => instance.clear())
          .catch(() => {
            try {
              instance.clear();
            } catch {
              /* noop */
            }
          });
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleDecoded = async (decodedText: string) => {
    // Stop the camera immediately once we have a result
    const instance = scannerRef.current;
    if (instance) {
      try {
        await instance.stop();
        instance.clear();
      } catch {
        /* noop */
      }
    }

    const path = extractAppPath(decodedText);
    if (!path) {
      setError("This QR code isn't part of the exhibition trail. Please scan a valid zone QR code.");
      return;
    }
    onClose();
    // Full browser navigation (not client-side router.push) — see the
    // comment on the component above for why this is more reliable here.
    window.location.assign(path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <h2 className="font-black text-lg flex items-center gap-2">📷 Scan QR Code</h2>
        <button
          onClick={onClose}
          className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-xl"
          aria-label="Close scanner"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        <div className="w-full max-w-sm">
          <div
            id={READER_ELEMENT_ID}
            className="w-full rounded-2xl overflow-hidden bg-black ring-2 ring-white/30"
          />

          {starting && !error && (
            <div className="mt-4 text-center text-white/80 text-sm">
              Starting camera... please allow camera access if prompted.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl bg-red-500/20 border border-red-400/40 p-3 text-sm text-red-100 text-center">
              {error}
            </div>
          )}

          {!starting && !error && (
            <div className="mt-4 text-center text-white/70 text-sm">
              Point your camera at a QR code placed at the entry gate or an exhibition zone.
            </div>
          )}

          <button onClick={onClose} className="mt-5 w-full rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Accepts either a full URL (e.g. https://yourapp.com/scan/green) or just a
 * relative path / station id, and returns the real, fully-formed path to
 * navigate the browser to (including the GitHub Pages base path and
 * trailing slash, matching the actual static HTML files on disk).
 */
// When deployed to a GitHub Pages project site, scanned URLs look like
// https://user.github.io/repo-name/scan/green/ — strip that "/repo-name"
// prefix before matching so the app still recognises the station id, then
// add it back on to build the real destination path.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
// The static export (used for GitHub Pages) is built with trailingSlash:
// true, so every real file is at e.g. "/scan/green/", not "/scan/green".
const TRAILING_SLASH = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

function withSlash(path: string): string {
  return TRAILING_SLASH && !path.endsWith("/") ? `${path}/` : path;
}

function extractAppPath(decodedText: string): string | null {
  let pathname = decodedText.trim();

  try {
    if (/^https?:\/\//i.test(pathname)) {
      pathname = new URL(pathname).pathname;
    }
  } catch {
    // not a valid URL, fall through and treat as raw text
  }

  if (BASE_PATH && pathname.startsWith(BASE_PATH)) {
    pathname = pathname.slice(BASE_PATH.length) || "/";
  }

  // Direct station id, e.g. "green"
  if (pathname in STATION_MAP) {
    return withSlash(`${BASE_PATH}/scan/${pathname}`);
  }

  // Path like /scan/green or /scan/green/
  const scanMatch = pathname.match(/\/scan\/([a-z-]+)/i);
  if (scanMatch && scanMatch[1] in STATION_MAP) {
    return withSlash(`${BASE_PATH}/scan/${scanMatch[1]}`);
  }

  // Entry gate QR pointing at root
  if (pathname === "/" || pathname === "") {
    return withSlash(`${BASE_PATH}/`) || "/";
  }

  return null;
}
