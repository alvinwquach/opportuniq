"use client";

import { useState } from "react";

// All logo concepts
const logos = {
  scales: {
    name: "Scales",
    concept: "Balance & Decision Making",
    description: "Weighing DIY vs hire, cost vs time. Classic symbolism for making smart choices.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="15" y="8" width="2" height="18" fill="currentColor" />
        <rect x="6" y="10" width="20" height="2" rx="1" fill="currentColor" />
        <circle cx="8" cy="18" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="8" y1="12" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="15" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="24" y1="12" x2="24" y2="11" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="26" width="8" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  compass: {
    name: "Compass",
    concept: "Navigation & Direction",
    description: "Points toward opportunity. Guides decisions with clarity and purpose.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <path d="M16 6l2 8-2 2-2-2 2-8z" fill="currentColor" />
        <path d="M16 26l-2-8 2-2 2 2-2 8z" fill="currentColor" opacity="0.3" />
        <circle cx="16" cy="4" r="1" fill="currentColor" />
        <circle cx="28" cy="16" r="1" fill="currentColor" />
      </svg>
    ),
  },
  aperture: {
    name: "Aperture",
    concept: "Convergence & Focus",
    description: "Multiple features converging into one. Also references photo diagnosis.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <g stroke="currentColor" strokeWidth="1.5">
          <path d="M16 4 L20 14 L16 16 Z" fill="currentColor" opacity="0.9" />
          <path d="M26.4 10 L20 14 L18 10 Z" fill="currentColor" opacity="0.75" />
          <path d="M26.4 22 L18 18 L20 14 Z" fill="currentColor" opacity="0.6" />
          <path d="M16 28 L12 18 L16 16 Z" fill="currentColor" opacity="0.45" />
          <path d="M5.6 22 L12 18 L14 22 Z" fill="currentColor" opacity="0.3" />
          <path d="M5.6 10 L14 14 L12 18 Z" fill="currentColor" opacity="0.15" />
        </g>
      </svg>
    ),
  },
  nexus: {
    name: "Nexus",
    concept: "Connected Network",
    description: "Central hub with connected nodes. Household at center, features orbiting.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="4" fill="currentColor" />
        <circle cx="16" cy="5" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="25.5" cy="11" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="25.5" cy="21" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="16" cy="27" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="6.5" cy="21" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="6.5" cy="11" r="2.5" fill="currentColor" opacity="0.7" />
        <g stroke="currentColor" strokeWidth="1.5" opacity="0.4">
          <line x1="16" y1="12" x2="16" y2="7.5" />
          <line x1="19.5" y1="14" x2="23" y2="12" />
          <line x1="19.5" y1="18" x2="23" y2="20" />
          <line x1="16" y1="20" x2="16" y2="24.5" />
          <line x1="12.5" y1="18" x2="9" y2="20" />
          <line x1="12.5" y1="14" x2="9" y2="12" />
        </g>
      </svg>
    ),
  },
  prism: {
    name: "Prism",
    concept: "Transformation & Insight",
    description: "One input splits into multiple insights. Information transformed into clarity.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 4L28 26H4L16 4z" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="4" y1="12" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="14" x2="28" y2="10" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
        <line x1="21" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        <line x1="20" y1="18" x2="28" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      </svg>
    ),
  },
  pathfinder: {
    name: "Pathfinder",
    concept: "Decision Journey",
    description: "Branching paths representing the journey through household decisions and optimal routes.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="8" cy="16" r="3" fill="currentColor" />
        <path d="M11 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 16l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M15 16l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M15 16h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <circle cx="24" cy="10" r="2" fill="currentColor" />
        <circle cx="27" cy="16" r="2" fill="currentColor" opacity="0.3" />
        <circle cx="24" cy="22" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  threshold: {
    name: "Threshold",
    concept: "Gateway & Home",
    description: "A doorway symbolizing home entrance and the threshold of opportunity.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M6 28V8l10-5 10 5v20" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <rect x="12" y="14" width="8" height="14" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="18" cy="21" r="1" fill="currentColor" />
      </svg>
    ),
  },
  optimize: {
    name: "Optimize",
    concept: "Smart Efficiency",
    description: "Abstract 'O' with optimization indicators pointing to peak performance.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 22v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <path d="M6 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <path d="M22 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <circle cx="16" cy="8" r="2" fill="currentColor" />
        <path d="M16 16l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
  lever: {
    name: "Lever",
    concept: "Leverage & Balance",
    description: "A fulcrum and lever representing the power of smart decisions and finding the right balance.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 22L16 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 28h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <polygon points="16,22 10,22 16,14" fill="currentColor" opacity="0.3" />
        <polygon points="16,22 22,22 16,14" fill="currentColor" opacity="0.3" />
        <path d="M4 12l24-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="4" cy="12" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="28" cy="8" r="3" fill="currentColor" />
        <circle cx="16" cy="10" r="2" fill="currentColor" />
      </svg>
    ),
  },
  sync: {
    name: "Sync",
    concept: "Household Harmony",
    description: "Interlocking elements representing synchronized household management and coordination.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M12 8a8 8 0 0 1 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M20 24a8 8 0 0 1-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M18 6l2 2-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 26l-2-2 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
      </svg>
    ),
  },
  layers: {
    name: "Layers",
    concept: "Depth & Organization",
    description: "Stacked layers representing organized household management.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 4L4 10l12 6 12-6L16 4z" fill="currentColor" opacity="0.9" />
        <path d="M4 14l12 6 12-6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M4 20l12 6 12-6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      </svg>
    ),
  },
  spark: {
    name: "Spark",
    concept: "Intelligence & Insight",
    description: "AI spark of intelligence. Represents smart diagnostics and recommendations.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 2v8M16 22v8M2 16h8M22 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.1 6.1l5.66 5.66M20.24 20.24l5.66 5.66M6.1 25.9l5.66-5.66M20.24 11.76l5.66-5.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <circle cx="16" cy="16" r="4" fill="currentColor" />
      </svg>
    ),
  },
  shield: {
    name: "Shield",
    concept: "Protection & Safety",
    description: "Protective shield with checkmark. Trust, safety, and confidence.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 3L4 8v8c0 7.18 5.12 13.12 12 15 6.88-1.88 12-7.82 12-15V8L16 3z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M11 16l3.5 3.5L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  pulse: {
    name: "Pulse",
    concept: "Health & Monitoring",
    description: "Household health pulse. Active monitoring and continuous improvement.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path d="M4 16h6l2-6 4 12 4-8 2 2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  quantum: {
    name: "Quantum",
    concept: "Possibility & Potential",
    description: "Abstract form suggesting multiple possibilities and optimal outcomes.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        <circle cx="16" cy="16" r="7" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <circle cx="16" cy="4" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="26" cy="12" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="8" cy="24" r="2" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  infinity: {
    name: "Infinity",
    concept: "Continuous & Endless",
    description: "Endless optimization loop. Continuous improvement cycle.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M8 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm8 0c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
        <circle cx="20" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  keystone: {
    name: "Keystone",
    concept: "Foundation & Core",
    description: "The keystone that holds everything together. Central to household stability.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M12 28L8 10l8-6 8 6-4 18H12z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M14 14l2-2 2 2v4l-2 2-2-2v-4z" fill="currentColor" />
      </svg>
    ),
  },
  beacon: {
    name: "Beacon",
    concept: "Guidance & Clarity",
    description: "A lighthouse beacon cutting through uncertainty, guiding decisions with clarity.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 8l-4 12h8L16 8z" fill="currentColor" />
        <rect x="10" y="20" width="12" height="4" fill="currentColor" opacity="0.5" />
        <rect x="8" y="24" width="16" height="4" fill="currentColor" opacity="0.3" />
        <path d="M6 10l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M26 10l-3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M4 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M24 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  pivot: {
    name: "Pivot",
    concept: "Adaptability & Choice",
    description: "A central point from which multiple directions emerge. Flexible decision making.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="4" fill="currentColor" />
        <path d="M16 12V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 14l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 18l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M12 18l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <path d="M12 14l-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
        <circle cx="16" cy="4" r="2" fill="currentColor" />
        <circle cx="26" cy="8" r="2" fill="currentColor" />
        <circle cx="26" cy="24" r="2" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  frame: {
    name: "Frame",
    concept: "Structure & Perspective",
    description: "A frame that brings focus and structure to household decisions.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="4" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="10" y="10" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M4 4l6 6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M28 4l-6 6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M4 28l6-6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M28 28l-6-6" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
  // Feature-specific logos based on app capabilities
  diagnose: {
    name: "Diagnose",
    concept: "Smart Analysis",
    description: "A magnifying glass with diagnostic crosshairs. Represents the 95% accurate smart diagnostics.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M21 21l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 9v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M9 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <circle cx="14" cy="14" r="3" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  scan: {
    name: "Scan",
    concept: "Photo Analysis",
    description: "Camera viewfinder with scan lines. Represents instant photo issue identification.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 10V6a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 4h4a2 2 0 012 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 22v4a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 28H6a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 16h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.3" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
  calculator: {
    name: "Calculator",
    concept: "Cost Analysis",
    description: "Abstract calculator representing opportunity cost calculations and budget tracking.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="9" y="7" width="14" height="6" fill="currentColor" opacity="0.3" />
        <circle cx="11" cy="17" r="1.5" fill="currentColor" />
        <circle cx="16" cy="17" r="1.5" fill="currentColor" />
        <circle cx="21" cy="17" r="1.5" fill="currentColor" />
        <circle cx="11" cy="22" r="1.5" fill="currentColor" />
        <circle cx="16" cy="22" r="1.5" fill="currentColor" />
        <rect x="19" y="20.5" width="4" height="3" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  ledger: {
    name: "Ledger",
    concept: "Decision History",
    description: "Open book representing the decision ledger - full lifecycle tracking of all household decisions.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 6v20c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 4v24" stroke="currentColor" strokeWidth="2" />
        <path d="M8 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M8 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M19 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M19 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <circle cx="10" cy="20" r="2" fill="currentColor" />
        <circle cx="22" cy="20" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  safetyNet: {
    name: "Safety Net",
    concept: "Risk Protection",
    description: "Interwoven grid representing the safety net that catches risks before they escalate.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 8l12 4 12-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 16l12 4 12-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M4 24l12 4 12-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <path d="M8 6v22" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path d="M16 8v22" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path d="M24 6v22" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
      </svg>
    ),
  },
  team: {
    name: "Team",
    concept: "Household Collaboration",
    description: "Connected people representing household groups, shared decisions, and collaborative management.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="8" r="4" fill="currentColor" />
        <circle cx="6" cy="14" r="3" fill="currentColor" opacity="0.6" />
        <circle cx="26" cy="14" r="3" fill="currentColor" opacity="0.6" />
        <path d="M16 12v4" stroke="currentColor" strokeWidth="2" />
        <path d="M9 14l5 2" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <path d="M23 14l-5 2" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        <path d="M10 24c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M2 22c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M30 22c0-2.2-1.8-4-4-4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
    ),
  },
  vote: {
    name: "Vote",
    concept: "Democratic Decisions",
    description: "Ballot box with checkmark. Household members voting on repair options together.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="6" y="12" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M10 12V8a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="12" y="10" width="8" height="4" fill="currentColor" opacity="0.3" />
        <path d="M12 20l2.5 2.5L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  growth: {
    name: "Growth",
    concept: "Skill Progression",
    description: "Ascending bars with arrow. Tracks learning curves and skill improvement over time.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="20" width="5" height="8" fill="currentColor" opacity="0.3" />
        <rect x="11" y="14" width="5" height="14" fill="currentColor" opacity="0.5" />
        <rect x="18" y="8" width="5" height="20" fill="currentColor" opacity="0.7" />
        <rect x="25" y="4" width="5" height="24" fill="currentColor" />
        <path d="M4 18l8-6 8-4 8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 4l4 0 0 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  calendar: {
    name: "Calendar",
    concept: "Scheduling & Planning",
    description: "Calendar grid representing project scheduling, reminders, and event tracking.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="6" width="24" height="22" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M4 12h24" stroke="currentColor" strokeWidth="2" />
        <path d="M10 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="8" y="16" width="4" height="4" fill="currentColor" opacity="0.3" />
        <rect x="14" y="16" width="4" height="4" fill="currentColor" />
        <rect x="20" y="16" width="4" height="4" fill="currentColor" opacity="0.3" />
        <rect x="8" y="22" width="4" height="4" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  guide: {
    name: "Guide",
    concept: "DIY Learning",
    description: "Open book with lightbulb. Curated guides and resources for learning DIY skills.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 6c0-1.1.9-2 2-2h8v22H6c-1.1 0-2-.9-2-2V6z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M28 6c0-1.1-.9-2-2-2h-8v22h8c1.1 0 2-.9 2-2V6z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="16" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M16 13v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M8 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  savings: {
    name: "Savings",
    concept: "Money Saved",
    description: "Piggy bank silhouette. Tracks total savings from smart DIY vs hire decisions.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <ellipse cx="16" cy="18" rx="11" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 10c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="20" cy="16" r="1.5" fill="currentColor" />
        <path d="M6 22l-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 22l2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M14 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  alert: {
    name: "Alert",
    concept: "Safety Alerts",
    description: "Warning triangle with exclamation. Critical safety alerts and hazard detection.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 4L2 28h28L16 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M16 12v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="24" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  pipeline: {
    name: "Pipeline",
    concept: "Issue Workflow",
    description: "Connected stages representing issue lifecycle from open to completed.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="6" cy="16" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.5" />
        <circle cx="26" cy="16" r="4" fill="currentColor" />
        <path d="M10 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 8l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        <path d="M28 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    ),
  },
  toolbox: {
    name: "Toolbox",
    concept: "DIY Ready",
    description: "Toolbox with wrench. Required tools tracking and DIY preparation.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="12" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 12V8a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M4 18h24" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="15" r="2" fill="currentColor" />
        <path d="M10 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  home: {
    name: "Home",
    concept: "Household Hub",
    description: "Simple home icon with smart indicator. The household as the center of everything.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 14l12-10 12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 12v14a2 2 0 002 2h16a2 2 0 002-2V12" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="12" y="18" width="8" height="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="22" cy="10" r="3" fill="currentColor" />
        <path d="M21 10h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 9v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  branch: {
    name: "Branch",
    concept: "Decision Tree",
    description: "Branching tree structure. Multiple decision paths leading to optimal outcomes.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="6" r="3" fill="currentColor" />
        <path d="M16 9v6" stroke="currentColor" strokeWidth="2" />
        <path d="M16 15l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 15l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 15v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <circle cx="8" cy="25" r="3" fill="currentColor" opacity="0.6" />
        <circle cx="24" cy="25" r="3" fill="currentColor" />
        <circle cx="16" cy="27" r="2" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  target: {
    name: "Target",
    concept: "Precision & Goals",
    description: "Bullseye target. Precise diagnostics hitting the mark with 95% accuracy.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <path d="M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 25v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M25 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  meter: {
    name: "Meter",
    concept: "Risk Assessment",
    description: "Gauge meter showing risk levels. Visual representation of safety and risk scoring.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M6 22a12 12 0 0120 0" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 22V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="22" r="3" fill="currentColor" />
        <path d="M8 20l2-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M22 19l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M16 8v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="8" cy="16" r="1.5" fill="currentColor" opacity="0.3" />
        <circle cx="24" cy="16" r="1.5" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  lock: {
    name: "Lock",
    concept: "Secure & Private",
    description: "Padlock representing end-to-end encrypted evidence storage and data privacy.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="6" y="14" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M10 14V10a6 6 0 0112 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="21" r="2" fill="currentColor" />
        <path d="M16 23v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  chart: {
    name: "Chart",
    concept: "Analytics & Insights",
    description: "Line chart trending upward. Spending analytics and outcome tracking.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M8 22l6-8 4 4 6-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="22" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="18" cy="18" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="24" cy="8" r="2" fill="currentColor" />
      </svg>
    ),
  },
  list: {
    name: "List",
    concept: "Shopping & Tasks",
    description: "Checklist with items. Shopping lists and task management for projects.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M10 10l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 10h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 18l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        <path d="M18 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <circle cx="12" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
        <path d="M18 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  compare: {
    name: "Compare",
    concept: "DIY vs Hire",
    description: "Split comparison view. Side-by-side analysis of DIY vs professional options.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="4" width="10" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="18" y="4" width="10" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M9 10v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M23 10v12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="9" cy="22" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="23" cy="22" r="2" fill="currentColor" />
      </svg>
    ),
  },
  clock: {
    name: "Clock",
    concept: "Time Tracking",
    description: "Clock face representing time investment calculations and project duration.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 8v8l6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        <circle cx="16" cy="5" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="27" cy="16" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="16" cy="27" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="5" cy="16" r="1" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  flow: {
    name: "Flow",
    concept: "Seamless Process",
    description: "Flowing curves representing smooth household management and intuitive workflows.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 20c4-8 8 0 12-8s8 0 12-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M4 28c4-8 8 0 12-8s8 0 12-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.3" />
        <circle cx="10" cy="16" r="2" fill="currentColor" />
        <circle cx="22" cy="8" r="2" fill="currentColor" />
      </svg>
    ),
  },
  dna: {
    name: "DNA",
    concept: "Core Intelligence",
    description: "Double helix representing the intelligent DNA of the app - learning and adapting.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M10 4c0 4 4 6 6 8s6 4 6 8-4 6-6 8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M22 4c0 4-4 6-6 8s-6 4-6 8 4 6 6 8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M12 8h8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <path d="M10 16h12" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 24h8" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
  signal: {
    name: "Signal",
    concept: "Smart Notifications",
    description: "Broadcast signal representing alerts, reminders, and real-time notifications.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="24" r="4" fill="currentColor" />
        <path d="M10 18a8 8 0 0112 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M6 12a14 14 0 0120 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M2 6a20 20 0 0128 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.2" />
      </svg>
    ),
  },
  // Inspired by competitor apps and additional concepts
  envelope: {
    name: "Envelope",
    concept: "Budget Envelopes",
    description: "Inspired by Goodbudget's envelope budgeting. Visual categorization of household funds.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M4 10l12 8 12-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 24l8-6" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <path d="M28 24l-8-6" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
        <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  monarch: {
    name: "Crown",
    concept: "Household Ruler",
    description: "Take control of your household like royalty. Master your domain with confidence.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 24l4-12 4 6 4-10 4 10 4-6 4 12H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <circle cx="8" cy="10" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="16" cy="6" r="2" fill="currentColor" />
        <circle cx="24" cy="10" r="2" fill="currentColor" opacity="0.5" />
        <rect x="4" y="24" width="24" height="4" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  manual: {
    name: "Manual",
    concept: "Appliance Library",
    description: "Inspired by Centriq. Digital library for all household manuals and documentation.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="6" y="4" width="16" height="24" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="10" y="4" width="16" height="24" rx="1" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M10 10h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M10 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <circle cx="14" cy="24" r="2" fill="currentColor" />
      </svg>
    ),
  },
  thumbtack: {
    name: "Pin",
    concept: "Mark & Remember",
    description: "Pin important items, bookmark guides, mark issues. Keep track of what matters.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="10" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 16v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="10" r="2" fill="currentColor" />
        <path d="M12 6l8 8" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      </svg>
    ),
  },
  frontdoor: {
    name: "Door",
    concept: "Entry Point",
    description: "The front door to your household management. Everything starts here.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="8" y="4" width="16" height="24" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="20" cy="16" r="1.5" fill="currentColor" />
        <rect x="10" y="8" width="12" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <rect x="10" y="14" width="5" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <rect x="17" y="14" width="5" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
      </svg>
    ),
  },
  videoChat: {
    name: "Video",
    concept: "Expert Connect",
    description: "Inspired by Frontdoor's video chat with pros. Connect with experts instantly.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="8" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M22 12l6-3v14l-6-3v-8z" fill="currentColor" opacity="0.5" />
        <circle cx="13" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M8 20c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  ar: {
    name: "AR View",
    concept: "Augmented Reality",
    description: "AR-powered diagnostics. See issues through your camera with smart overlays.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 10V6a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 4h4a2 2 0 012 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 22v4a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 28H6a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="10" y="10" width="12" height="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <path d="M16 10v2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 20v2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 16h2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M20 16h2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  zero: {
    name: "Zero",
    concept: "Zero-Based Budget",
    description: "Inspired by YNAB. Every dollar has a job. Complete budget allocation.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        <path d="M16 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 26v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 16h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  warranty: {
    name: "Warranty",
    concept: "Protection Plans",
    description: "Track warranties and protection plans. Never miss a claim window.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 4L6 8v6c0 8 4 14 10 16 6-2 10-8 10-16V8L16 4z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 12v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  contractor: {
    name: "Contractor",
    concept: "Pro Network",
    description: "Network of verified professionals. Vetted contractors at your fingertips.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="10" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 6l8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="14" y="2" width="4" height="4" fill="currentColor" opacity="0.5" />
        <path d="M11 15l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M21 15l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  quote: {
    name: "Quote",
    concept: "Get Estimates",
    description: "Multiple quotes in minutes. Compare pricing from different sources.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="4" width="16" height="20" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="12" y="8" width="16" height="20" rx="1" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M8 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M8 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <circle cx="24" cy="22" r="3" fill="currentColor" />
        <path d="M22 22l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  rooms: {
    name: "Rooms",
    concept: "Room Organization",
    description: "Organize by room. Kitchen, bathroom, garage - everything has its place.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="4" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="17" y="4" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
        <rect x="4" y="17" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
        <rect x="17" y="17" width="11" height="11" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
        <circle cx="9.5" cy="9.5" r="2" fill="currentColor" />
        <path d="M21 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 21h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="22.5" cy="22.5" r="1.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  recall: {
    name: "Recall",
    concept: "Safety Recalls",
    description: "Automatic product safety recall notifications. Stay informed and safe.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 8v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="22" r="2" fill="currentColor" />
        <path d="M10 4l2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M22 4l-2 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  appliance: {
    name: "Appliance",
    concept: "Smart Appliances",
    description: "Track all household appliances. Model numbers, manuals, and maintenance.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="6" y="4" width="20" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="9" y="7" width="14" height="8" fill="currentColor" opacity="0.2" />
        <circle cx="12" cy="20" r="2" fill="currentColor" />
        <circle cx="20" cy="20" r="2" fill="currentColor" opacity="0.5" />
        <path d="M9 24h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  estimation: {
    name: "Estimate",
    concept: "Cost Estimation",
    description: "Inspired by SimplyWise. Accurate cost estimates in seconds using AI.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M4 12h24" stroke="currentColor" strokeWidth="2" />
        <path d="M13 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 15v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="10" cy="18" r="1.5" fill="currentColor" opacity="0.5" />
        <circle cx="22" cy="18" r="1.5" fill="currentColor" opacity="0.5" />
        <path d="M8 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M20 22h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  zipcode: {
    name: "Location",
    concept: "Local Pricing",
    description: "Location-aware pricing. Estimates tailored to your zip code and market.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 28S6 18 6 12a10 10 0 0120 0c0 6-10 16-10 16z" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="12" r="4" fill="currentColor" />
      </svg>
    ),
  },
  handshake: {
    name: "Handshake",
    concept: "Trust & Agreement",
    description: "Trusted connections. Agreements between households and professionals.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 14h4l6 6 6-4 4 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M10 20l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 18l6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
  ai: {
    name: "AI Brain",
    concept: "AI-Powered",
    description: "Intelligent AI assistant. Smart recommendations powered by machine learning.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 12c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="16" cy="22" r="1.5" fill="currentColor" />
        <path d="M6 10l-2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M26 10l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M6 22l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M26 22l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  dashboard: {
    name: "Dashboard",
    concept: "Command Center",
    description: "Your household command center. All metrics and insights in one view.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="4" width="24" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="7" y="7" width="8" height="6" fill="currentColor" opacity="0.5" />
        <rect x="17" y="7" width="8" height="10" fill="currentColor" opacity="0.3" />
        <rect x="7" y="15" width="8" height="10" fill="currentColor" opacity="0.2" />
        <rect x="17" y="19" width="8" height="6" fill="currentColor" />
      </svg>
    ),
  },
  split: {
    name: "Split",
    concept: "Cost Splitting",
    description: "Split costs between household members. Fair expense sharing made easy.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 4v24" stroke="currentColor" strokeWidth="2" />
        <circle cx="10" cy="12" r="2" fill="currentColor" />
        <circle cx="22" cy="12" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="10" cy="20" r="2" fill="currentColor" />
        <circle cx="22" cy="20" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  trend: {
    name: "Trend",
    concept: "Spending Trends",
    description: "Track spending trends over time. See where your money goes.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M4 24l7-8 5 4 8-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M4 24l7-8 5 4 8-12" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.1" />
        <circle cx="24" cy="8" r="3" fill="currentColor" />
        <path d="M20 8h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  recurring: {
    name: "Recurring",
    concept: "Scheduled Tasks",
    description: "Recurring maintenance reminders. Never forget regular household tasks.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 6a10 10 0 019.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M23 10l3 3-4 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M16 26a10 10 0 01-9.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
        <path d="M9 22l-3-3 4-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
      </svg>
    ),
  },
  severity: {
    name: "Severity",
    concept: "Priority Levels",
    description: "Issue severity classification. From cosmetic to critical, prioritize what matters.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="6" y="20" width="5" height="8" fill="currentColor" opacity="0.2" />
        <rect x="13" y="14" width="5" height="14" fill="currentColor" opacity="0.4" />
        <rect x="20" y="8" width="5" height="20" fill="currentColor" opacity="0.7" />
        <path d="M22.5 4l2 3h-4l2-3z" fill="currentColor" />
      </svg>
    ),
  },
  evidence: {
    name: "Evidence",
    concept: "Photo Evidence",
    description: "Capture and store evidence. Photos, videos, voice notes - all encrypted.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <rect x="4" y="8" width="24" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        <circle cx="24" cy="11" r="2" fill="currentColor" opacity="0.5" />
        <path d="M8 8V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 8V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  outcome: {
    name: "Outcome",
    concept: "Track Results",
    description: "Track decision outcomes. Learn what works and improve over time.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M10 16l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  ppe: {
    name: "PPE",
    concept: "Safety Gear",
    description: "Personal protective equipment recommendations. Required, recommended, suggested.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <ellipse cx="16" cy="14" rx="10" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M6 14v4c0 5.5 4.5 10 10 10s10-4.5 10-10v-4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 14v-2a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
        <circle cx="20" cy="16" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  hazard: {
    name: "Hazard",
    concept: "Danger Detection",
    description: "Hazard detection. Gas leaks, electrical issues, structural problems identified.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 4L4 28h24L16 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M16 12v6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M16 22v2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 8l-2-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <path d="M20 8l2-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  confidence: {
    name: "Confidence",
    concept: "Skill Confidence",
    description: "Build confidence scores. Know when you're ready to DIY vs hire.",
    render: (className: string) => (
      <svg viewBox="0 0 32 32" className={className} fill="none">
        <path d="M16 4l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9l3-9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M16 4l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9l3-9z" fill="currentColor" opacity="0.2" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
      </svg>
    ),
  },
};

export default function LogoConceptsPage() {
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<"light" | "dark">("light");

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bgColor === "dark" ? "bg-[#111] text-white" : "bg-[#fafafa] text-[#111]"}`}>
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Logo Concepts</h1>
            <p className={`text-sm ${bgColor === "dark" ? "text-white/50" : "text-[#111]/50"}`}>
              Exploring visual identity for opportuniq
            </p>
          </div>
          <button
            onClick={() => setBgColor(bgColor === "light" ? "dark" : "light")}
            className={`px-4 py-2 text-sm rounded-full border transition-colors ${
              bgColor === "dark"
                ? "border-white/20 hover:bg-white/10"
                : "border-[#111]/20 hover:bg-[#111]/5"
            }`}
          >
            {bgColor === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
          {Object.entries(logos).map(([key, logo]) => (
            <button
              key={key}
              onClick={() => setSelectedLogo(selectedLogo === key ? null : key)}
              className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                selectedLogo === key
                  ? bgColor === "dark"
                    ? "border-white bg-white/10"
                    : "border-[#111] bg-[#111]/5"
                  : bgColor === "dark"
                    ? "border-white/10 hover:border-white/30"
                    : "border-[#111]/10 hover:border-[#111]/30"
              }`}
            >
              <div className="flex items-center justify-center h-24 mb-4">
                {logo.render("w-16 h-16")}
              </div>
              <h3 className="font-semibold mb-1">{logo.name}</h3>
              <p className={`text-xs ${bgColor === "dark" ? "text-white/40" : "text-[#111]/40"}`}>
                {logo.concept}
              </p>
            </button>
          ))}
        </div>

        {/* Selected Logo Detail */}
        {selectedLogo && logos[selectedLogo as keyof typeof logos] && (
          <div className={`p-8 rounded-2xl border mb-16 ${bgColor === "dark" ? "border-white/10 bg-white/5" : "border-[#111]/10 bg-white"}`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] mb-2 ${bgColor === "dark" ? "text-white/30" : "text-[#111]/30"}`}>
                  Selected
                </p>
                <h2 className="text-2xl font-semibold mb-2">
                  {logos[selectedLogo as keyof typeof logos].name}
                </h2>
                <p className={`text-sm mb-6 ${bgColor === "dark" ? "text-white/50" : "text-[#111]/50"}`}>
                  {logos[selectedLogo as keyof typeof logos].description}
                </p>

                {/* Size variations */}
                <div className="flex items-end gap-6">
                  {[16, 24, 32, 48, 64].map((size) => (
                    <div key={size} className="text-center">
                      {logos[selectedLogo as keyof typeof logos].render(`w-${size/4} h-${size/4}`)}
                      <p className={`text-[10px] mt-2 ${bgColor === "dark" ? "text-white/30" : "text-[#111]/30"}`}>
                        {size}px
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo with wordmark */}
              <div className="space-y-8">
                <div>
                  <p className={`text-xs uppercase tracking-[0.2em] mb-4 ${bgColor === "dark" ? "text-white/30" : "text-[#111]/30"}`}>
                    With Wordmark
                  </p>
                  <div className="flex items-center gap-3">
                    {logos[selectedLogo as keyof typeof logos].render("w-10 h-10")}
                    <span className="text-2xl font-semibold tracking-tight">opportuniq</span>
                  </div>
                </div>

                <div>
                  <p className={`text-xs uppercase tracking-[0.2em] mb-4 ${bgColor === "dark" ? "text-white/30" : "text-[#111]/30"}`}>
                    Compact
                  </p>
                  <div className="flex items-center gap-2">
                    {logos[selectedLogo as keyof typeof logos].render("w-6 h-6")}
                    <span className="text-sm font-semibold tracking-tight">opportuniq</span>
                  </div>
                </div>

                <div>
                  <p className={`text-xs uppercase tracking-[0.2em] mb-4 ${bgColor === "dark" ? "text-white/30" : "text-[#111]/30"}`}>
                    In Context (Nav)
                  </p>
                  <div className={`inline-flex items-center gap-6 px-6 py-3 rounded-full ${bgColor === "dark" ? "bg-white/10" : "bg-[#111]/5"}`}>
                    <div className="flex items-center gap-2">
                      {logos[selectedLogo as keyof typeof logos].render("w-5 h-5")}
                      <span className="text-sm font-semibold">opportuniq</span>
                    </div>
                    <div className={`flex items-center gap-4 text-xs ${bgColor === "dark" ? "text-white/50" : "text-[#111]/50"}`}>
                      <span>Features</span>
                      <span>Pricing</span>
                      <span>About</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All logos at small size */}
        <div className={`p-8 rounded-2xl border ${bgColor === "dark" ? "border-white/10" : "border-[#111]/10"}`}>
          <p className={`text-xs uppercase tracking-[0.2em] mb-6 ${bgColor === "dark" ? "text-white/30" : "text-[#111]/30"}`}>
            All Logos at 24px (typical nav size)
          </p>
          <div className="flex flex-wrap items-center gap-8">
            {Object.entries(logos).map(([key, logo]) => (
              <div key={key} className="flex items-center gap-2">
                {logo.render("w-6 h-6")}
                <span className="text-sm font-medium">opportuniq</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color variations */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-[#111] text-white">
            <p className="text-xs uppercase tracking-[0.2em] mb-6 text-white/30">On Dark</p>
            <div className="flex flex-wrap gap-6">
              {Object.entries(logos).slice(0, 6).map(([key, logo]) => (
                <div key={key}>{logo.render("w-8 h-8")}</div>
              ))}
            </div>
          </div>
          <div className="p-8 rounded-2xl bg-white border border-[#111]/10 text-[#111]">
            <p className="text-xs uppercase tracking-[0.2em] mb-6 text-[#111]/30">On Light</p>
            <div className="flex flex-wrap gap-6">
              {Object.entries(logos).slice(0, 6).map(([key, logo]) => (
                <div key={key}>{logo.render("w-8 h-8")}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-current/10 flex items-center justify-between">
          <a
            href="/marketing-landing-page"
            className={`text-sm ${bgColor === "dark" ? "text-white/50 hover:text-white" : "text-[#111]/50 hover:text-[#111]"} transition-colors`}
          >
            ← Back to Landing Page
          </a>
          <p className={`text-xs ${bgColor === "dark" ? "text-white/30" : "text-[#111]/30"}`}>
            opportuniq brand exploration
          </p>
        </div>
      </div>
    </div>
  );
}
