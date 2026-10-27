"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { STATIONS, type StationId } from "@/lib/stations";
import { StationIconSvg } from "@/components/StationIcon";
import {
  addStamp,
  clearVisitor,
  getCollectedStamps,
  getVisitor,
  saveVisitor,
  generatePassportNumber,
} from "@/lib/storage";

// GitHub Pages project sites serve this app under "/repo-name" — this is
// baked in at build time by the deploy workflow and exposed to the browser
// bundle because it's prefixed with NEXT_PUBLIC_.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
// The static export (used for GitHub Pages) is built with trailingSlash:
// true, so generated links need a trailing "/" to match the real files.
const TRAILING_SLASH = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

function withSlash(path: string) {
  return TRAILING_SLASH && !path.endsWith("/") ? `${path}/` : path;
}

// The qrcode library's SVG output has fixed pixel width/height attributes
// matching the requested size. Replacing those with "100%" lets the SVG
// scale to fill whatever CSS size its container is given (on screen or in
// print) while remaining a true vector — so it's always pixel-perfect
// crisp, never blurred by raster up/downscaling.
function makeSvgResponsive(svg: string): string {
  return svg
    .replace(/width="\d+(\.\d+)?"/, 'width="100%"')
    .replace(/height="\d+(\.\d+)?"/, 'height="100%"');
}

