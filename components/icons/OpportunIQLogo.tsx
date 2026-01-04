type LogoVariant = "scale-smart" | "scale-safety" | "brain-paths" | "scales" | "compass" | "lightbulb-graph" | "decision-node";

interface OpportunIQLogoProps {
  className?: string;
  variant?: LogoVariant;
}

export function OpportunIQLogo({ className, variant = "scale-smart" }: OpportunIQLogoProps) {
  // Smart Scale - $ (Cost) + ✓ (Safety) + ⏱ (Time) - ALL THREE FACTORS
  if (variant === "scale-smart") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* $ symbol (COST) - LEFT */}
        <text
          x="4.5"
          y="7"
          fontSize="5"
          fontWeight="900"
          textAnchor="middle"
          fill="currentColor"
        >
          $
        </text>

        {/* ✓ checkmark (SAFETY/QUALITY) - CENTER */}
        <path
          d="M10.5 5L12 6.5L14.5 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Clock symbol (TIME) - RIGHT */}
        <circle cx="19.5" cy="5" r="2.2" stroke="currentColor" strokeWidth="1" fill="none" />
        <line x1="19.5" y1="5" x2="19.5" y2="3.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />
        <line x1="19.5" y1="5" x2="20.8" y2="5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" />

        {/* Balance beam - THICK and prominent */}
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />

        {/* Center fulcrum - large and clear */}
        <circle cx="12" cy="12" r="3" fill="currentColor" />

        {/* Left scale pan - BOLD */}
        <path
          d="M4.5 12L3 18.5H6L4.5 12Z"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Right scale pan - BOLD */}
        <path
          d="M19.5 12L18 18.5H21L19.5 12Z"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Clean scale representing balanced decision-making
  if (variant === "scale-safety") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Center post */}
        <line x1="12" y1="6" x2="12" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

        {/* Balance beam */}
        <line x1="4" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

        {/* Center pivot point */}
        <circle cx="12" cy="10" r="2.5" fill="currentColor" />

        {/* Left scale pan */}
        <line x1="5" y1="10" x2="5" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="5" cy="14.5" rx="3.5" ry="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />

        {/* Right scale pan */}
        <line x1="19" y1="10" x2="19" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <ellipse cx="19" cy="14.5" rx="3.5" ry="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />

        {/* Base */}
        <line x1="9" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }


  // Brain with decision paths - represents intelligence + choices
  if (variant === "brain-paths") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Stylized brain/head outline */}
        <path
          d="M12 3C7.5 3 4 6.5 4 11C4 13 4.5 14.5 5.5 16C6 16.8 7 17.5 8 18C9 18.5 10.5 19 12 19C13.5 19 15 18.5 16 18C17 17.5 18 16.8 18.5 16C19.5 14.5 20 13 20 11C20 6.5 16.5 3 12 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Branching decision paths inside */}
        <path
          d="M12 9V11M12 11L14.5 13.5M12 11L9.5 13.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small nodes at path ends */}
        <circle cx="14.5" cy="13.5" r="1" fill="currentColor" />
        <circle cx="9.5" cy="13.5" r="1" fill="currentColor" />
      </svg>
    );
  }

  // Balance scales - represents weighing options/trade-offs
  if (variant === "scales") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Center post */}
        <line x1="12" y1="4" x2="12" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Balance beam */}
        <line x1="5" y1="8" x2="19" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Left scale */}
        <path
          d="M5 8L3 13H7L5 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right scale */}
        <path
          d="M19 8L17 13H21L19 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Base */}
        <line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Compass - represents guidance and direction
  if (variant === "compass") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Outer circle */}
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        {/* Compass needle pointing up-right (opportunity/growth) */}
        <path
          d="M12 12L15 9M12 12L9 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Filled diamond at needle point */}
        <path
          d="M15 9L16 8L15 7L14 8L15 9Z"
          fill="currentColor"
        />
        {/* Cardinal direction dots */}
        <circle cx="12" cy="5" r="1" fill="currentColor" />
        <circle cx="19" cy="12" r="1" fill="currentColor" />
      </svg>
    );
  }

  // Lightbulb with upward graph - represents insight leading to optimization
  if (variant === "lightbulb-graph") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Lightbulb */}
        <path
          d="M9 18H15M10 21H14M12 3C9.5 3 7.5 5 7.5 7.5C7.5 9 8 10 9 11C9.5 11.5 10 12 10 13V14H14V13C14 12 14.5 11.5 15 11C16 10 16.5 9 16.5 7.5C16.5 5 14.5 3 12 3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Upward trending graph line inside */}
        <path
          d="M9.5 9L10.5 8L11.5 8.5L12.5 7L13.5 7.5L14.5 6.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Decision node network - represents analyzing connections
  if (variant === "decision-node") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Central node */}
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />

        {/* Connecting lines */}
        <line x1="12" y1="9" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14.1" y1="13.1" x2="18" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="9.9" y1="13.1" x2="6" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

        {/* Outer nodes */}
        <circle cx="12" cy="4" r="2" fill="currentColor" />
        <circle cx="18" cy="17" r="2" fill="currentColor" />
        <circle cx="6" cy="17" r="2" fill="currentColor" />
      </svg>
    );
  }

  return null;
}
