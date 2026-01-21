import {
  IoHandLeft,
  IoEye,
  IoFootsteps,
  IoHardwareChip,
} from "react-icons/io5";
import type { DemoScenario, CardId, StreamingPhase } from "./types";

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "pond-algae",
    title: "Clean pond algae",
    description: "Evaluate algae removal from residential pond",
    location: { lat: 33.749, lng: -84.388, name: "Atlanta, GA", zipCode: "30301" },
    weather: { temp: 78, humidity: 65, wind: 8, condition: "Partly Cloudy" },
    risks: [
      { category: "Chemical Exposure", severity: "medium", likelihood: 60, color: "#f59e0b" },
      { category: "Slipping/Falling", severity: "medium", likelihood: 45, color: "#f59e0b" },
      { category: "Skin Irritation", severity: "low", likelihood: 70, color: "#22c55e" },
      { category: "Water Contamination", severity: "high", likelihood: 30, color: "#ef4444" },
      { category: "Equipment Damage", severity: "low", likelihood: 25, color: "#22c55e" },
    ],
    safetyEquipment: [
      { name: "Chemical-resistant gloves", icon: IoHandLeft, required: true },
      { name: "Safety goggles", icon: IoEye, required: true },
      { name: "Waterproof boots", icon: IoFootsteps, required: true },
      { name: "Protective clothing", icon: IoHardwareChip, required: false },
    ],
    complications: [
      { issue: "Algae may indicate underlying water quality issues", impact: "high" },
      { issue: "Treatment may temporarily affect fish/wildlife", impact: "medium" },
      { issue: "Weather conditions affect chemical effectiveness", impact: "medium" },
      { issue: "Multiple treatments may be necessary", impact: "low" },
    ],
    toolsNearby: [
      { storeName: "Hardware Supply Co", distance: 2.3, tools: ["Pond rake", "Pump", "Chemical applicator"], lat: 33.752, lng: -84.391 },
      { storeName: "Garden Center Plus", distance: 3.8, tools: ["Algaecide", "Test kits", "Nets"], lat: 33.745, lng: -84.380 },
    ],
    opportunityCost: {
      timeValue: 50,
      estimatedHours: 4,
      materialCost: 150,
      riskCost: 300,
      totalCost: 650,
    },
    timeEstimate: "2-4 hours",
    confidenceScore: 82,
  },
  {
    id: "car-diagnosis",
    title: "Diagnose car issue",
    description: "Investigate check engine light and unusual sounds",
    location: { lat: 34.052, lng: -118.243, name: "Los Angeles, CA", zipCode: "90012" },
    weather: { temp: 72, humidity: 45, wind: 5, condition: "Sunny" },
    risks: [
      { category: "Electrical Hazard", severity: "medium", likelihood: 35, color: "#f59e0b" },
      { category: "Burns (Engine)", severity: "high", likelihood: 50, color: "#ef4444" },
      { category: "Pinch Points", severity: "medium", likelihood: 40, color: "#f59e0b" },
      { category: "Chemical Exposure", severity: "low", likelihood: 30, color: "#22c55e" },
      { category: "Misdiagnosis", severity: "medium", likelihood: 55, color: "#f59e0b" },
    ],
    safetyEquipment: [
      { name: "Mechanic gloves", icon: IoHandLeft, required: true },
      { name: "Safety glasses", icon: IoEye, required: true },
      { name: "Closed-toe shoes", icon: IoFootsteps, required: true },
      { name: "Work light", icon: IoHardwareChip, required: false },
    ],
    complications: [
      { issue: "Issue may be symptom of larger problem", impact: "high" },
      { issue: "Diagnostic tools may be required", impact: "medium" },
      { issue: "Vehicle-specific knowledge needed", impact: "medium" },
      { issue: "Parts availability varies", impact: "low" },
    ],
    toolsNearby: [
      { storeName: "AutoZone", distance: 1.2, tools: ["OBD2 Scanner", "Multimeter", "Socket set"], lat: 34.055, lng: -118.240 },
      { storeName: "O'Reilly Auto", distance: 1.8, tools: ["Code reader", "Battery tester", "Diagnostic tools"], lat: 34.048, lng: -118.248 },
    ],
    opportunityCost: {
      timeValue: 50,
      estimatedHours: 3,
      materialCost: 0,
      riskCost: 500,
      totalCost: 650,
    },
    timeEstimate: "1-3 hours",
    confidenceScore: 76,
  },
  {
    id: "roof-inspection",
    title: "Inspect roof damage",
    description: "Assess storm damage and potential leaks",
    location: { lat: 41.878, lng: -87.629, name: "Chicago, IL", zipCode: "60601" },
    weather: { temp: 55, humidity: 70, wind: 15, condition: "Overcast" },
    risks: [
      { category: "Fall Risk", severity: "high", likelihood: 40, color: "#ef4444" },
      { category: "Weather Exposure", severity: "medium", likelihood: 65, color: "#f59e0b" },
      { category: "Structural Weakness", severity: "high", likelihood: 25, color: "#ef4444" },
      { category: "Ladder Safety", severity: "medium", likelihood: 50, color: "#f59e0b" },
      { category: "Tool Handling", severity: "low", likelihood: 30, color: "#22c55e" },
    ],
    safetyEquipment: [
      { name: "Fall harness", icon: IoHardwareChip, required: true },
      { name: "Non-slip footwear", icon: IoFootsteps, required: true },
      { name: "Work gloves", icon: IoHandLeft, required: true },
      { name: "Safety helmet", icon: IoHardwareChip, required: true },
    ],
    complications: [
      { issue: "Hidden damage may not be visible", impact: "high" },
      { issue: "Weather window required for safety", impact: "high" },
      { issue: "May require professional equipment", impact: "medium" },
      { issue: "Insurance considerations apply", impact: "medium" },
    ],
    toolsNearby: [
      { storeName: "Home Depot", distance: 2.5, tools: ["Extension ladder", "Roof rake", "Flashlight"], lat: 41.880, lng: -87.625 },
      { storeName: "Menards", distance: 4.2, tools: ["Safety harness", "Tarps", "Caulk gun"], lat: 41.875, lng: -87.635 },
    ],
    opportunityCost: {
      timeValue: 50,
      estimatedHours: 2,
      materialCost: 50,
      riskCost: 1000,
      totalCost: 1150,
    },
    timeEstimate: "1-2 hours",
    confidenceScore: 68,
  },
];

