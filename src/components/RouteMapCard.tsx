import { STATIONS, type StationId } from "@/lib/stations";
import { StationIconSvg } from "./StationIcon";
import { TricolorRibbon } from "./BrandArt";

export function RouteMapCard({ collected }: { collected: StationId[] }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#fbf6ea] shadow-xl ring-1 ring-slate-300/60">
      <div className="absolute inset-3 rounded-2xl border border-slate-400/40 pointer-events-none" />
      <div className="relative px-5 py-7 md:px-8 md:py-8">
        <div className="text-center mb-1">
          <div className="inline-block rounded-md bg-[#1e3a8a] text-white px-5 py-2 font-black tracking-wide text-base md:text-lg uppercase">
            Your Exhibition Route
          </div>
        </div>
        <p className="text-center text-sm text-slate-600 italic mb-6">
          Follow the trail. Explore. Collect your stamps!
        </p>

        {/* Reception / start */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-slate-700 text-white grid place-items-center shrink-0 shadow">
            <ReceptionIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="font-black text-slate-800 text-sm">1. RECEPTION</div>
            <div className="text-xs text-slate-600">Scan &amp; Register (Get Your Passport)</div>
          </div>
          <span className="ml-auto text-[10px] font-black bg-emerald-600 text-white rounded-full px-2.5 py-1 uppercase tracking-wide">
            Start
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {STATIONS.map((s, idx) => {
            const done = collected.includes(s.id);
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full grid place-items-center shrink-0 shadow text-white"
                  style={{ backgroundColor: done ? "#16a34a" : s.hex }}
                >
                  {done ? (
                    <CheckIcon className="h-6 w-6" />
                  ) : (
                    <StationIconSvg icon={s.icon} className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="font-black text-slate-800 text-sm">
                    {idx + 2}. {s.name.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-600">{s.description.split("—")[0].trim()}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Finish */}
        <div className="mt-6 flex items-center gap-3 border-t border-dashed border-slate-300 pt-5">
          <div className="h-12 w-12 rounded-full bg-amber-500 text-white grid place-items-center shrink-0 shadow">
            <FlagIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-black text-slate-800 text-sm">
              {STATIONS.length + 2}. COMPLETE YOUR JOURNEY
            </div>
            <div className="text-xs text-slate-600">
              Collect all stamps &amp; get your e-Certificate!
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <TricolorRibbon className="h-2.5 w-12" />
          <span className="text-xs font-bold text-slate-700 italic">
            Together for a Brighter Future!
          </span>
        </div>
      </div>
    </div>
  );
}

function ReceptionIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="7" r="3" />
      <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FlagIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={1.8}>
      <path d="M5 3v18" strokeLinecap="round" />
      <path d="M5 4h13l-3 4 3 4H5" strokeLinejoin="round" />
    </svg>
  );
}
