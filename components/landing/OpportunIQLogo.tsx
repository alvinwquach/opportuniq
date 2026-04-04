export function OpportunIQLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Input nodes — scattered, faded */}
      <circle cx="3" cy="10" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="3" cy="22" r="2.5" fill="currentColor" opacity="0.3" />

      {/* Middle convergence node */}
      <circle cx="14" cy="16" r="2.5" fill="currentColor" opacity="0.6" />

      {/* Output node — solid, resolved */}
      <circle cx="29" cy="16" r="3" fill="currentColor" />

      {/* Dashed lines from inputs to middle — fragmented */}
      <line x1="5.5" y1="10.8" x2="11.5" y2="14.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2.5" opacity="0.35" />
      <line x1="5.5" y1="21.2" x2="11.5" y2="17.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2.5" opacity="0.35" />

      {/* Solid line from middle to output — resolved path */}
      <line x1="16.5" y1="16" x2="25.8" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Arrowhead on output */}
      <path d="M24 13.5L27 16L24 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