export const STREAMING_PHASES: Record<string, StreamingPhase[]> = {
  "pond-algae": [
    { messages: ["Analyzing conditions for Atlanta, GA...", "Checking current weather conditions..."], cardToReveal: "location" },
    { messages: ["Calculating chemical exposure risks...", "Generating risk severity matrix...", "Assessing required safety equipment..."], cardToReveal: "risks" },
    { messages: ["Scanning nearby store inventory for tools..."], cardToReveal: "resources" },
    { messages: ["Computing opportunity cost factors..."], cardToReveal: "cost" },
    { messages: ["Analysis complete. Review findings below."], cardToReveal: "verdict" },
  ],
  "car-diagnosis": [
    { messages: ["Processing vehicle diagnostic parameters...", "Checking weather for outdoor work..."], cardToReveal: "location" },
    { messages: ["Identifying potential failure points...", "Calculating electrical system risks...", "Assessing tool requirements..."], cardToReveal: "risks" },
    { messages: ["Scanning area auto parts stores..."], cardToReveal: "resources" },
    { messages: ["Computing opportunity cost factors..."], cardToReveal: "cost" },
    { messages: ["Analysis complete. Review findings below."], cardToReveal: "verdict" },
  ],
  "roof-inspection": [
    { messages: ["Analyzing structural safety factors...", "Evaluating weather impact on safety..."], cardToReveal: "location" },
    { messages: ["Calculating fall risk parameters...", "Assessing required PPE..."], cardToReveal: "risks" },
    { messages: ["Scanning nearby hardware stores..."], cardToReveal: "resources" },
    { messages: ["Computing opportunity cost factors..."], cardToReveal: "cost" },
    { messages: ["Analysis complete. Review findings below."], cardToReveal: "verdict" },
  ],
};

export const CARD_ANIMATION_DELAY = 300; // ms between card reveals
