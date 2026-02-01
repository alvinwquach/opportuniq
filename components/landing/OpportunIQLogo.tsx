export function OpportunIQLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central hub */}
      <circle cx="16" cy="16" r="4" fill="currentColor" />
      {/* Outer nodes */}
      <circle cx="16" cy="5" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="25.5" cy="11" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="25.5" cy="21" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="16" cy="27" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="6.5" cy="21" r="2.5" fill="currentColor" opacity="0.7" />
      <circle cx="6.5" cy="11" r="2.5" fill="currentColor" opacity="0.7" />
      {/* Connections */}
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.4">
        <line x1="16" y1="12" x2="16" y2="7.5" />
        <line x1="19.5" y1="14" x2="23" y2="12" />
        <line x1="19.5" y1="18" x2="23" y2="20" />
        <line x1="16" y1="20" x2="16" y2="24.5" />
        <line x1="12.5" y1="18" x2="9" y2="20" />
        <line x1="12.5" y1="14" x2="9" y2="12" />
      </g>
    </svg>
  );
}
