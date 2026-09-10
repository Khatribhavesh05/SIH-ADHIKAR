/**
 * Generic Department of Land Resources seal using line-art document & map pin motifs.
 * Strict compliance with legal guidelines (no state emblems or Ashoka Chakra graphics).
 */
export function GovSeal({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Department of Land Resources seal"
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="var(--color-brand)" strokeWidth="1" strokeDasharray="3 3" />
      
      {/* Outer Ring Text Path */}
      <path
        id="sealRingPath"
        d="M 50 11 A 39 39 0 1 1 49.9 11"
        fill="none"
      />
      <text fontSize="5.8" fill="var(--color-brand-dark)" fontWeight="600" letterSpacing="1">
        <textPath href="#sealRingPath" startOffset="3%">
          DEPARTMENT OF LAND RESOURCES • ADHIKAR •
        </textPath>
      </text>

      {/* Central Motif: Document + Map Pin Line Art */}
      <g transform="translate(50,50)">
        {/* Document Icon Line Art */}
        <rect x="-14" y="-15" width="20" height="26" rx="2" fill="none" stroke="var(--color-brand)" strokeWidth="1.8" />
        <line x1="-9" y1="-9" x2="1" y2="-9" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-9" y1="-4" x2="1" y2="-4" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-9" y1="1" x2="-2" y2="1" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Saffron Accent Map Pin Overlay Line Art */}
        <path
          d="M 6 -12 C 2 -12 -1 -9 -1 -5 C -1 0 6 7 6 7 C 6 7 13 0 13 -5 C 13 -9 10 -12 6 -12 Z"
          fill="none"
          stroke="var(--color-saffron)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="6" cy="-5" r="2" fill="var(--color-saffron)" />
      </g>
    </svg>
  );
}
