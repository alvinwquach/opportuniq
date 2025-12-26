import { Car, Home, Wrench, Trees, Shield, Settings, Lightbulb } from "lucide-react";
import type { Category, Scenario } from "./types";

export const categories: Category[] = [
  { id: "all", label: "All" },
  { id: "appliances", label: "Appliances", icon: Wrench },
  { id: "automotive", label: "Automotive", icon: Car },
  { id: "yard", label: "Yard", icon: Trees },
  { id: "safety", label: "Safety", icon: Shield },
  { id: "home", label: "Home", icon: Home },
  { id: "maintenance", label: "Maintenance", icon: Settings },
  { id: "projects", label: "Projects", icon: Lightbulb },
];

export const scenarios: Scenario[] = [
  // Appliances
  {
    id: "dishwasher-drain",
    category: "appliances",
    prompt: "My dishwasher won't drain - there's standing water at the bottom",
    diagnosis: {
      description: "Most common cause: food debris blocking filter or kinked drain hose under sink. Standing water breeds bacteria and prevents next cycle.",
      urgency: "LOW",
      timeline: "Fix within 1 week",
      confidence: 85,
    },
    risks: [
      "Bacteria growth in standing water",
      "Water damage if it leaks onto floor",
      "Dishwasher won't run until drained"
    ],
    budget: {
      estimatedCost: "$0-15 (DIY cleaning) or $120-180 (service call)",
      recommendation: "Try DIY first - usually just a clogged filter. 90% of drain issues are solved by cleaning the filter.",
    },
    options: [
      {
        type: "DIY Fix",
        name: "Clean Filter & Check Drain Hose",
        details: "Free - Filter is inside dishwasher, removable by hand",
        steps: [
          "Remove lower dish rack to access filter at bottom",
          "Twist filter counterclockwise and lift out",
          "Rinse debris under warm water",
          "Check drain hose under sink for kinks",
          "Reinstall filter and run empty cycle with vinegar"
        ]
      },
      {
        type: "Professional Service",
        name: "Appliance Repair Specialist",
        details: "$120-180 - Only if DIY doesn't work",
      },
    ],
    tradeoffs: {
      diy: { cost: "$0", time: "15 minutes", difficulty: "Very Easy", safety: "Safe (no electrical work)" },
      professional: { cost: "$120-180", time: "Schedule appointment + wait", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  {
    id: "refrigerator-cooling",
    category: "appliances",
    prompt: "Refrigerator isn't keeping food cold anymore",
    diagnosis: {
      description: "Dust buildup on condenser coils prevents heat dissipation. Blocked vents restrict airflow. Both cause poor cooling.",
      urgency: "MEDIUM",
      timeline: "Fix within 2-3 days",
      confidence: 80,
    },
    risks: [
      "Food spoilage and waste ($200+ in groceries)",
      "Compressor damage from overwork ($400-800 repair)",
      "Complete fridge failure"
    ],
    budget: {
      estimatedCost: "$0-20 (DIY cleaning) or $150-250 (service call)",
      recommendation: "Start with DIY cleaning. This fixes 70% of cooling issues.",
    },
    options: [
      {
        type: "DIY Fix",
        name: "Clean Condenser Coils & Check Vents",
        details: "Vacuum or brush coils at back/bottom of fridge",
        steps: [
          "Unplug refrigerator for safety",
          "Locate condenser coils (usually at back or bottom)",
          "Vacuum coils with brush attachment",
          "Check air vents inside aren't blocked by food",
          "Clean door seals with warm soapy water",
          "Plug back in and wait 24 hours"
        ]
      },
      {
        type: "Professional Service",
        name: "Refrigeration Specialist",
        details: "$150-250 - For refrigerant leaks or compressor issues",
      },
    ],
    tradeoffs: {
      diy: { cost: "$0-20", time: "30 minutes", difficulty: "Easy", safety: "Safe (unplug first)" },
      professional: { cost: "$150-250", time: "Schedule + 1-2 hours", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  {
    id: "hvac-noises",
    category: "appliances",
    prompt: "HVAC system is making strange noises",
    diagnosis: {
      description: "Grinding suggests worn bearings. Squealing means loose belt. Banging indicates loose components.",
      urgency: "MEDIUM",
      timeline: "Fix within 1 week",
      confidence: 75,
    },
    risks: [
      "Complete system failure during extreme weather",
      "Motor burnout ($500-1200 replacement)",
      "Higher energy bills from inefficiency"
    ],
    budget: {
      estimatedCost: "$20 (filter replacement) to $500+ (motor repair)",
      recommendation: "Start by replacing filter. If noise persists, call HVAC tech.",
    },
    options: [
      {
        type: "DIY Fix",
        name: "Replace Filter & Inspect",
        details: "New filter $15-30, takes 5 minutes",
        steps: [
          "Turn off HVAC system",
          "Locate filter (usually in return air duct)",
          "Note filter size on frame",
          "Buy correct size replacement",
          "Install with airflow arrow pointing correct direction",
          "Turn system back on and listen"
        ]
      },
      {
        type: "Professional Service",
        name: "HVAC Technician",
        details: "$150-300 diagnostic + repair costs",
      },
    ],
    tradeoffs: {
      diy: { cost: "$15-30", time: "10 minutes", difficulty: "Very Easy", safety: "Safe" },
      professional: { cost: "$150-500+", time: "Schedule + 2-3 hours", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  // Automotive
  {
    id: "car-brakes-squealing",
    category: "automotive",
    prompt: "Car brakes are squealing when I stop",
    diagnosis: {
      description: "Squealing brakes mean brake pad wear indicators are touching the rotor. If ignored, pads wear through completely causing metal-on-metal grinding and rotor damage.",
      urgency: "MEDIUM-HIGH",
      timeline: "Replace within 1-2 weeks",
      confidence: 90,
    },
    risks: [
      "Complete brake failure if pads wear through",
      "Rotor damage ($200-400 per axle to replace)",
      "Longer stopping distances (safety hazard)",
    ],
    budget: {
      estimatedCost: "$120-200 DIY or $400-600 professional",
      recommendation: "Moderately skilled DIY job. Save $200-400 if comfortable with basic car maintenance.",
    },
    options: [
      {
        type: "DIY Replacement",
        name: "Replace Brake Pads Yourself",
        details: "Brake pads $40-80/axle, brake fluid $10",
        steps: [
          "Buy correct brake pads for your vehicle",
          "Gather tools: jack, jack stands, wrench set, C-clamp",
          "Watch model-specific YouTube tutorial first",
          "Lift car and secure on jack stands",
          "Remove wheel, remove caliper bolts, remove old pads",
          "Compress caliper piston with C-clamp",
          "Install new pads, reassemble, pump brakes"
        ]
      },
      {
        type: "Professional Service",
        name: "Mechanic Brake Service",
        details: "$400-600 - Includes pads, labor, fluid flush",
      },
    ],
    tradeoffs: {
      diy: { cost: "$120-200", time: "2-3 hours first time", difficulty: "Moderate", safety: "Safe if you use jack stands" },
      professional: { cost: "$400-600", time: "Drop off + 2-3 hours", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  {
    id: "headlight-fogging",
    category: "automotive",
    prompt: "BMW headlights are fogged up from inside",
    diagnosis: {
      description: "Headlight seals deteriorate over time. Moisture gets trapped inside causing fogging and reduced light output.",
      urgency: "LOW-MEDIUM",
      timeline: "Fix within 2-4 weeks",
      confidence: 85,
    },
    risks: [
      "Reduced visibility at night",
      "Failed inspection in some states",
      "Electrical corrosion from moisture"
    ],
    budget: {
      estimatedCost: "$45 DIY seal repair or $800+ new assemblies",
      recommendation: "DIY seal repair saves $700+. Dealer replacement unnecessary unless housing is cracked.",
    },
    options: [
      {
        type: "DIY Repair",
        name: "Seal Repair & Moisture Removal",
        details: "Headlight sealant $20, silica gel packs $5",
        steps: [
          "Remove headlight assembly from car",
          "Heat old sealant with heat gun to separate lens",
          "Clean inside with microfiber cloth",
          "Add silica gel packs inside to absorb moisture",
          "Apply new butyl rubber sealant around edge",
          "Reassemble and heat to bond seal"
        ]
      },
      {
        type: "Professional Service",
        name: "Dealer Replacement",
        details: "$800+ - New assemblies (often unnecessary)",
      },
    ],
    tradeoffs: {
      diy: { cost: "$45", time: "2-3 hours", difficulty: "Moderate", safety: "Safe" },
      professional: { cost: "$800+", time: "Schedule + 1-2 hours", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  {
    id: "oil-change",
    category: "automotive",
    prompt: "Need an oil change - dashboard light is on",
    diagnosis: {
      description: "Oil breaks down over time and loses ability to lubricate engine. Regular changes prevent engine damage.",
      urgency: "MEDIUM",
      timeline: "Complete within 1 week",
      confidence: 100,
    },
    risks: [
      "Engine wear and reduced lifespan",
      "Sludge buildup in engine",
      "Complete engine failure if severely overdue"
    ],
    budget: {
      estimatedCost: "$30-50 DIY or $60-100 professional",
      recommendation: "Easy DIY that saves $30-50 per change. Worth learning.",
    },
    options: [
      {
        type: "DIY",
        name: "Change Oil Yourself",
        details: "Oil $20-30, filter $8-12",
        steps: [
          "Buy correct oil type and filter for your car",
          "Get drain pan, oil filter wrench, funnel",
          "Warm up engine for 5 minutes",
          "Lift car safely (ramps or jack stands)",
          "Drain old oil, replace filter",
          "Add new oil to correct level",
          "Dispose of old oil at auto parts store"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$30-50", time: "30-45 minutes", difficulty: "Easy", safety: "Safe" },
      professional: { cost: "$60-100", time: "30-60 minutes wait", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  // Yard
  {
    id: "lawn-mower",
    category: "yard",
    prompt: "Lawn mower won't start",
    diagnosis: {
      description: "Most common: spark plug fouled, gas older than 30 days, or air filter clogged. All are cheap fixes.",
      urgency: "LOW",
      timeline: "Fix before next mow",
      confidence: 80,
    },
    risks: [
      "Overgrown lawn",
      "Having to pay for lawn service",
      "Carburetor damage if bad gas sits"
    ],
    budget: {
      estimatedCost: "$3-15 DIY parts",
      recommendation: "Almost always a simple DIY fix. Try these before buying new mower.",
    },
    options: [
      {
        type: "DIY Fix",
        name: "Replace Spark Plug & Check Filter",
        details: "Spark plug $3, air filter $8-12",
        steps: [
          "Remove spark plug with socket wrench",
          "Replace with new plug",
          "Check air filter - replace if dirty",
          "Drain old gas if older than 30 days",
          "Add fresh gas with stabilizer"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$3-15", time: "20-30 minutes", difficulty: "Very Easy", safety: "Safe" },
      professional: { cost: "$60-120", time: "Drop off + 3-5 days", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  {
    id: "sprinkler-broken",
    category: "yard",
    prompt: "Broken sprinkler head flooding my yard",
    diagnosis: {
      description: "Lawn mowers, foot traffic, or freezing can crack sprinkler heads. Easy to replace.",
      urgency: "MEDIUM",
      timeline: "Fix within 1 week",
      confidence: 90,
    },
    risks: [
      "Water waste and high water bill",
      "Flooding and soggy lawn areas",
      "System pressure issues"
    ],
    budget: {
      estimatedCost: "$5-15 per head DIY or $75-150 professional",
      recommendation: "Very easy DIY. Sprinkler heads screw in and out.",
    },
    options: [
      {
        type: "DIY Replacement",
        name: "Replace Sprinkler Head",
        details: "Replacement head $5-15",
        steps: [
          "Dig around sprinkler to expose riser",
          "Unscrew broken head counterclockwise",
          "Clean threads on riser",
          "Wrap new head threads with Teflon tape",
          "Screw in new head",
          "Turn on zone to test"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$5-15", time: "15 minutes", difficulty: "Very Easy", safety: "Safe" },
      professional: { cost: "$75-150", time: "Schedule + travel", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  {
    id: "gutters-clogged",
    category: "yard",
    prompt: "Gutters are clogged and overflowing",
    diagnosis: {
      description: "Leaves, pine needles, and debris accumulate in gutters. Water overflows causing foundation damage.",
      urgency: "MEDIUM",
      timeline: "Clean before next rain",
      confidence: 95,
    },
    risks: [
      "Foundation damage from water pooling",
      "Basement flooding",
      "Fascia board rot",
      "Ice dams in winter"
    ],
    budget: {
      estimatedCost: "$0-30 DIY or $100-250 professional",
      recommendation: "If single-story and comfortable on ladder: DIY. Two-story: hire insured pro.",
    },
    options: [
      {
        type: "DIY Cleaning",
        name: "Clean Gutters Yourself",
        details: "Ladder, gloves, scoop, hose",
        steps: [
          "Set up stable ladder on level ground",
          "Have someone spot you",
          "Scoop debris into bucket",
          "Flush downspouts with hose",
          "Check for leaks or loose sections"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$0-30", time: "1-2 hours", difficulty: "Moderate", safety: "Ladder fall risk - use spotter" },
      professional: { cost: "$100-250", time: "1-2 hours", difficulty: "N/A", safety: "Professional insured" }
    }
  },
  // Safety
  {
    id: "co-detector",
    category: "safety",
    prompt: "CO detector beeping at 2am",
    diagnosis: {
      description: "4 beeps = CO detected (evacuate). 1 beep/minute = low battery. Continuous chirp = replace unit.",
      urgency: "HIGH",
      timeline: "Address immediately",
      confidence: 70,
    },
    risks: [
      "Carbon monoxide poisoning (fatal)",
      "False sense of security if detector is broken"
    ],
    budget: {
      estimatedCost: "$15-50 for new detector",
      recommendation: "If 4 beeps: evacuate and call 911. Otherwise replace battery or unit.",
    },
    options: [
      {
        type: "Emergency",
        name: "If 4 Beeps: Evacuate",
        details: "This pattern means CO detected",
        steps: [
          "Evacuate everyone and pets immediately",
          "Call 911 from outside",
          "Do not re-enter until fire dept clears",
          "Have HVAC and gas appliances inspected"
        ]
      },
      {
        type: "DIY Fix",
        name: "Replace Battery or Unit",
        details: "Battery $8 or new detector $25-50",
        steps: [
          "If single beep: replace 9V battery",
          "If continuous chirp: replace entire unit",
          "Test new battery or unit"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$8-50", time: "10 minutes", difficulty: "Very Easy", safety: "Safe (unless CO detected)" },
      professional: { cost: "$150-300", time: "Schedule + 1-2 hours", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  {
    id: "smoke-detector",
    category: "safety",
    prompt: "Smoke detector chirping every minute",
    diagnosis: {
      description: "Single chirp every minute means low battery. Replace battery first. If still chirps, detector is 10+ years old.",
      urgency: "LOW-MEDIUM",
      timeline: "Fix within 1 week",
      confidence: 95,
    },
    risks: [
      "No fire protection if detector fails",
      "False sense of security"
    ],
    budget: {
      estimatedCost: "$8 battery or $15-40 new detector",
      recommendation: "Very cheap and easy DIY. No reason not to fix immediately.",
    },
    options: [
      {
        type: "DIY Fix",
        name: "Replace Battery",
        details: "9V battery $8 for 2-pack",
        steps: [
          "Twist detector off ceiling mount",
          "Remove old 9V battery",
          "Install fresh 9V battery",
          "Press test button to verify",
          "Remount detector"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$8-40", time: "5-15 minutes", difficulty: "Very Easy", safety: "Safe" },
      professional: { cost: "N/A", time: "N/A", difficulty: "N/A", safety: "Not needed" }
    }
  },
  // Home
  {
    id: "bathroom-mold",
    category: "home",
    prompt: "Bathroom has black mold in the grout",
    diagnosis: {
      description: "Bathrooms with poor ventilation develop mold in grout. Surface mold can be cleaned. Deep mold requires regrouting.",
      urgency: "MEDIUM",
      timeline: "Clean within 2 weeks",
      confidence: 90,
    },
    risks: [
      "Respiratory issues and allergies",
      "Mold spreading to walls behind tiles",
      "Structural damage if ignored"
    ],
    budget: {
      estimatedCost: "$10-30 DIY cleaning or $200-500 professional regrouting",
      recommendation: "Try DIY cleaning first. If mold returns quickly, ventilation is the issue.",
    },
    options: [
      {
        type: "DIY Cleaning",
        name: "Clean Mold from Grout",
        details: "Bleach $5, grout brush $8",
        steps: [
          "Ventilate bathroom (open window, turn on fan)",
          "Mix 1 part bleach to 10 parts water",
          "Spray on moldy grout, let sit 10 minutes",
          "Scrub with grout brush",
          "Rinse thoroughly with water",
          "Apply grout sealer to prevent recurrence"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$10-30", time: "1-2 hours", difficulty: "Easy", safety: "Wear gloves and ventilate" },
      professional: { cost: "$200-500", time: "Half day", difficulty: "N/A", safety: "Professional handles" }
    }
  },
  // Maintenance
  {
    id: "hvac-filter",
    category: "maintenance",
    prompt: "HVAC filter hasn't been changed in 2 years",
    diagnosis: {
      description: "Dirty filters reduce efficiency, increase energy bills, and strain system. Simple 5-minute maintenance.",
      urgency: "LOW",
      timeline: "Change every 1-3 months",
      confidence: 100,
    },
    risks: [
      "Higher energy bills",
      "Reduced heating/cooling efficiency",
      "System failure from overwork"
    ],
    budget: {
      estimatedCost: "$15-30 for filters",
      recommendation: "Always DIY. Easiest home maintenance task.",
    },
    options: [
      {
        type: "DIY",
        name: "Replace HVAC Filter",
        details: "Filters $15-30 (buy 3-pack)",
        steps: [
          "Turn off HVAC system",
          "Locate filter (usually in return air duct)",
          "Note filter size on frame",
          "Buy exact size replacement",
          "Insert new filter with arrow pointing toward furnace",
          "Set reminder for 1-3 months"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$15-30", time: "5 minutes", difficulty: "Very Easy", safety: "Safe" },
      professional: { cost: "N/A", time: "N/A", difficulty: "N/A", safety: "Not applicable" }
    }
  },
  // Projects
  {
    id: "vintage-stereo",
    category: "projects",
    prompt: "Setting up vintage stereo gear - need help with cables",
    diagnosis: {
      description: "Old electronics can have capacitor issues. Need service manual, correct cables, and slow power-up to avoid damage.",
      urgency: "LOW",
      timeline: "Research before powering on",
      confidence: 75,
    },
    risks: [
      "Damaging vintage equipment from incorrect setup",
      "Electrical shock from failed components",
      "Speaker damage from wrong impedance"
    ],
    budget: {
      estimatedCost: "$20-60 for cables and cleaning supplies",
      recommendation: "Research your specific model first. Find service manual online.",
    },
    options: [
      {
        type: "DIY Setup",
        name: "Research and Connect Safely",
        details: "RCA cables $15, speaker wire $10",
        steps: [
          "Identify exact model number",
          "Find service manual online",
          "Clean all connections with contact cleaner",
          "Get correct cables",
          "Connect speakers matching impedance",
          "Power on slowly with volume at minimum"
        ]
      },
    ],
    tradeoffs: {
      diy: { cost: "$20-60", time: "2-3 hours", difficulty: "Moderate", safety: "Safe if you follow manual" },
      professional: { cost: "$100-200", time: "Drop off + 1 week", difficulty: "N/A", safety: "Professional handles" }
    }
  },
];
