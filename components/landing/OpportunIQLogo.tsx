export function OpportunIQLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z"
        stroke="#00F0FF"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M50 15 L75 30 L75 60 L50 75 L25 60 L25 30 Z"
        stroke="#00F0FF"
        strokeWidth="2"
        fill="url(#hexGradient)"
      />
      <circle
        cx="50"
        cy="45"
        r="15"
        stroke="#00F0FF"
        strokeWidth="3"
        fill="none"
        strokeDasharray="70 30"
        transform="rotate(-90 50 45)"
      />
      <path
        d="M 60 55 L 68 63"
        stroke="#00F0FF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle
        cx="50"
        cy="45"
        r="4"
        fill="#00F0FF"
      >
        <animate
          attributeName="opacity"
          values="1;0.4;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <g opacity="0.3">
        <line x1="20" y1="35" x2="80" y2="35" stroke="#00F0FF" strokeWidth="0.5" />
        <line x1="20" y1="45" x2="80" y2="45" stroke="#00F0FF" strokeWidth="0.5" />
        <line x1="20" y1="55" x2="80" y2="55" stroke="#00F0FF" strokeWidth="0.5" />
      </g>
      <g stroke="#00F0FF" strokeWidth="1.5" opacity="0.8">
        <path d="M 10 20 L 10 10 L 20 10" />
        <path d="M 80 10 L 90 10 L 90 20" />
        <path d="M 90 70 L 90 80 L 80 80" />
        <path d="M 20 80 L 10 80 L 10 70" />
      </g>
      <defs>
        <radialGradient id="hexGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
