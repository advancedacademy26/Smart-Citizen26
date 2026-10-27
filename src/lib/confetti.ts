"use client";

import confetti from "canvas-confetti";

/**
 * Fires a celebratory confetti burst to mark completing all 6 stamps.
 * Purely a delight-ful animation overlay — does not touch any existing
 * page layout, colors, or components.
 */
export function celebrateAllStampsCollected() {
  if (typeof window === "undefined") return;

  const duration = 2500;
  const end = Date.now() + duration;

  const colors = ["#f97316", "#f43f5e", "#a855f7", "#fbbf24", "#10b981", "#3b82f6"];

  // Two bursts from the bottom corners, plus a center burst, feels festive
  // without being overwhelming or obscuring the screen content for long.
  confetti({
    particleCount: 90,
    spread: 100,
    origin: { y: 0.6 },
    colors,
    startVelocity: 45,
  });

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
