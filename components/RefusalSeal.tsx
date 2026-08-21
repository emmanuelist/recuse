/**
 * Signature component #1 — the refusal, struck onto the record as a seal.
 *
 * Drawn rather than decorated: concentric rings, the legend set on a circular
 * path, and a bar struck through the centre. It reads as an institutional act
 * — a clerk denying a filing — instead of an error state, which is exactly
 * what happened. Seal red exists in this product for this object alone.
 */
export function RefusalSeal({ size = 190 }: { size?: number }) {
  const id = "seal-legend";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label="Authority withheld"
      className="strike shrink-0"
      style={{ filter: "drop-shadow(0 8px 28px var(--seal-glow))" }}
    >
      <defs>
        <path
          id={id}
          d="M100,100 m-73,0 a73,73 0 1,1 146,0 a73,73 0 1,1 -146,0"
          fill="none"
        />
      </defs>

      <circle cx="100" cy="100" r="94" fill="none" stroke="var(--seal)" strokeWidth="1" opacity="0.35" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="var(--seal)" strokeWidth="3" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="var(--seal)" strokeWidth="1.5" opacity="0.5" />

      {/* Perforation ring — the tooth marks of a struck seal. */}
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * 79}
            y1={100 + Math.sin(a) * 79}
            x2={100 + Math.cos(a) * 84}
            y2={100 + Math.sin(a) * 84}
            stroke="var(--seal)"
            strokeWidth="1.5"
            opacity="0.5"
          />
        );
      })}

      <text
        fill="var(--seal)"
        fontFamily="var(--font-mono)"
        fontSize="10"
        fontWeight="500"
        letterSpacing="4.6"
      >
        <textPath href={`#${id}`} startOffset="25%" textAnchor="middle">
          AUTHORITY WITHHELD
        </textPath>
      </text>

      <line x1="52" y1="82" x2="148" y2="82" stroke="var(--seal)" strokeWidth="1" opacity="0.45" />
      <text
        x="100" y="105" textAnchor="middle"
        fill="var(--seal)" fontFamily="var(--font-sans)"
        fontSize="23" fontWeight="600" letterSpacing="-0.3"
      >
        MAY NOT
      </text>
      <text
        x="100" y="126" textAnchor="middle"
        fill="var(--seal)" fontFamily="var(--font-mono)"
        fontSize="10" fontWeight="500" letterSpacing="3"
      >
        SIGN
      </text>
      <line x1="52" y1="140" x2="148" y2="140" stroke="var(--seal)" strokeWidth="1" opacity="0.45" />
      <text
        x="100" y="171" textAnchor="middle"
        fill="var(--seal)" fontFamily="var(--font-mono)"
        fontSize="9" fontWeight="500" letterSpacing="2.4" opacity="0.75"
      >
        RECUSE
      </text>
    </svg>
  );
}
