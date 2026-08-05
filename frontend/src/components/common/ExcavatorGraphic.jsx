// ExcavatorGraphic.jsx — stylized flat-vector excavator silhouette in the
// CAT black/yellow palette. No external image asset; renders crisp at any
// size and matches the rest of the icon-driven UI.
export default function ExcavatorGraphic({ className }) {
  return (
    <svg
      viewBox="0 0 420 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ground glow */}
      <ellipse cx="230" cy="228" rx="170" ry="16" fill="#FFC72C" opacity="0.12" />

      {/* tracks */}
      <rect x="70" y="196" width="230" height="34" rx="17" fill="#101010" />
      <circle cx="95" cy="213" r="15" fill="#2b2b2e" />
      <circle cx="145" cy="213" r="15" fill="#2b2b2e" />
      <circle cx="195" cy="213" r="15" fill="#2b2b2e" />
      <circle cx="245" cy="213" r="15" fill="#2b2b2e" />
      <circle cx="275" cy="213" r="15" fill="#2b2b2e" />
      {[95, 145, 195, 245, 275].map((cx) => (
        <circle key={cx} cx={cx} cy={213} r="6" fill="#FFC72C" />
      ))}

      {/* undercarriage base */}
      <rect x="95" y="176" width="190" height="26" rx="6" fill="#e6b325" />

      {/* cab body */}
      <rect x="120" y="112" width="120" height="70" rx="10" fill="#FFC72C" />
      {/* cab windshield */}
      <path d="M132 122 H210 L226 150 H132 Z" fill="#101010" />
      <path d="M138 128 H200 L212 146 H138 Z" fill="#3a3a3e" opacity="0.6" />
      {/* cab roof stripe */}
      <rect x="120" y="112" width="120" height="10" rx="5" fill="#101010" />
      {/* door line */}
      <line x1="226" y1="112" x2="226" y2="182" stroke="#101010" strokeWidth="3" />

      {/* counterweight */}
      <rect x="228" y="130" width="52" height="52" rx="8" fill="#101010" />

      {/* boom */}
      <path d="M170 128 L268 78 L286 96 L206 146 Z" fill="#FFC72C" stroke="#101010" strokeWidth="4" strokeLinejoin="round" />
      {/* arm */}
      <path d="M258 84 L330 118 L322 140 L252 108 Z" fill="#e6b325" stroke="#101010" strokeWidth="4" strokeLinejoin="round" />
      {/* bucket */}
      <path
        d="M320 122 L360 132 C370 136 372 150 364 158 L336 172 C326 176 316 170 314 160 L310 138 Z"
        fill="#101010"
      />
      <path d="M320 122 L360 132 M330 172 L364 158" stroke="#FFC72C" strokeWidth="3" strokeLinecap="round" />

      {/* pivot pins */}
      <circle cx="206" cy="146" r="6" fill="#101010" />
      <circle cx="252" cy="108" r="5" fill="#101010" />
      <circle cx="170" cy="128" r="6" fill="#101010" />
    </svg>
  );
}
