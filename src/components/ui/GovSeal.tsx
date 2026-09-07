/**
 * Plausible Department of Land Resources-style seal — a GIGW trust signal
 * for the header/landing page. This is an original circular-seal design
 * (a stylised wheel + department ring text), not a reproduction of the
 * State Emblem of India, which is protected under the State Emblem of
 * India (Prohibition of Improper Use) Act, 1950.
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
      <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-brand)" strokeWidth="2" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-brand)" strokeWidth="1" />
      <path
        id="sealRingPath"
        d="M 50 10 A 40 40 0 1 1 49.9 10"
        fill="none"
      />
      <text fontSize="6.2" fill="var(--color-brand-dark)" fontFamily="var(--font-sans)" letterSpacing="1.2">
        <textPath href="#sealRingPath" startOffset="2%">
          GOVERNMENT OF INDIA • DEPARTMENT OF LAND RESOURCES •
        </textPath>
      </text>
      <g transform="translate(50,50)">
        <circle r="16" fill="none" stroke="var(--color-brand)" strokeWidth="1.5" />
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          return (
            <line
              key={i}
              x1="0"
              y1="-16"
              x2="0"
              y2="-20"
              stroke="var(--color-brand)"
              strokeWidth="1.2"
              transform={`rotate(${angle})`}
            />
          );
        })}
        <path
          d="M -8 6 L 0 -9 L 8 6 Z"
          fill="none"
          stroke="var(--color-saffron)"
          strokeWidth="1.5"
        />
        <circle r="2" fill="var(--color-brand)" />
      </g>
    </svg>
  );
}
