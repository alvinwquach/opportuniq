/**
 * ==========================================
 * REPAIR DEMO STEP DATA
 * ==========================================
 *
 * Contains step-by-step instructions for repair demos:
 * - headlightSteps: Foggy headlight lens repair
 * - brakePadSteps: Brake pad replacement
 *
 * Each step includes:
 * - title: Step name
 * - description: What to do
 * - tools: Required tools
 * - correct: Proper technique
 * - incorrect: Common mistakes
 * - errorVisualization: Key for 3D error display
 */

export interface RepairStep {
  title: string;
  description: string;
  tools: string;
  correct: string;
  incorrect: string;
  errorVisualization: string;
}

export const headlightSteps: RepairStep[] = [
  {
    title: "Inspect for Condensation",
    description: "Check headlight lens for internal fogging. Look for water droplets, moisture buildup, and cloudy areas inside the lens.",
    tools: "Flashlight, visual inspection",
    correct: "Shine light at angle to see moisture patterns. Check vents for blockages. Verify fog is INSIDE, not outside.",
    incorrect: "Don't confuse external haze (oxidation) with internal fog. Don't attempt repair if lens is cracked—needs replacement.",
    errorVisualization: "cracked-lens"
  },
  {
    title: "Remove Headlight Assembly",
    description: "Disconnect electrical connector, remove mounting bolts (usually 3-4), and carefully pull assembly forward out of housing.",
    tools: "10mm socket wrench, trim removal tool, work gloves",
    correct: "Disconnect battery first. Remove bolts in correct order (top to bottom). Pull straight out—don't twist or force.",
    incorrect: "DON'T force assembly—will break mounting tabs. DON'T forget to disconnect power—risk of short circuit.",
    errorVisualization: "broken-tabs"
  },
  {
    title: "Open & Dry Assembly",
    description: "Heat lens seal with heat gun (LOW), carefully pry lens from housing. Remove moisture with compressed air and microfiber cloth.",
    tools: "Heat gun (250°F max), plastic pry tools, compressed air, microfiber cloth",
    correct: "Heat evenly around perimeter (3-5 min). Pry gently at clips. Blow out ALL moisture. Let dry completely (1+ hour).",
    incorrect: "DON'T overheat (melts plastic, warps lens). DON'T use metal tools (scratches lens). DON'T skip drying—fog will return.",
    errorVisualization: "melted-housing"
  },
  {
    title: "Seal Vents & Add Desiccant",
    description: "Check vent tubes for cracks. Apply automotive-grade silicone sealant to any gaps. Place 2-3 silica gel packs inside housing.",
    tools: "Permatex silicone sealant, silica gel packs (2-3), inspection light",
    correct: "Seal ALL cracks and worn gaskets. Place silica packs away from bulb heat. Ensure vent tubes are clear but sealed.",
    incorrect: "DON'T use regular household silicone (not heat-resistant). DON'T block vents completely (pressure buildup). DON'T skip desiccant.",
    errorVisualization: "blocked-vents"
  },
  {
    title: "Reassemble & Test",
    description: "Reattach lens with fresh butyl rubber sealant. Heat to bond seal. Reinstall assembly and test for 24-48 hours.",
    tools: "Butyl rubber sealant tape, heat gun, mounting bolts",
    correct: "Apply even sealant layer. Heat until tacky (not melted). Clamp or tape lens overnight. Reinstall, reconnect power, test.",
    incorrect: "DON'T rush seal cure time (weak bond = fog returns). DON'T overtighten bolts (cracks housing). DON'T skip 48hr test period.",
    errorVisualization: "weak-seal"
  }
];

export const brakePadSteps: RepairStep[] = [
  {
    title: "Inspect Brake Condition",
    description: "Check pad thickness (should be >3mm), rotor condition (no deep grooves), and caliper for leaks.",
    tools: "Flashlight, ruler or pad thickness gauge",
    correct: "Measure pad at thinnest point. Check both inner and outer pads. Inspect rotor for scoring, cracks, or warping.",
    incorrect: "Don't ignore grinding noises (metal-on-metal damage). Don't proceed if caliper is leaking fluid (brake failure risk).",
    errorVisualization: "damaged-rotor"
  },
  {
    title: "Remove Wheel & Caliper",
    description: "Loosen lug nuts, jack car safely, remove wheel. Remove caliper bolts and slide caliper off rotor (don't disconnect brake line).",
    tools: "Lug wrench, jack & jack stands, C-clamp, 13mm/15mm socket",
    correct: "Use jack stands (never just jack). Support caliper with wire—don't let it hang by brake line. Compress piston slowly with C-clamp.",
    incorrect: "DON'T work under car on jack only (crush hazard). DON'T let caliper hang—damages brake line. DON'T force stuck bolts (strip threads).",
    errorVisualization: "hanging-caliper"
  },
  {
    title: "Remove Old Pads",
    description: "Slide out old brake pads and retaining clips. Check piston condition and clean caliper bracket with wire brush.",
    tools: "Wire brush, brake cleaner spray, shop rags",
    correct: "Note pad orientation (wear indicators face rotor). Clean bracket slides thoroughly. Inspect piston boot for tears.",
    incorrect: "Don't mix up inner/outer pad positions. Don't skip cleaning—rusty slides cause uneven wear. Don't damage piston boot.",
    errorVisualization: "torn-boot"
  },
  {
    title: "Install New Pads & Reassemble",
    description: "Apply brake lubricant to slide pins and pad backing (NOT friction surface). Install new pads, reattach caliper.",
    tools: "Ceramic brake lubricant, new pads, torque wrench",
    correct: "Lubricate slide pins and shims only. Tighten caliper bolts to spec (25-35 lb-ft). Pump brake pedal before driving.",
    incorrect: "DON'T get lube on rotor or pad surface (reduces braking). DON'T overtighten (strips threads). DON'T drive without pumping pedal.",
    errorVisualization: "contaminated-pads"
  },
  {
    title: "Bed-In New Pads",
    description: "Drive at 40mph, brake firmly (not hard) to 15mph. Repeat 8-10 times. Let cool completely before hard braking.",
    tools: "Safe road, patience",
    correct: "Gradual firm stops (not emergency braking). Allow cooling between sets. Avoid hard braking for first 200 miles.",
    incorrect: "DON'T do hard emergency stops immediately (glazes pads). DON'T ride brakes going downhill (overheats). DON'T skip bed-in.",
    errorVisualization: "glazed-pads"
  }
];
