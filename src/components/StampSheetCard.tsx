import { STATIONS, type StationId } from "@/lib/stations";
import { StationIconSvg } from "./StationIcon";
import { CitySkyline } from "./BrandArt";
import { MISSION_TAG } from "@/lib/branding";

export function StampBadge({
  stationId,
  collected,
  size = "md",
}: {
  stationId: StationId;
  collected: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const station = STATIONS.find((s) => s.id === stationId)!;
  const dims = size === "lg" ? "h-32 w-32 md:h-36 md:w-36" : size === "sm" ? "h-20 w-20" : "h-28 w-28";
  const iconSize = size === "lg" ? "h-9 w-9" : size === "sm" ? "h-5 w-5" : "h-7 w-7";

  return (
    <div className={`relative ${dims} shrink-0`}>
      <svg viewBox="0 0 120 120" className="absolute inset-0 w-full h-full">
        <defs>
          <path
            id={`circlePath-${stationId}`}
            d="M 60, 60 m -44, 0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
          />
        </defs>
        <circle
          cx="60"
          cy="60"
          r="56"
          fill={collected ? "#ffffff" : "#f8fafc"}
          stroke={collected ? station.hex : "#cbd5e1"}
          strokeWidth="2"
          strokeDasharray={collected ? "0" : "4 3"}
          opacity={collected ? 1 : 0.7}
        />
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke={collected ? station.hex : "#cbd5e1"}
          strokeWidth="1.5"
        />
        <text fontSize="8.2" fontWeight="700" letterSpacing="1.5" fill={collected ? station.hex : "#94a3b8"}>
          <textPath href={`#circlePath-${stationId}`} startOffset="50%" textAnchor="middle">
            {station.name.toUpperCase()} • {station.name.toUpperCase()} •
          </textPath>
        </text>
        {Array.from({ length: 2 }).map((_, i) => {
          const angle = i === 0 ? 90 : 270;
          const rad = (angle * Math.PI) / 180;
          return (
            <text
              key={i}
              x={60 + 50 * Math.cos(rad)}
              y={60 + 50 * Math.sin(rad) + 2}
              fontSize="7"
              fill={collected ? station.hex : "#cbd5e1"}
              textAnchor="middle"
            >
              ★
            </text>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <div
          className="grid place-items-center rounded-full"
          style={{
            color: collected ? station.hex : "#94a3b8",
          }}
        >
          <StationIconSvg icon={station.icon} className={`${iconSize} ${collected ? "" : "opacity-50"}`} />
        </div>
        <div
          className="mt-1 text-[7px] md:text-[8px] font-black tracking-wider uppercase leading-none"
          style={{ color: collected ? station.hex : "#94a3b8" }}
        >
          {MISSION_TAG}
        </div>
      </div>
      {collected && (
        <div className="absolute -top-1.5 -right-1.5 h-7 w-7 rounded-full bg-green-500 border-2 border-white shadow grid place-items-center">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function StampSheetCard({ collected }: { collected: StationId[] }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#fbf6ea] shadow-xl ring-1 ring-slate-300/60">
      <div className="absolute inset-3 rounded-2xl border border-slate-400/40 pointer-events-none" />
      <div className="relative px-5 py-7 md:px-8 md:py-8">
        <div className="text-center mb-1">
          <div className="inline-block rounded-md bg-[#1e3a8a] text-white px-5 py-2 font-black tracking-wide text-base md:text-lg uppercase">
            Stamp Collection
          </div>
        </div>
        <p className="text-center text-sm text-slate-600 italic mb-6 uppercase tracking-wide">
          Collect your stamps
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 justify-items-center max-w-md mx-auto">
          {STATIONS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <StampBadge stationId={s.id} collected={collected.includes(s.id)} size="lg" />
              <div className="text-xs font-bold text-slate-700 text-center">{s.name}</div>
            </div>
          ))}
        </div>

        <div className="mt-7 text-center text-sm italic text-slate-600">
          Small steps. Big impact.
        </div>
      </div>
      <CitySkyline className="absolute bottom-0 left-0 w-full h-10 text-slate-500" />
    </div>
  );
}
