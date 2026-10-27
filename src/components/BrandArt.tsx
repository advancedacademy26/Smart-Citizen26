// Shared decorative SVG art pieces used across Passport / Welcome / Route / Stamps
// to recreate the "Advanced Academy Indore — SPECTRA" design language.

export function OrnateCorner({ className = "", flip = "" }: { className?: string; flip?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={`${className} ${flip}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 56V20c0-9 7-16 16-16h36" strokeLinecap="round" />
      <path d="M12 56V28c0-7 5-12 12-12h32" strokeLinecap="round" />
      <circle cx="4" cy="56" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CompassRose({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="2.5" fill="currentColor" />
      <path d="M50 8 L58 50 L50 92 L42 50 Z" fill="currentColor" opacity="0.9" />
      <path d="M8 50 L50 42 L92 50 L50 58 Z" fill="currentColor" opacity="0.5" />
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i * 360) / 16;
        const r1 = 46;
        const r2 = 42;
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={50 + r2 * Math.cos(rad)}
            y1={50 + r2 * Math.sin(rad)}
            x2={50 + r1 * Math.cos(rad)}
            y2={50 + r1 * Math.sin(rad)}
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

export function AshokaChakra({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#1e3a8a" strokeWidth="3" />
      <circle cx="50" cy="50" r="4" fill="#1e3a8a" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 360) / 24;
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={i}
            x1={50 + 6 * Math.cos(rad)}
            y1={50 + 6 * Math.sin(rad)}
            x2={50 + 40 * Math.cos(rad)}
            y2={50 + 40 * Math.sin(rad)}
            stroke="#1e3a8a"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

/** Stylised India map silhouette filled with the tricolour, inspired by the reference art */
export function IndiaTricolorMap({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className}>
      <defs>
        <clipPath id="indiaClip">
          <path d="M55 4c10 2 16 10 22 14 8 5 16 4 20 10 3 5-2 10-7 12-4 2-4 7-1 11 4 5 10 6 10 13 0 8-9 10-14 16-4 5-2 12-8 16-5 4-13 1-16 7-3 6 2 13-4 17-5 4-12 0-16-4-5-5-4-12-10-15-6-3-14 1-18-4-4-5 1-11-2-17-3-5-10-5-12-11-2-6 4-10 3-16-1-6-8-8-7-14 1-6 9-7 12-12 3-5-1-11 4-15 5-4 12 0 17-4 4-4 2-10 7-13 4-3 11-2 20-1z" />
        </clipPath>
      </defs>
      <g clipPath="url(#indiaClip)">
        <rect x="0" y="0" width="120" height="47" fill="#FF9933" />
        <rect x="0" y="47" width="120" height="46" fill="#FFFFFF" />
        <rect x="0" y="93" width="120" height="47" fill="#128807" />
        <circle cx="60" cy="70" r="9" fill="none" stroke="#000080" strokeWidth="1.6" />
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={60 + 1.5 * Math.cos(rad)}
              y1={70 + 1.5 * Math.sin(rad)}
              x2={60 + 9 * Math.cos(rad)}
              y2={70 + 9 * Math.sin(rad)}
              stroke="#000080"
              strokeWidth="0.8"
            />
          );
        })}
      </g>
      <path
        d="M55 4c10 2 16 10 22 14 8 5 16 4 20 10 3 5-2 10-7 12-4 2-4 7-1 11 4 5 10 6 10 13 0 8-9 10-14 16-4 5-2 12-8 16-5 4-13 1-16 7-3 6 2 13-4 17-5 4-12 0-16-4-5-5-4-12-10-15-6-3-14 1-18-4-4-5 1-11-2-17-3-5-10-5-12-11-2-6 4-10 3-16-1-6-8-8-7-14 1-6 9-7 12-12 3-5-1-11 4-15 5-4 12 0 17-4 4-4 2-10 7-13 4-3 11-2 20-1z"
        fill="none"
        stroke="#92400e"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function TricolorRibbon({ className = "h-3 w-20" }: { className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-sm ${className}`}>
      <div className="flex-1 bg-[#FF9933]" />
      <div className="flex-1 bg-white" />
      <div className="flex-1 bg-[#128807]" />
    </div>
  );
}

export function CitySkyline({ className = "w-full h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 60" preserveAspectRatio="none" className={className} fill="currentColor" opacity="0.25">
      <rect x="0" y="30" width="18" height="30" />
      <rect x="22" y="15" width="14" height="45" />
      <rect x="40" y="25" width="20" height="35" />
      <polygon points="70,10 85,10 85,60 55,60" />
      <rect x="92" y="35" width="16" height="25" />
      <rect x="112" y="5" width="12" height="55" />
      <rect x="128" y="22" width="22" height="38" />
      <rect x="155" y="18" width="14" height="42" />
      <rect x="174" y="32" width="18" height="28" />
      <polygon points="200,8 215,8 215,60 185,60" />
      <rect x="222" y="26" width="16" height="34" />
      <rect x="242" y="14" width="20" height="46" />
      <rect x="266" y="30" width="14" height="30" />
      <rect x="284" y="20" width="18" height="40" />
      <rect x="306" y="34" width="20" height="26" />
      <rect x="330" y="10" width="14" height="50" />
      <rect x="348" y="24" width="22" height="36" />
      <rect x="374" y="30" width="16" height="30" />
    </svg>
  );
}
