"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STATIONS, type StationId } from "@/lib/stations";
import {
  getVisitor,
  getCollectedStamps,
  hasCollectedAll,
  clearVisitor,
  type Visitor,
} from "@/lib/storage";
import { PassportCard } from "@/components/PassportCard";
import { WelcomeCard } from "@/components/WelcomeCard";
import { RouteMapCard } from "@/components/RouteMapCard";
import { StampSheetCard } from "@/components/StampSheetCard";
import { QRScannerModal } from "@/components/QRScannerModal";
import { EVENT_NAME } from "@/lib/branding";

export default function DashboardPage() {
  const router = useRouter();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [collected, setCollected] = useState<StationId[]>([]);
  const [activeTab, setActiveTab] = useState<"passport" | "welcome" | "route" | "stamps">(
    "passport",
  );
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    const v = getVisitor();
    if (!v) {
      router.replace("/");
      return;
    }
    setVisitor(v);
    setCollected(getCollectedStamps());
    const onFocus = () => setCollected(getCollectedStamps());
    window.addEventListener("focus", onFocus);
    const interval = setInterval(onFocus, 2000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [router]);

  if (!visitor) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="text-slate-500">Loading...</div>
      </main>
    );
  }

  const allDone = hasCollectedAll();
  const progress = (collected.length / STATIONS.length) * 100;

  const handleReset = () => {
    if (confirm("Reset all data? This will erase your registration and stamps.")) {
      clearVisitor();
      router.replace("/");
    }
  };

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base md:text-lg font-black text-slate-800">
              🎪 {EVENT_NAME} Passport
            </h1>
            <p className="text-xs text-slate-500">
              {visitor.name} • Class {visitor.className}-{visitor.section}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {allDone && (
              <Link href="/certificate" className="hidden sm:inline-flex btn-primary !py-2 !px-4 text-sm">
                🏆 Certificate
              </Link>
            )}
            <button
              onClick={handleReset}
              className="rounded-full bg-white border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
              title="Reset"
            >
              🔄 Reset
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
            <span>Stamps collected</span>
            <span>{collected.length}/{STATIONS.length}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 via-rose-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-5">
        {!allDone && (
          <button
            onClick={() => setScannerOpen(true)}
            className="w-full mb-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base md:text-lg py-4 px-5 shadow-lg shadow-emerald-300/50 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📷</span>
            Scan Zone QR Code to Collect a Stamp
          </button>
        )}

        <nav className="grid grid-cols-4 gap-2 mb-5">
          {[
            { key: "passport", label: "Passport", icon: "📘" },
            { key: "welcome", label: "Welcome", icon: "🎉" },
            { key: "route", label: "Route", icon: "🗺️" },
            { key: "stamps", label: "Stamps", icon: "🔖" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as typeof activeTab)}
              className={`rounded-2xl px-2 py-3 text-xs md:text-sm font-bold transition-all ${
                activeTab === t.key
                  ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-300"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-orange-300"
              }`}
            >
              <div className="text-xl mb-0.5">{t.icon}</div>
              {t.label}
            </button>
          ))}
        </nav>

        {activeTab === "passport" && (
          <PassportCard
            name={visitor.name}
            classSection={`${visitor.className} - ${visitor.section}`}
            passportNumber={visitor.passportNumber}
            issuedOn={new Date(visitor.registeredAt).toLocaleDateString()}
          />
        )}
        {activeTab === "welcome" && <WelcomeCard name={visitor.name} />}
        {activeTab === "route" && <RouteMapCard collected={collected} />}
        {activeTab === "stamps" && (
          <>
            <StampSheetCard collected={collected} />
            {!allDone && (
              <button
                onClick={() => setScannerOpen(true)}
                className="btn-primary w-full mt-4 !py-4 text-base"
              >
                📷 Scan QR Code Now
              </button>
            )}
          </>
        )}

        {allDone && (
          <div className="mt-6 card p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              Congratulations! All Stamps Collected!
            </h3>
            <p className="text-slate-600 mb-4">
              You've visited all 6 exhibition zones. Your National Digital Certificate is ready!
            </p>
            <Link href="/certificate" className="btn-primary">
              📜 View & Download Certificate
            </Link>
          </div>
        )}

        <div className="mt-5 rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
          💡 <b>How to scan:</b> Tap the green <b>"Scan Zone QR Code"</b> button above, allow
          camera access, and point your phone at the QR code placed at each exhibition zone. The
          stamp is added automatically the moment it's recognised.
        </div>
      </div>

      {/* Floating scan button, always reachable while scrolling */}
      {!allDone && (
        <button
          onClick={() => setScannerOpen(true)}
          className="fixed bottom-6 right-6 z-30 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-400/50 grid place-items-center text-2xl active:scale-95 transition-transform"
          aria-label="Scan QR code"
          title="Scan QR Code"
        >
          📷
        </button>
      )}

      <QRScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </main>
  );
}
