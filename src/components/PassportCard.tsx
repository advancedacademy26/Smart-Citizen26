import { IndiaTricolorMap, CompassRose, OrnateCorner } from "./BrandArt";
import {
  SCHOOL_NAME,
  EVENT_NAME,
  EVENT_SUBTITLE,
  EVENT_THEME,
  PASSPORT_TITLE,
  FOOTER_TAGLINE,
  BRAND_YEAR,
} from "@/lib/branding";

interface PassportCardProps {
  name: string;
  classSection: string;
  passportNumber: string;
  issuedOn: string;
}

/**
 * Recreates the navy & gold "Passport" cover design, personalised
 * for the visitor instead of "Chief Guest".
 */
export function PassportCard({ name, classSection, passportNumber, issuedOn }: PassportCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-b from-[#0b1f44] to-[#132a57] text-amber-50 shadow-2xl ring-1 ring-amber-300/30">
      {/* Ornate gold frame */}
      <div className="absolute inset-3 rounded-2xl border-[1.5px] border-amber-400/70 pointer-events-none" />
      <div className="absolute inset-[18px] rounded-xl border border-amber-400/30 pointer-events-none" />
      <OrnateCorner className="absolute top-3 left-3 h-9 w-9 text-amber-400/80" />
      <OrnateCorner className="absolute top-3 right-3 h-9 w-9 text-amber-400/80 -scale-x-100" />
      <OrnateCorner className="absolute bottom-3 left-3 h-9 w-9 text-amber-400/80 -scale-y-100" />
      <OrnateCorner className="absolute bottom-3 right-3 h-9 w-9 text-amber-400/80 -scale-x-100 -scale-y-100" />

      <div className="relative px-7 py-8 md:px-10 md:py-10 flex flex-col items-center text-center">
        <div className="text-[11px] md:text-xs font-bold tracking-[0.25em] text-amber-300 uppercase">
          {SCHOOL_NAME}
        </div>
        <div className="mt-1 h-px w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <div className="mt-5 flex items-center justify-center gap-2">
          <IndiaTricolorMap className="h-16 w-14 drop-shadow" />
          <div className="flex flex-col items-start">
            <span className="text-2xl font-black text-amber-300 leading-none">{BRAND_YEAR}</span>
            <span className="text-amber-400 text-xl leading-none">↗</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-1.5">
          <SparkleIcon className="h-7 w-7 text-fuchsia-400" />
          <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent tracking-wide">
            {EVENT_NAME}
          </span>
        </div>
        <div className="mt-1 text-xs md:text-sm font-semibold tracking-widest text-slate-100/90 uppercase">
          {EVENT_SUBTITLE}
        </div>
        <div className="text-[11px] md:text-xs font-medium tracking-wider text-amber-300/90 uppercase mt-0.5">
          {EVENT_THEME}
        </div>

        <div className="mt-6 w-full max-w-[280px] rounded-lg border-2 border-amber-400/80 px-4 py-3">
          <div className="text-[10px] tracking-[0.3em] text-amber-200 uppercase">Visitor</div>
          <div className="text-xl md:text-2xl font-black tracking-wide text-white uppercase">{PASSPORT_TITLE}</div>
        </div>

        <div className="mt-5 w-full max-w-[300px] space-y-1.5 text-left bg-white/5 rounded-xl p-3 border border-amber-400/20">
          <PassportRow label="Name" value={name} />
          <PassportRow label="Class" value={classSection} />
          <PassportRow label="Passport No." value={passportNumber} />
          <PassportRow label="Issued" value={issuedOn} />
        </div>

        <div className="mt-6">
          <CompassRose className="h-9 w-9 text-amber-400" />
        </div>

        <div className="mt-4 text-[10px] md:text-[11px] tracking-[0.3em] text-amber-300/90 uppercase">
          {FOOTER_TAGLINE}
        </div>
      </div>
    </div>
  );
}

function PassportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[13px]">
      <span className="text-amber-200/70 uppercase tracking-wider text-[10px]">{label}</span>
      <span className="font-bold text-amber-50 text-right">{value}</span>
    </div>
  );
}

function SparkleIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
    </svg>
  );
}