export default function AdminPage() {
  const router = useRouter();
  const [detectedUrl, setDetectedUrl] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  // SVG markup is used for on-screen display AND printing — being a vector
  // format, it renders with perfectly sharp edges at ANY size (zoomed in,
  // printed small, printed large, scaled by the browser's print dialog,
  // etc). This matters a lot here: a raster PNG QR code gets smoothed/
  // anti-aliased by the browser whenever it's resized for display or
  // print, which blurs the crisp black/white edges a QR scanner relies on.
  // That blur is barely noticeable on a short/simple QR code (few, large
  // modules — like the Entry Gate URL) but can be fatal for a longer,
  // denser QR code (many small modules — like the zone URLs), which is
  // exactly the "only the entry QR scans, the zone QR's don't" pattern
  // this fixes.
  const [entryQrSvg, setEntryQrSvg] = useState("");
  const [stationQrSvgs, setStationQrSvgs] = useState<Record<string, string>>({});
  // Separate, higher-resolution PNGs are still generated for the
  // "Download as PNG" button, for people who need a raster file to paste
  // into Word/Canva/etc. (SVG also offered as a download, and is the
  // better choice whenever the destination supports it).
  const [entryQrPng, setEntryQrPng] = useState("");
  const [stationQrPngs, setStationQrPngs] = useState<Record<string, string>>({});
  const [collected, setCollected] = useState<StationId[]>([]);

  useEffect(() => {
    const origin = (window.location.origin + BASE_PATH).replace(/\/$/, "");
    setDetectedUrl(origin);
    setBaseUrl(origin);
    setCollected(getCollectedStamps());
  }, []);

  // Regenerate every QR code whenever the base URL changes (e.g. the
  // organizer types in their real deployed domain instead of the preview URL).
  useEffect(() => {
    if (!baseUrl) return;
    const origin = baseUrl.replace(/\/$/, "");

    // High error correction (~30% of the code can be damaged/misread and
    // still decode correctly) plus a generous quiet-zone margin make these
    // QR codes far more resilient to real-world printing/scanning
    // conditions (small print size, glare, slightly blurry phone cameras,
    // creased paper, etc). This matters most for the zone URLs, which are
    // longer than the entry URL and therefore render as a visually denser
    // QR code for the same physical size.
    const qrOptions = {
      margin: 4,
      errorCorrectionLevel: "H" as const,
      color: { dark: "#0f172a", light: "#ffffff" },
    };

    const generate = async () => {
      const entryUrl = withSlash(`${origin}/`);
      const entrySvg = await QRCode.toString(entryUrl, { ...qrOptions, type: "svg" });
      setEntryQrSvg(makeSvgResponsive(entrySvg));
      const entryPng = await QRCode.toDataURL(entryUrl, { ...qrOptions, width: 1000 });
      setEntryQrPng(entryPng);

      const svgMap: Record<string, string> = {};
      const pngMap: Record<string, string> = {};
      for (const s of STATIONS) {
        const url = withSlash(`${origin}/scan/${s.id}`);
        const svg = await QRCode.toString(url, { ...qrOptions, type: "svg" });
        svgMap[s.id] = makeSvgResponsive(svg);
        pngMap[s.id] = await QRCode.toDataURL(url, { ...qrOptions, width: 1000 });
      }
      setStationQrSvgs(svgMap);
      setStationQrPngs(pngMap);
    };
    generate();
  }, [baseUrl]);

  const refreshCollected = () => setCollected(getCollectedStamps());

  const handleAddStamp = (id: StationId) => {
    addStamp(id);
    refreshCollected();
  };

  const handleCollectAll = () => {
    let v = getVisitor();
    if (!v) {
      // Register a demo visitor automatically
      saveVisitor({
        name: "Demo Visitor",
        className: "Parent",
        section: "-",
        registeredAt: Date.now(),
        passportNumber: generatePassportNumber(),
      });
    }
    STATIONS.forEach((s) => addStamp(s.id));
    refreshCollected();
    setTimeout(() => router.push("/certificate"), 500);
  };

  const handleResetDemo = () => {
    clearVisitor();
    setCollected([]);
  };

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <header className="bg-white border-b border-slate-200 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">
              🖨️ Organizer Admin Panel
            </h1>
            <p className="text-sm text-slate-500">
              Print exhibition QR codes, test the app, customize branding.
            </p>
            <p className="text-xs text-slate-400 mt-1 font-mono break-all">
              App URL: <span className="text-orange-600">{baseUrl || "Detecting..."}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="btn-secondary !py-2 !px-4 text-sm">
              ← Visitor Home
            </Link>
            <Link href="/dashboard" className="btn-secondary !py-2 !px-4 text-sm">
              📘 Dashboard
            </Link>
            <button onClick={handlePrint} className="btn-primary !py-2 !px-4 text-sm">
              🖨️ Print All QRs
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 print:space-y-6 print:bg-white">
        {/* =================== HOW QR CODES WORK + PUBLIC URL =================== */}
        <section className="card p-5 md:p-6 print:hidden bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-300">
          <h2 className="text-xl font-black text-slate-800 mb-2">
            🔗 How the QR codes are connected to this app
          </h2>
          <div className="space-y-2.5 text-sm text-slate-700">
            <p>
              <b>You don't need to design or create any QR code images yourself</b> — this page
              generates all 7 of them automatically (1 entry gate + 6 zone stamps). Every QR code
              simply encodes a web address (URL) that points back into this same app:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                The <b>Entry Gate QR</b> encodes your app's home address, e.g.{" "}
                <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-xs">yourapp.com/</code>.
                Any phone camera that scans it opens that link in the browser — landing on the
                Registration page.
              </li>
              <li>
                Each <b>Zone QR</b> encodes a unique address like{" "}
                <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-xs">yourapp.com/scan/green</code>.
                When a registered visitor's phone opens that link (either via their camera app or
                the in-app 📷 scanner on the Dashboard), the app automatically records that stamp
                for them — no manual step needed.
              </li>
              <li>
                Because everything is just a URL, the same QR + app combo works for unlimited
                visitors at the same time, with nothing extra to configure per-visitor.
              </li>
            </ul>
            <p className="pt-1">
              ⚠️ <b>Important for exhibition day:</b> QR codes only work if they point to a web
              address that is reachable from visitors' phones. The address below was
              auto-detected from the browser you're using right now. Once you deploy this app via{" "}
              <b>GitHub Pages</b> (see <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[11px]">DEPLOYMENT.md</code>{" "}
              in the project for the exact steps), open this same Admin page from your permanent{" "}
              <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[11px]">yourusername.github.io/your-repo</code>{" "}
              link and the field below will automatically detect it — no manual typing needed. You
              can still paste a different URL below and tap <b>Regenerate</b> if you ever need to.
            </p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-deployed-domain.com"
              className="flex-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-mono focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
            />
            <button
              onClick={() => setBaseUrl((v) => v.replace(/\/$/, ""))}
              className="btn-primary !py-2.5 !px-5 text-sm whitespace-nowrap"
            >
              🔄 Regenerate QRs
            </button>
            {baseUrl !== detectedUrl && (
              <button
                onClick={() => setBaseUrl(detectedUrl)}
                className="btn-secondary !py-2.5 !px-5 text-sm whitespace-nowrap"
              >
                Use Detected URL
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Currently generating QR codes for: <span className="font-mono text-indigo-700">{baseUrl || "..."}</span>
          </p>
        </section>

        {/* =================== TEST PANEL (organizers only) =================== */}
        <section className="card p-5 md:p-6 print:hidden border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white">
          <h2 className="text-xl font-black text-slate-800 mb-1">
            🧪 Testing & Demo Tools
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Use these to test the full flow <b>without needing a phone camera</b>.
            You can click each station link below to simulate scanning that QR, or
            jump straight to the completed certificate.
          </p>

          <div className="rounded-xl bg-white border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-slate-700">
                Current stamp count on this device:
              </div>
              <div className="text-sm font-black text-orange-600">
                {collected.length} / {STATIONS.length}
              </div>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 via-rose-500 to-purple-500 transition-all"
                style={{ width: `${(collected.length / STATIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-bold text-slate-700 mb-2">
              1. Register as a visitor first:
            </div>
            <Link href="/" target="_blank" className="btn-secondary !py-2 !px-4 text-sm">
              🎫 Open Registration Page
            </Link>
          </div>

          <div className="mb-4">
            <div className="text-sm font-bold text-slate-700 mb-2">
              2. Simulate scanning each zone QR (click in any order):
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STATIONS.map((s) => {
                const done = collected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => handleAddStamp(s.id)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold border-2 transition text-left ${
                      done
                        ? "bg-green-50 border-green-300 text-green-800"
                        : "bg-white border-slate-200 hover:border-orange-300 text-slate-700"
                    }`}
                  >
                    <StationIconSvg icon={s.icon} className="h-5 w-5" />
                    <span className="flex-1">{s.name}</span>
                    <span>{done ? "✓" : "→"}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2 italic">
              Tip: Open <Link href="/dashboard" target="_blank" className="underline text-orange-600">the Dashboard</Link> in another tab to see stamps appear live.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={handleCollectAll}
              className="btn-primary w-full !py-3"
            >
              ✨ Collect All 6 & Show Certificate
            </button>
            <button
              onClick={handleResetDemo}
              className="btn-secondary w-full !py-3"
            >
              🔄 Reset All Demo Data
            </button>
          </div>
          {collected.length === STATIONS.length && (
            <div className="mt-3">
              <Link href="/certificate" className="btn-primary w-full !py-3 bg-gradient-to-r from-yellow-500 to-amber-600">
                🏆 View National Digital Certificate
              </Link>
            </div>
          )}
        </section>

        {/* =================== CAPACITY / SCALING INFO =================== */}
        <section className="card p-5 md:p-6 print:hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <h2 className="text-xl font-black text-slate-800 mb-2">
            👥 Can it handle many visitors at once?
          </h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <b className="text-green-700">Yes — unlimited concurrent visitors.</b> This app is built
              as a <b>100% client-side PWA</b>. Here's why that matters:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>
                Every visitor's name, class, section, stamps & certificate are stored <b>only on their own phone</b> (in the browser's localStorage) — never sent to a central database.
              </li>
              <li>
                The server only sends static HTML / JS / images — there are no user accounts, no logins, no database writes, and no per-visitor server memory used.
              </li>
              <li>
                Hundreds or thousands of parents can scan the QR and register simultaneously with <b>zero slowdown, zero conflicts, zero bottlenecks</b>.
              </li>
              <li>
                Works on any modern phone (Android Chrome, iPhone Safari) directly through the camera app — <b>no app store install required</b>.
              </li>
              <li>
                If a visitor refreshes or closes their browser, their passport & stamps remain saved on their phone until they press Reset.
              </li>
            </ul>
          </div>
        </section>

        {/* =================== BRANDING GUIDE =================== */}
        <section className="card p-5 md:p-6 print:hidden bg-gradient-to-br from-amber-50 to-rose-50 border-2 border-amber-300">
          <h2 className="text-xl font-black text-slate-800 mb-2">
            🎨 Passport, Welcome, Route & Stamps design
          </h2>
          <p className="text-sm text-slate-700 mb-3">
            The Visitor Passport, Welcome message, Exhibition Route map and Stamp Collection sheet
            are drawn live as crisp vector designs (matching your Advanced Academy Indore /
            SPECTRA branding) — not static photos — so they look perfectly sharp on every screen size
            and print clearly too.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-xl border border-slate-200 overflow-hidden">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="px-3 py-2 font-bold">To change</th>
                  <th className="px-3 py-2 font-bold">Edit this file</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-3 py-2">School name, event name "SPECTRA", subtitle, theme year, tagline</td>
                  <td className="px-3 py-2 font-mono text-xs text-orange-700">src/lib/branding.ts</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">The 6 zone names, descriptions & colors</td>
                  <td className="px-3 py-2 font-mono text-xs text-orange-700">src/lib/stations.ts</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Passport cover look (navy & gold)</td>
                  <td className="px-3 py-2 font-mono text-xs text-orange-700">src/components/PassportCard.tsx</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Welcome message card</td>
                  <td className="px-3 py-2 font-mono text-xs text-orange-700">src/components/WelcomeCard.tsx</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Exhibition route trail</td>
                  <td className="px-3 py-2 font-mono text-xs text-orange-700">src/components/RouteMapCard.tsx</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Stamp collection sheet & badge design</td>
                  <td className="px-3 py-2 font-mono text-xs text-orange-700">src/components/StampSheetCard.tsx</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 mt-3">
            💡 Want to use an actual photograph instead of the vector design somewhere (e.g. a real
            photo of your school building on the Welcome card)? Just add an{" "}
            <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[11px]">&lt;img&gt;</code>{" "}
            tag inside the matching component file above and point it at a file you upload under{" "}
            <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono text-[11px]">public/images/</code>.
          </p>
        </section>

        {/* =================== CURRENT STAMP THEME PREVIEW =================== */}
        <section className="card p-5 md:p-6 print:hidden">
          <h2 className="text-xl font-black text-slate-800 mb-3">🔖 Current 6 Citizen Zones</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STATIONS.map((s, idx) => (
              <div key={s.id} className={`rounded-xl p-3 text-white bg-gradient-to-br ${s.color} flex items-center gap-2`}>
                <div className="h-9 w-9 rounded-full bg-white/20 grid place-items-center shrink-0">
                  <StationIconSvg icon={s.icon} className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold leading-tight">
                  {idx + 1}. {s.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =================== ENTRY QR =================== */}
        <section className="print:break-before-page">
          <QRPrintCard
            large
            title="🎫 ENTRY GATE"
            subtitle="Scan here to register & get your Visitor Passport"
            qrSvg={entryQrSvg}
            qrPng={entryQrPng}
            url={withSlash(`${baseUrl}/`)}
            colorClass="from-orange-500 to-rose-500"
            instructions="Place this QR code at the main entry. Parents/visitors scan this first with their phone camera, then fill in name/class/section."
          />
        </section>

        <div className="text-center print:break-before-page">
          <h2 className="text-2xl font-black text-slate-800 print:text-black">
            Zone QR Codes (6 Stamps)
          </h2>
          <p className="text-sm text-slate-600 print:text-slate-800">
            Print and place one QR code in each exhibition zone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
          {STATIONS.map((s, idx) => (
            <QRPrintCard
              key={s.id}
              title={`${idx + 1}. ${s.label}`}
              subtitle={s.description}
              qrSvg={stationQrSvgs[s.id] || ""}
              qrPng={stationQrPngs[s.id] || ""}
              url={withSlash(`${baseUrl}/scan/${s.id}`)}
              colorClass={s.color}
              instructions={`Place at the ${s.name} zone. Visitor scans to collect stamp ${idx + 1} of 6.`}
            />
          ))}
        </div>

        <div className="card p-6 print:bg-white print:border-2 print:border-slate-400 print:rounded-xl">
          <h3 className="font-black text-lg text-slate-800 mb-2">📋 Setup Checklist</h3>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
            <li>Deploy this app for free via GitHub Pages — follow <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">DEPLOYMENT.md</code> in the project (push to GitHub → enable Pages → done in ~5 minutes).</li>
            <li>Open this Admin page from your permanent <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">yourusername.github.io/your-repo/admin</code> link.</li>
            <li>(Optional) Tweak branding text/colors in <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">src/lib/branding.ts</code> and <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">src/lib/stations.ts</code>, then commit & push — it redeploys automatically.</li>
            <li>Tap <b>Print All</b> above and either send to a printer or "Save as PDF".</li>
            <li>Cut out each QR code card individually and tape/laminate them.</li>
            <li>Place the large <b>Entry Gate</b> QR at the main entrance / welcome desk.</li>
            <li>Place the 6 numbered zone QRs in order (1 → 6) at each exhibition zone.</li>
            <li>Visitors scan entry → register → follow the route → scan each zone → collect stamps → download certificate!</li>
          </ol>
        </div>

        <div className="card p-6 print:hidden bg-amber-50 border-2 border-amber-300">
          <h3 className="font-black text-lg text-slate-800 mb-2">🖨️ Printing tips for reliable scanning</h3>
          <p className="text-sm text-slate-700 mb-2">
            The zone QR codes encode longer web addresses than the Entry Gate QR, which makes
            them visually denser (more tiny squares packed in). These are now rendered as crisp{" "}
            <b>vector (SVG) graphics</b> instead of raster images — this means they stay
            perfectly sharp at any size and are never blurred by screen zooming or print scaling,
            which previously could make the denser zone codes meaningfully harder to scan than the
            simple Entry Gate code.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
            <li>When printing, use the <b>"🖨️ Print All QRs"</b> button above (this page) rather
              than exporting as an image elsewhere first, to preserve the sharp vector quality.</li>
            <li>If you need a file to paste into Canva/Word/a poster design, prefer the{" "}
              <b>"⬇️ SVG (sharpest)"</b> download under each code over the PNG option — SVG stays
              perfectly crisp no matter how much it's resized in your design tool.</li>
            <li>Print each QR code at a minimum of <b>2 × 2 inches (5 × 5 cm)</b> physical size —
              bigger is better, especially for busy exhibition lighting.</li>
            <li>Make sure there's plain white space of at least{" "}
              <b>¼ inch (0.5 cm)</b> around every QR code — don't crop or trim right up to its edge.</li>
            <li>Avoid laminating with a glossy finish under bright lights/sunlight — this can
              cause glare that blocks the camera from reading the code. A matte laminate or no
              lamination is safer.</li>
            <li>⚠️ Avoid sending the downloaded QR image through WhatsApp or similar chat apps
              before printing — many apps automatically compress/shrink images, which can blur a
              dense QR code enough to break scanning. Print directly from this page, or from the
              downloaded file on the same device, whenever possible.</li>
            <li>If a code still won't scan on the day, every card also shows its plain-text{" "}
              <b>"Scan URL"</b> below the QR — visitors can type that directly into their phone's
              browser as a reliable backup.</li>
          </ul>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:break-before-page { break-before: page; }
        }
      `}</style>
    </main>
  );
}

function QRPrintCard({
  title,
  subtitle,
  qrSvg,
  qrPng,
  url,
  colorClass,
  instructions,
  large = false,
}: {
  title: string;
  subtitle: string;
  qrSvg: string;
  qrPng: string;
  url: string;
  colorClass: string;
  instructions: string;
  large?: boolean;
}) {
  const safeName = title.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "code";

  const downloadDataUrl = (href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    // Re-add explicit pixel dimensions for the downloaded file (the on-screen
    // version uses width/height: 100% so it can be sized by its container),
    // since a standalone file needs real dimensions when opened on its own.
    const exportableSvg = qrSvg
      .replace('width="100%"', 'width="1200"')
      .replace('height="100%"', 'height="1200"');
    const blob = new Blob([exportableSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    downloadDataUrl(url, `QR_${safeName}.svg`);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!qrPng) return;
    downloadDataUrl(qrPng, `QR_${safeName}.png`);
  };

  return (
    <div className="rounded-3xl overflow-hidden border-2 border-slate-300 bg-white shadow-lg print:shadow-none print:break-inside-avoid">
      <div className={`p-5 text-white bg-gradient-to-r ${colorClass}`}>
        <div className={`font-black ${large ? "text-3xl" : "text-2xl"}`}>{title}</div>
        <div className="text-white/90 text-sm mt-1">{subtitle}</div>
      </div>
      <div className="p-5 flex flex-col items-center">
        {qrSvg ? (
          // Rendered as crisp vector SVG (never rasterized/blurred by
          // on-screen zoom or print scaling) — this is what fixes denser
          // zone QR codes being unreliable to scan while the short/simple
          // entry QR scanned fine. All QR codes print at the same generous
          // size regardless of the "large" flag (which only affects the
          // heading/title size for visual hierarchy).
          <div
            className="w-72 h-72 md:w-80 md:h-80 bg-white p-2"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        ) : (
          <div className="w-72 h-72 md:w-80 md:h-80 grid place-items-center text-slate-400">
            Generating...
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-3 w-full print:hidden">
          <button
            onClick={handleDownloadPng}
            disabled={!qrPng}
            className="btn-secondary !py-2 !px-3 text-xs"
          >
            ⬇️ PNG (for docs)
          </button>
          <button
            onClick={handleDownloadSvg}
            disabled={!qrSvg}
            className="btn-secondary !py-2 !px-3 text-xs"
          >
            ⬇️ SVG (sharpest)
          </button>
        </div>
        <div className="mt-4 w-full rounded-xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
            Scan URL (share this if QR doesn't scan)
          </div>
          <div className="font-mono text-xs break-all text-slate-700">{url}</div>
        </div>
        <div className="mt-3 text-xs text-slate-600 text-center italic">{instructions}</div>
      </div>
    </div>
  );
}
