"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getVisitor,
  hasCollectedAll,
  getCertificateIssuedAt,
  type Visitor,
} from "@/lib/storage";
import { STATIONS } from "@/lib/stations";
import {
  SCHOOL_NAME,
  EVENT_NAME,
  EVENT_SUBTITLE,
  EVENT_THEME,
  MISSION_TAG,
} from "@/lib/branding";

export default function CertificatePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [ready, setReady] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const v = getVisitor();
    if (!v) {
      router.replace("/");
      return;
    }
    if (!hasCollectedAll()) {
      router.replace("/dashboard");
      return;
    }
    setVisitor(v);
  }, [router]);

  useEffect(() => {
    if (!visitor || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1200;
    const H = 850;
    canvas.width = W;
    canvas.height = H;

    // ---- Background: navy gradient like the passport ----
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#0b1f44");
    bgGrad.addColorStop(1, "#132a57");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Tricolor top & bottom strip
    drawTricolorStrip(ctx, 0, W, 10);
    drawTricolorStrip(ctx, H - 10, W, 10);

    // Gold ornate frame
    ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
    ctx.lineWidth = 2.5;
    roundRectStroke(ctx, 36, 36, W - 72, H - 72, 18);
    ctx.strokeStyle = "rgba(251, 191, 36, 0.35)";
    ctx.lineWidth = 1.2;
    roundRectStroke(ctx, 52, 52, W - 104, H - 104, 14);

    // Corner flourishes
    drawCornerFlourish(ctx, 50, 50, 1, 1);
    drawCornerFlourish(ctx, W - 50, 50, -1, 1);
    drawCornerFlourish(ctx, 50, H - 50, 1, -1);
    drawCornerFlourish(ctx, W - 50, H - 50, -1, -1);

    // White inner certificate panel
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    roundRect(ctx, 95, 110, W - 190, H - 220, 16);
    ctx.fill();

    ctx.textAlign = "center";

    // School name
    ctx.fillStyle = "#334155";
    ctx.font = "bold 20px Georgia, serif";
    ctx.fillText(SCHOOL_NAME.toUpperCase(), W / 2, 155);

    // Divider
    const lineGrad = ctx.createLinearGradient(W / 2 - 150, 0, W / 2 + 150, 0);
    lineGrad.addColorStop(0, "transparent");
    lineGrad.addColorStop(0.5, "#cbd5e1");
    lineGrad.addColorStop(1, "transparent");
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 150, 168);
    ctx.lineTo(W / 2 + 150, 168);
    ctx.stroke();

    // Title
    ctx.fillStyle = "#1e3a8a";
    ctx.font = "bold 38px Georgia, serif";
    ctx.fillText("★ NATIONAL DIGITAL CERTIFICATE ★", W / 2, 215);

    ctx.fillStyle = "#b45309";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillText(`${EVENT_NAME} — ${EVENT_SUBTITLE}`, W / 2, 245);
    ctx.fillStyle = "#64748b";
    ctx.font = "16px Georgia, serif";
    ctx.fillText(EVENT_THEME.toUpperCase(), W / 2, 268);

    // "This is to certify that"
    ctx.fillStyle = "#334155";
    ctx.font = "24px Georgia, serif";
    ctx.fillText("This is to proudly certify that", W / 2, 320);

    // Visitor Name
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 60px 'Brush Script MT', cursive, Georgia, serif";
    ctx.fillText(visitor.name, W / 2, 395);

    // Class / section
    ctx.fillStyle = "#334155";
    ctx.font = "22px Georgia, serif";
    ctx.fillText(`of Class ${visitor.className} - Section ${visitor.section}`, W / 2, 432);

    // Body text listing the 6 stations
    const stationList = STATIONS.map((s) => s.name).join(", ").replace(/,([^,]*)$/, " and$1");
    ctx.font = "19px Georgia, serif";
    ctx.fillStyle = "#475569";
    wrapText(
      ctx,
      `has successfully completed the ${MISSION_TAG} trail — ${stationList} — and collected all stamps in the Visitor Passport. This certificate is awarded in recognition of their enthusiastic participation as a responsible citizen of Future India.`,
      W / 2,
      480,
      860,
      30,
    );

    // Date and passport number
    const issuedAt = getCertificateIssuedAt();
    const dateStr = (issuedAt ? new Date(issuedAt) : new Date()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    ctx.font = "18px Georgia, serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(`Passport Number: ${visitor.passportNumber}`, W / 2, 650);
    ctx.fillText(`Issued on: ${dateStr}`, W / 2, 676);

    // Signature lines
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(190, 745);
    ctx.lineTo(420, 745);
    ctx.stroke();
    ctx.fillStyle = "#334155";
    ctx.font = "bold 17px Georgia, serif";
    ctx.fillText("Class Teacher", 305, 768);

    // Center: Ashoka-chakra style seal
    drawSeal(ctx, W / 2, 740);

    ctx.beginPath();
    ctx.moveTo(W - 420, 745);
    ctx.lineTo(W - 190, 745);
    ctx.stroke();
    ctx.fillStyle = "#334155";
    ctx.font = "bold 17px Georgia, serif";
    ctx.fillText("Principal", W - 305, 768);

    setImageUrl(canvas.toDataURL("image/png"));
    setReady(true);
  }, [visitor]);

  const handleDownload = () => {
    if (!imageUrl || !visitor) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `Certificate_${visitor.name.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!visitor) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="text-slate-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-10 confetti-bg">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-base md:text-lg font-black text-slate-800">
            🏆 National Digital Certificate
          </h1>
          <div className="flex gap-2">
            <Link href="/dashboard" className="rounded-full bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🎊</div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">
            Congratulations, {visitor.name}!
          </h2>
          <p className="text-slate-600 text-sm mt-1">
            You've completed the {MISSION_TAG} trail. Here is your official certificate.
          </p>
        </div>

        <div className="card p-4 md:p-6">
          <canvas ref={canvasRef} className="w-full h-auto rounded-xl shadow-lg" />
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDownload}
            disabled={!ready}
            className="btn-primary text-lg py-4 px-8"
          >
            {ready ? "⬇️ Download Certificate (PNG)" : "Preparing..."}
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          This digital certificate is awarded for completing all six zones of the {EVENT_NAME} exhibition trail.
          <br />
          Passport No: <span className="font-mono font-semibold">{visitor.passportNumber}</span>
        </p>
      </div>
    </main>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function roundRectStroke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  roundRect(ctx, x, y, w, h, r);
  ctx.stroke();
}

function drawTricolorStrip(ctx: CanvasRenderingContext2D, y: number, w: number, h: number) {
  const third = h / 3;
  ctx.fillStyle = "#FF9933";
  ctx.fillRect(0, y, w, third);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, y + third, w, third);
  ctx.fillStyle = "#128807";
  ctx.fillRect(0, y + 2 * third, w, third);
}

function drawCornerFlourish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dirX: number,
  dirY: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 36 * dirY);
  ctx.quadraticCurveTo(0, 0, 36 * dirX, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(251, 191, 36, 0.9)";
  ctx.fill();
  ctx.restore();
}

function drawSeal(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Chakra-like spokes
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 1;
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    ctx.beginPath();
    ctx.moveTo(5 * Math.cos(angle), 5 * Math.sin(angle));
    ctx.lineTo(28 * Math.cos(angle), 28 * Math.sin(angle));
    ctx.stroke();
  }
  ctx.fillStyle = "#1e3a8a";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = "bold 9px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("OFFICIAL SEAL", 0, 56);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
