import type { StationIcon } from "@/lib/stations";

export function StationIconSvg({
  icon,
  className = "h-8 w-8",
  strokeWidth = 1.8,
}: {
  icon: StationIcon;
  className?: string;
  strokeWidth?: number;
}) {
  switch (icon) {
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M20 4c-9 0-16 5-16 14 9 0 16-5 16-14z" strokeLinejoin="round" />
          <path d="M5 19C9 13 13 9 19 5" strokeLinecap="round" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth}>
          <path
            d="M12 20s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z"
            strokeLinejoin="round"
          />
          <path d="M7 11.5l2.5 2.5L15 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "wifi":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth}>
          <rect x="3" y="5" width="18" height="12" rx="1.5" />
          <path d="M3 9h18" />
          <circle cx="7" cy="13" r="0.8" fill="currentColor" stroke="none" />
          <path d="M3 19h18" strokeLinecap="round" />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.8 2.6 4.3 5.7 4.3 9s-1.5 6.4-4.3 9c-2.8-2.6-4.3-5.7-4.3-9S9.2 5.6 12 3z" />
          <path d="M15 17c1.8-1 3-1 5-0.3" strokeLinecap="round" />
        </svg>
      );
    case "city":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth}>
          <path d="M3 21V9l5-3v15" strokeLinejoin="round" />
          <path d="M8 21V6l5-3v18" strokeLinejoin="round" />
          <path d="M13 21V10l5 2v9" strokeLinejoin="round" />
          <path d="M3 21h18" strokeLinecap="round" />
          <path d="M9.5 9h1M9.5 12h1M9.5 15h1" strokeLinecap="round" />
        </svg>
      );
    case "star-person":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth={strokeWidth}>
          <circle cx="9" cy="6" r="2.5" />
          <path d="M4 20c0-3.3 2.2-6 5-6s5 2.7 5 6" strokeLinecap="round" />
          <path
            d="M18 10.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}
