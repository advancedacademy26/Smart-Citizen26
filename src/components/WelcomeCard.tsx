import { TricolorRibbon, CitySkyline } from "./BrandArt";
import { SCHOOL_NAME, EVENT_NAME, EVENT_SUBTITLE, EVENT_THEME, WELCOME_FOOTER } from "@/lib/branding";

export function WelcomeCard({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#fbf6ea] shadow-xl ring-1 ring-slate-300/60">
      <div className="absolute inset-3 rounded-2xl border border-slate-400/40 pointer-events-none" />
      <div className="relative px-6 py-8 md:px-10 md:py-10 text-center flex flex-col items-center">
        <div className="text-[11px] md:text-xs font-bold tracking-[0.25em] text-slate-700 uppercase">
          {SCHOOL_NAME}
        </div>
        <div className="mt-1 h-px w-28 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />

        <div className="mt-6 font-serif italic text-4xl md:text-5xl text-[#1e3a8a]" style={{ fontFamily: "'Brush Script MT', cursive, Georgia, serif" }}>
          Welcome
        </div>
        <div className="text-sm tracking-[0.3em] uppercase text-slate-600 mt-1">to the</div>

        <div className="mt-3 flex items-center gap-1.5">
          <SparkleIcon className="h-6 w-6 text-fuchsia-500" />
          <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 bg-clip-text text-transparent tracking-wide">
            {EVENT_NAME}
          </span>
        </div>
        <div className="mt-1 text-xs md:text-sm font-bold tracking-widest text-[#1e3a8a] uppercase">
          {EVENT_SUBTITLE}
        </div>
        <div className="text-[11px] md:text-xs font-semibold tracking-wider text-slate-600 uppercase mt-0.5">
          {EVENT_THEME}
        </div>

        <div className="mt-6 max-w-md text-left space-y-3 text-[#1e293b]">
          <p className="font-bold">Dear {name},</p>
          <p className="text-sm leading-relaxed">
            It is our absolute pleasure to welcome you to <b>{EVENT_NAME}</b> — our Annual Exhibition{" "}
            {EVENT_SUBTITLE.replace("Annual Exhibition ", "")}. Your presence inspires us all and adds
            great value to our vision of a brighter, innovative and sustainable future.
          </p>
          <p className="text-center font-serif italic text-base md:text-lg text-[#1e3a8a] pt-1">
            "Together, let us build a stronger tomorrow."
          </p>
        </div>

        <div className="mt-6">
          <TricolorRibbon className="h-2.5 w-16" />
        </div>
        <div className="mt-2 text-xs font-bold tracking-[0.2em] text-slate-700 uppercase">
          {WELCOME_FOOTER}
        </div>
      </div>
      <CitySkyline className="absolute bottom-0 left-0 w-full h-10 text-slate-500" />
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
