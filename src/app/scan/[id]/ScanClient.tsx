"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STATION_MAP, type StationId, STATIONS } from "@/lib/stations";
import { addStamp, getCollectedStamps, getVisitor, hasCollectedAll, type Visitor } from "@/lib/storage";
import { StationIconSvg } from "@/components/StationIcon";
import { StampBadge } from "@/components/StampSheetCard";
import { celebrateAllStampsCollected } from "@/lib/confetti";

export function ScanClient({ id }: { id: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "already" | "invalid" | "not-registered">("loading");
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [stationId, setStationId] = useState<StationId | null>(null);
  const [totalCollected, setTotalCollected] = useState(0);
  const [allCollected, setAllCollected] = useState(false);

  useEffect(() => {
    const stationIdCandidate = id as StationId;
    if (!stationIdCandidate || !(stationIdCandidate in STATION_MAP)) {
      setStatus("invalid");
      return;
    }
    setStationId(stationIdCandidate);
    const v = getVisitor();
    if (!v) {
      setStatus("not-registered");
      return;
    }
    setVisitor(v);
    const collectedBefore = getCollectedStamps();
    const already = collectedBefore.includes(stationIdCandidate);
    const updated = addStamp(stationIdCandidate);
    const nowAllCollected = hasCollectedAll();
    setTotalCollected(updated.length);
    setAllCollected(nowAllCollected);
    setStatus(already ? "already" : "success");

    // Celebrate the exact moment the visitor collects their final (6th)
    // stamp — only fires on a genuinely new completion, not if they revisit
    // an already-collected zone afterward.
    if (!already && nowAllCollected) {
      celebrateAllStampsCollected();
    }
  }, [id]);

  const station = stationId ? STATION_MAP[stationId] : null;

  if (status === "loading") {
    return (
      <main className="min-h-screen grid place-items-center confetti-bg p-4">
        <div className="card p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-3" />
          <p className="text-slate-600">Recording your stamp...</p>
        </div>
      </main>
    );
  }

  if (status === "invalid") {
    return (
      <main className="min-h-screen grid place-items-center confetti-bg p-4">
        <div className="card p-8 max-w-sm text-center">
          <div className="text-6xl mb-3">❓</div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Invalid QR Code</h1>
          <p className="text-slate-600 mb-5">
            This QR code is not recognised. Please scan a valid exhibition zone QR code.
          </p>
          <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </main>
    );
  }

  if (status === "not-registered") {
    return (
      <main className="min-h-screen grid place-items-center confetti-bg p-4">
        <div className="card p-8 max-w-md text-center">
          <div className="text-6xl mb-3">🎟️</div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Please Register First</h1>
          <p className="text-slate-600 mb-5">
            You need to register at the entry gate before collecting stamps. Please go back to the main page.
          </p>
          <Link href="/" className="btn-primary">Register Now</Link>
        </div>
      </main>
    );
  }

  if (!station || !visitor) return null;

  const isNew = status === "success";

  return (
    <main className="min-h-screen confetti-bg flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md text-center">
        <div className="bounce-in flex justify-center">
          <StampBadge stationId={station.id} collected size="lg" />
        </div>

        <h1 className="text-3xl font-black text-slate-800 mt-4 mb-1">
          {isNew ? "Stamp Collected!" : "Already Visited"}
        </h1>
        <p className="text-lg text-slate-700 mb-1 font-semibold flex items-center justify-center gap-2">
          <StationIconSvg icon={station.icon} className="h-5 w-5" />
          {station.name}
        </p>
        <p className="text-sm text-slate-500 mb-6">
          {isNew
            ? `Great job, ${visitor.name}! Your stamp has been added to your passport.`
            : `You've already collected this stamp, ${visitor.name}.`}
        </p>

        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-2 text-sm font-bold text-slate-700">
            <span>Your Progress</span>
            <span>{totalCollected}/{STATIONS.length}</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-orange-400 via-rose-500 to-purple-500 transition-all duration-700"
              style={{ width: `${(totalCollected / STATIONS.length) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {STATIONS.map((s) => {
              const done = getCollectedStamps().includes(s.id);
              return (
                <div
                  key={s.id}
                  className={`aspect-square rounded-lg grid place-items-center ${
                    done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <StationIconSvg icon={s.icon} className="h-4 w-4" />
                </div>
              );
            })}
          </div>
        </div>

        {allCollected ? (
          <div className="card p-6 mb-5 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="text-xl font-black text-slate-800 mb-2">
              You Did It!
            </h2>
            <p className="text-sm text-slate-700 mb-4">
              You've collected all 6 stamps! Your National Digital Certificate is ready for download.
            </p>
            <Link href="/certificate" className="btn-primary w-full">
              📜 View & Download Certificate
            </Link>
          </div>
        ) : (
          <div className="card p-4 mb-5 bg-blue-50 border border-blue-200 text-sm text-blue-900">
            💡 <b>Next stop:</b> Keep exploring! You have {STATIONS.length - totalCollected} more{" "}
            {STATIONS.length - totalCollected === 1 ? "zone" : "zones"} to visit.
          </div>
        )}

        <Link href="/dashboard" className="btn-secondary w-full">
          📘 Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
