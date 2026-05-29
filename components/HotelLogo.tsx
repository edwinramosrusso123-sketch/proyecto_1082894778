// Logo SVG: edificio de hotel con símbolo de llave.
export function HotelLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-label="HotelApp">
      <rect x="9" y="6" width="22" height="36" rx="2.5" fill="currentColor" opacity="0.16" />
      <rect x="9" y="6" width="22" height="36" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
      {/* ventanas */}
      <g fill="currentColor">
        <rect x="13" y="11" width="3.4" height="3.4" rx="0.6" />
        <rect x="18.5" y="11" width="3.4" height="3.4" rx="0.6" />
        <rect x="24" y="11" width="3.4" height="3.4" rx="0.6" />
        <rect x="13" y="17" width="3.4" height="3.4" rx="0.6" />
        <rect x="18.5" y="17" width="3.4" height="3.4" rx="0.6" />
        <rect x="24" y="17" width="3.4" height="3.4" rx="0.6" />
        <rect x="13" y="23" width="3.4" height="3.4" rx="0.6" />
        <rect x="24" y="23" width="3.4" height="3.4" rx="0.6" />
      </g>
      {/* puerta */}
      <rect x="16.5" y="33" width="7" height="9" rx="1" fill="currentColor" />
      {/* llave (acento) */}
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="36" cy="25" r="4.5" fill="none" />
        <path d="M36 29.5 L36 40" />
        <path d="M33.5 35.5 L36 35.5" />
        <path d="M33.5 38.5 L36 38.5" />
      </g>
    </svg>
  );
}
