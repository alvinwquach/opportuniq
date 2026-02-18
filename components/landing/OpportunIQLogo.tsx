export function OpportunIQLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer hexagon */}
      <path d="M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z" stroke="currentColor" strokeWidth="3" fill="none" />
      {/* Inner hexagon */}
      <path d="M50 15 L75 30 L75 60 L50 75 L25 60 L25 30 Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15" />
      {/* Magnifying glass circle */}
      <circle cx="50" cy="45" r="15" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="70 30" transform="rotate(-90 50 45)" />
      {/* Magnifying glass handle */}
      <path d="M 60 55 L 70 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="50" cy="45" r="5" fill="currentColor" />
    </svg>
  );
}
