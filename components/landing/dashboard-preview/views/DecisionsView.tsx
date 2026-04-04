"use client";

import { useState } from "react";
import {
  IoFlashOutline,
  IoHomeOutline,
  IoCarOutline,
  IoConstructOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoPeopleOutline,
  IoAddOutline,
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
  IoShieldOutline,
  IoWarningOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoCallOutline,
  IoStarOutline,
  IoLocationOutline,
} from "react-icons/io5";
import { useDarkMode } from "../DarkModeContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PPEItem {
  name: string;
  level: "Required" | "Recommended";
}

interface Option {
  label: string;
  cost: number;
  time: string;
  confidence: number;
  risk: string;
  failureCost?: number;
  requiredSkills?: string[];
  ppeRequired?: PPEItem[];
  doNotProceedWithout?: string;
}

interface ScenarioSimulation {
  name: string;
  outcome: string;
  badge: "green" | "amber" | "red";
  recommendation: string;
}

interface VendorContact {
  name: string;
  quote: number;
  rating: number;
  distance: string;
  contacted: boolean;
}

interface OutcomeRecord {
  chosen: "diy" | "pro";
  actualCost: number;
  estimatedCost: number;
  timeDays: number;
  savedVsPro: number;
  success: boolean;
  whatWentWell?: string;
  whatWentWrong?: string;
  wouldDoAgain?: boolean;
  lessonsLearned?: string;
}

interface Vote {
  name: string;
  avatar: string;
  vote: "diy" | "pro" | null;
}

interface Decision {
  id: string;
  title: string;
  status: "pending" | "approved" | "resolved";
  priority: "high" | "medium" | "low";
  category: string;
  createdAt: string;
  diyOption: Option;
  proOption: Option;
  votes: Vote[];
  outcome: OutcomeRecord | null;
  scenarioSimulations?: ScenarioSimulation[];
  vendorContacts?: VendorContact[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const decisions: Decision[] = [
  {
    id: "1",
    title: "Replace HVAC system",
    status: "pending",
    priority: "high",
    category: "HVAC",
    createdAt: "2 days ago",
    diyOption: {
      label: "DIY Install",
      cost: 2800,
      time: "2 weekends",
      confidence: 41,
      risk: "High",
      failureCost: 4200,
      requiredSkills: ["Electrical wiring", "Refrigerant handling", "Ductwork"],
      ppeRequired: [
        { name: "Safety glasses", level: "Required" },
        { name: "Work gloves", level: "Required" },
        { name: "Respirator mask", level: "Recommended" },
      ],
      doNotProceedWithout: "Electrical panel capacity confirmed",
    },
    proOption: { label: "Hire HVAC Pro", cost: 5200, time: "1 day", confidence: 94, risk: "Low", failureCost: 800 },
    votes: [
      { name: "Jamie", avatar: "👩", vote: "pro" },
      { name: "Mike", avatar: "👨", vote: "pro" },
      { name: "Sam", avatar: "🧑", vote: null },
    ],
    outcome: null,
    scenarioSimulations: [
      {
        name: "If parts cost rises 20%",
        outcome: "$3,360 DIY cost",
        badge: "amber",
        recommendation: "Pro still cheaper; lean toward hiring.",
      },
      {
        name: "If deferred 30 days",
        outcome: "Risk: Very High",
        badge: "red",
        recommendation: "Summer heat wave increases urgency.",
      },
    ],
    vendorContacts: [
      { name: "CoolBreeze HVAC", quote: 4950, rating: 4.8, distance: "2.1 mi", contacted: true },
      { name: "Arctic Air Co.", quote: 5400, rating: 4.6, distance: "3.7 mi", contacted: false },
    ],
  },
  {
    id: "2",
    title: "Fix basement sump pump",
    status: "approved",
    priority: "medium",
    category: "Plumbing",
    createdAt: "5 days ago",
    diyOption: {
      label: "DIY Repair",
      cost: 85,
      time: "3 hours",
      confidence: 78,
      risk: "Low",
      failureCost: 3200,
      requiredSkills: ["Basic plumbing", "Hand tools"],
      ppeRequired: [
        { name: "Safety glasses", level: "Required" },
        { name: "Work gloves", level: "Recommended" },
      ],
      doNotProceedWithout: "Gas shutoff valve accessible",
    },
    proOption: { label: "Hire Plumber", cost: 320, time: "2 hours", confidence: 98, risk: "Very Low", failureCost: 400 },
    votes: [
      { name: "Jamie", avatar: "👩", vote: "diy" },
      { name: "Mike", avatar: "👨", vote: "diy" },
      { name: "Sam", avatar: "🧑", vote: "diy" },
    ],
    outcome: null,
    scenarioSimulations: [
      {
        name: "If parts cost rises 20%",
        outcome: "$102 DIY cost",
        badge: "green",
        recommendation: "Still well under pro quote; DIY remains best.",
      },
      {
        name: "If deferred 30 days",
        outcome: "Risk: Medium",
        badge: "amber",
        recommendation: "Flooding risk rises with spring rain season.",
      },
    ],
    vendorContacts: [
      { name: "QuickFlow Plumbing", quote: 295, rating: 4.9, distance: "1.4 mi", contacted: false },
      { name: "DrainMasters LLC", quote: 340, rating: 4.5, distance: "4.2 mi", contacted: false },
    ],
  },
  {
    id: "3",
    title: "Garage door opener",
    status: "resolved",
    priority: "low",
    category: "Garage",
    createdAt: "2 weeks ago",
    diyOption: {
      label: "DIY Replace",
      cost: 180,
      time: "4 hours",
      confidence: 72,
      risk: "Low",
      failureCost: 600,
      requiredSkills: ["Basic wiring", "Hand tools"],
      ppeRequired: [
        { name: "Safety glasses", level: "Required" },
        { name: "Work gloves", level: "Recommended" },
      ],
      doNotProceedWithout: "Power disconnected at breaker",
    },
    proOption: { label: "Hire Technician", cost: 350, time: "1 hour", confidence: 99, risk: "Very Low", failureCost: 200 },
    votes: [
      { name: "Jamie", avatar: "👩", vote: "diy" },
      { name: "Mike", avatar: "👨", vote: "pro" },
      { name: "Sam", avatar: "🧑", vote: "diy" },
    ],
    outcome: {
      chosen: "diy",
      actualCost: 165,
      estimatedCost: 180,
      timeDays: 1,
      savedVsPro: 185,
      success: true,
      whatWentWell: "Door opens smoothly, saved $185",
      whatWentWrong: "Took 2x longer than estimated",
      wouldDoAgain: true,
      lessonsLearned: "Buy lubricant beforehand",
    },
    scenarioSimulations: [
      {
        name: "If parts cost rises 20%",
        outcome: "$216 DIY cost",
        badge: "green",
        recommendation: "Still $134 cheaper than hiring; DIY wins.",
      },
      {
        name: "If deferred 30 days",
        outcome: "Risk: Low",
        badge: "green",
        recommendation: "Non-urgent; deferral acceptable.",
      },
    ],
    vendorContacts: [
      { name: "GaragePros Inc.", quote: 330, rating: 4.7, distance: "0.9 mi", contacted: true },
      { name: "LiftRight Services", quote: 370, rating: 4.4, distance: "5.1 mi", contacted: false },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function categoryIcon(category: string) {
  switch (category) {
    case "HVAC":     return IoFlashOutline;
    case "Plumbing": return IoHomeOutline;
    case "Garage":   return IoCarOutline;
    default:         return IoConstructOutline;
  }
}

const priorityDot: Record<Decision["priority"], string> = {
  high:   "bg-red-400",
  medium: "bg-amber-400",
  low:    "bg-gray-300",
};

const statusBadge: Record<Decision["status"], { bg: string; text: string; label: string }> = {
  pending:  { bg: "bg-amber-50",  text: "text-amber-600",  label: "Pending"  },
  approved: { bg: "bg-blue-50",   text: "text-blue-600",   label: "Approved" },
  resolved: { bg: "bg-gray-100",  text: "text-gray-500",   label: "Resolved" },
};

function riskColor(risk: string) {
  switch (risk) {
    case "Very Low": return "bg-green-50 text-green-700";
    case "Low":      return "bg-blue-50 text-blue-600";
    case "High":     return "bg-red-50 text-red-600";
    default:         return "bg-gray-100 text-gray-500";
  }
}

function voteSummary(votes: Vote[]): string {
  const cast = votes.filter((v) => v.vote !== null);
  if (cast.length === 0) return "No votes yet";
  const diyCnt = cast.filter((v) => v.vote === "diy").length;
  const proCnt = cast.filter((v) => v.vote === "pro").length;
  const totalCnt = votes.length;

  if (diyCnt === totalCnt) return `Unanimous DIY`;
  if (proCnt === totalCnt) return `Unanimous Pro`;
  const winner = diyCnt > proCnt ? "DIY leads" : "Pro leads";
  return `${cast.length} of ${totalCnt} voted · ${winner}`;
}

function scenarioBadgeStyle(badge: ScenarioSimulation["badge"]) {
  switch (badge) {
    case "green": return "bg-green-50 text-green-700";
    case "amber": return "bg-amber-50 text-amber-600";
    case "red":   return "bg-red-50 text-red-600";
  }
}

function aiRecommendation(decision: Decision): { option: "diy" | "pro"; text: string } {
  const diy = decision.diyOption;
  const pro = decision.proOption;
  if (diy.confidence >= 70 && diy.risk !== "High") {
    const saved = pro.cost - diy.cost;
    return {
      option: "diy",
      text: `Based on ${diy.confidence}% diagnosis confidence and your $47/hr rate, DIY saves $${saved.toLocaleString()} and is worth the effort.`,
    };
  }
  return {
    option: "pro",
    text: `With only ${diy.confidence}% confidence and a ${diy.risk.toLowerCase()} risk rating, hiring a pro at $${pro.cost.toLocaleString()} is the safer and recommended choice.`,
  };
}

// ── Left panel: decision list ─────────────────────────────────────────────────

function DecisionRow({
  decision,
  selected,
  onClick,
}: {
  decision: Decision;
  selected: boolean;
  onClick: () => void;
}) {
  const dark = useDarkMode();
  const Icon = categoryIcon(decision.category);
  const st = statusBadge[decision.status];
  const isResolved = decision.status === "resolved";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-2.5 px-3 py-3 border-b text-left transition-colors group ${
        dark ? "border-white/[0.06]" : "border-gray-100"
      } ${
        selected
          ? dark ? "bg-blue-600/10" : "bg-blue-50"
          : dark ? "bg-transparent hover:bg-white/[0.04]" : "bg-white hover:bg-gray-50"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${priorityDot[decision.priority]}`} />
      <div className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 ${dark ? "bg-white/[0.06] border-white/10" : "bg-gray-50 border-gray-100"}`}>
        <Icon className={`w-3.5 h-3.5 ${dark ? "text-gray-500" : "text-gray-500"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs truncate ${isResolved ? dark ? "text-gray-600 font-normal" : "text-gray-400 font-normal" : dark ? "text-gray-200 font-medium" : "text-gray-900 font-medium"}`}>
          {decision.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${st.bg} ${st.text}`}>
            {st.label}
          </span>
          <span className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{decision.createdAt}</span>
        </div>
      </div>
      <IoChevronForwardOutline className={`w-3 h-3 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${dark ? "text-gray-600" : "text-gray-300"}`} />
    </button>
  );
}

// ── Center panel: decision detail ─────────────────────────────────────────────

function OptionCard({
  option,
  type,
  chosen,
}: {
  option: Option;
  type: "diy" | "pro";
  chosen?: "diy" | "pro" | null;
}) {
  const dark = useDarkMode();
  const isDIY = type === "diy";
  const isChosen = chosen === type;

  return (
    <div
      className={`flex-1 rounded-xl border p-4 ${
        isDIY
          ? dark ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-50/60 border-blue-100"
          : dark ? "bg-indigo-500/10 border-indigo-500/30" : "bg-indigo-50/60 border-indigo-100"
      } ${isChosen ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
    >
      {isChosen && (
        <div className="flex items-center gap-1 mb-2">
          <IoCheckmarkCircle className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Chosen</span>
        </div>
      )}
      <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${isDIY ? "text-blue-500" : "text-indigo-500"}`}>
        {isDIY ? "DIY" : "Hire Pro"}
      </p>
      <p className={`text-xs font-medium mb-2 ${dark ? "text-gray-400" : "text-gray-700"}`}>{option.label}</p>
      <p className={`text-2xl font-bold leading-none mb-3 ${isDIY ? "text-blue-500" : "text-indigo-500"}`}>
        ${option.cost.toLocaleString()}
      </p>

      <div className="space-y-2">
        <div className={`flex items-center gap-1.5 text-[10px] ${dark ? "text-gray-500" : "text-gray-500"}`}>
          <IoTimeOutline className="w-3 h-3" />
          <span>{option.time}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className={dark ? "text-gray-500" : "text-gray-500"}>Confidence</span>
            <span className={`font-semibold ${isDIY ? "text-blue-500" : "text-indigo-500"}`}>
              {option.confidence}%
            </span>
          </div>
          <div className={`h-1 rounded-full overflow-hidden border ${dark ? "bg-white/[0.06] border-white/10" : "bg-white/70 border-white"}`}>
            <div
              className={`h-full rounded-full ${isDIY ? "bg-blue-400" : "bg-indigo-400"}`}
              style={{ width: `${option.confidence}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IoAlertCircleOutline className={`w-3 h-3 ${dark ? "text-gray-600" : "text-gray-400"}`} />
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${riskColor(option.risk)}`}>
            {option.risk} Risk
          </span>
          {option.failureCost !== undefined && (
            <span className={`text-[10px] ml-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>
              · Failure: ${option.failureCost.toLocaleString()}
            </span>
          )}
        </div>

        {/* DIY-only: PPE Required */}
        {isDIY && option.ppeRequired && option.ppeRequired.length > 0 && (
          <div className={`pt-1 border-t ${dark ? "border-white/10" : "border-white/60"}`}>
            <div className="flex items-center gap-1 mb-1">
              <IoShieldOutline className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-semibold text-amber-500">PPE Required</span>
            </div>
            <div className="space-y-0.5">
              {option.ppeRequired.map((ppe) => (
                <div key={ppe.name} className="flex items-center justify-between">
                  <span className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-600"}`}>{ppe.name}</span>
                  <span
                    className={`text-[10px] px-1 py-0.5 rounded font-medium ${
                      ppe.level === "Required"
                        ? "bg-amber-500/20 text-amber-500"
                        : dark ? "bg-white/[0.06] text-gray-500" : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {ppe.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIY-only: Do not proceed without */}
        {isDIY && option.doNotProceedWithout && (
          <div className={`flex items-start gap-1.5 p-2 rounded-lg border ${dark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-100"}`}>
            <IoWarningOutline className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-red-500 leading-none mb-0.5">Do not proceed without:</p>
              <p className="text-[10px] text-red-400">{option.doNotProceedWithout}</p>
            </div>
          </div>
        )}

        {/* DIY-only: Required skills */}
        {isDIY && option.requiredSkills && option.requiredSkills.length > 0 && (
          <div>
            <p className={`text-[10px] font-semibold mb-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Required skills</p>
            <div className="flex flex-wrap gap-1">
              {option.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionDetail({ decision }: { decision: Decision }) {
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  const Icon = categoryIcon(decision.category);
  const st = statusBadge[decision.status];
  const rec = aiRecommendation(decision);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className={`px-5 py-4 border-b ${b}`}>
        <div className="flex items-start gap-3 mb-2">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${dark ? "bg-white/[0.06] border-white/10" : "bg-gray-50 border-gray-100"}`}>
            <Icon className={`w-4.5 h-4.5 ${dark ? "text-gray-500" : "text-gray-600"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{decision.title}</h2>
            <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>{decision.category}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${st.bg} ${st.text}`}>
            {st.label}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>
          <IoTimeOutline className="w-3 h-3" />
          <span>Created {decision.createdAt}</span>
        </div>
      </div>

      {/* Option comparison */}
      <div className={`px-5 py-4 border-b ${b}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-wide mb-3 ${dark ? "text-gray-600" : "text-gray-400"}`}>Compare Options</p>
        <div className="flex gap-3">
          <OptionCard
            option={decision.diyOption}
            type="diy"
            chosen={decision.outcome?.chosen}
          />
          <OptionCard
            option={decision.proOption}
            type="pro"
            chosen={decision.outcome?.chosen}
          />
        </div>
      </div>

      {/* AI recommendation */}
      <div className={`px-5 py-4 border-b ${b}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0">
            <span className="text-[7px] text-white font-bold">AI</span>
          </div>
          <span className={`text-xs font-semibold ${dark ? "text-gray-200" : "text-gray-700"}`}>AI Recommendation</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
            rec.option === "diy" ? "bg-blue-500/20 text-blue-400" : "bg-indigo-500/20 text-indigo-400"
          }`}>
            {rec.option === "diy" ? "DIY" : "Hire Pro"}
          </span>
        </div>
        <div className={`p-3 rounded-lg border ${dark ? "bg-white/[0.04] border-white/[0.06]" : "bg-gray-50 border-gray-100"}`}>
          <p className={`text-xs leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>{rec.text}</p>
        </div>
      </div>

      {/* Scenario Simulations */}
      {decision.scenarioSimulations && decision.scenarioSimulations.length > 0 && (
        <div className={`px-5 py-4 border-b ${b}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-3 ${dark ? "text-gray-600" : "text-gray-400"}`}>
            Scenario Simulations
          </p>
          <div className="grid grid-cols-2 gap-2">
            {decision.scenarioSimulations.map((sim) => (
              <div
                key={sim.name}
                className={`p-2.5 rounded-lg border flex flex-col gap-1.5 ${dark ? "border-white/[0.06] bg-white/[0.04]" : "border-gray-100 bg-gray-50"}`}
              >
                <p className={`text-[10px] font-semibold leading-tight ${dark ? "text-gray-400" : "text-gray-600"}`}>{sim.name}</p>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium self-start ${scenarioBadgeStyle(sim.badge)}`}
                >
                  {sim.outcome}
                </span>
                <p className={`text-[10px] leading-tight ${dark ? "text-gray-600" : "text-gray-400"}`}>{sim.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outcome (resolved only) */}
      {decision.outcome && (
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <IoTrendingUpOutline className="w-4 h-4 text-green-500" />
            <span className={`text-xs font-semibold ${dark ? "text-gray-200" : "text-gray-700"}`}>Outcome</span>
            {decision.outcome.success && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-500 font-medium flex items-center gap-1">
                <IoShieldCheckmarkOutline className="w-3 h-3" />
                Success
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-3 rounded-lg border ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-100"}`}>
              <p className={`text-[10px] mb-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Actual Cost</p>
              <p className={`text-base font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>${decision.outcome.actualCost}</p>
              <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>est. ${decision.outcome.estimatedCost}</p>
            </div>
            <div className={`p-3 rounded-lg border ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-100"}`}>
              <p className={`text-[10px] mb-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Saved vs Pro</p>
              <p className="text-base font-bold text-green-500">${decision.outcome.savedVsPro}</p>
              <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{decision.outcome.timeDays}d to complete</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Right panel: votes ────────────────────────────────────────────────────────

function VotePanel({ decision }: { decision: Decision }) {
  const summary = voteSummary(decision.votes);
  const isPending = decision.status === "pending";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <IoPeopleOutline className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-semibold text-gray-700">Household Vote</span>
      </div>

      {/* Member votes */}
      <div className="px-4 py-3 border-b border-gray-100 space-y-2">
        {decision.votes.map((v) => (
          <div key={v.name} className="flex items-center gap-2.5">
            <span className="text-lg leading-none flex-shrink-0">{v.avatar}</span>
            <span className="text-xs text-gray-700 flex-1 font-medium">{v.name}</span>
            {v.vote === "diy" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">DIY</span>
            ) : v.vote === "pro" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">Hire Pro</span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-medium">Waiting</span>
            )}
          </div>
        ))}
      </div>

      {/* Vote summary */}
      <div className="px-4 py-2.5 border-b border-gray-100">
        <p className="text-[10px] text-gray-500 font-medium">{summary}</p>
      </div>

      {/* Vendor Quotes */}
      {decision.vendorContacts && decision.vendorContacts.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <IoCallOutline className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Vendor Quotes</p>
          </div>
          <div className="space-y-2">
            {decision.vendorContacts.map((vendor) => (
              <div
                key={vendor.name}
                className="rounded-lg border border-gray-100 bg-white p-2.5 flex flex-col gap-1"
              >
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[10px] font-semibold text-gray-700 leading-tight">{vendor.name}</p>
                  {vendor.contacted ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium flex-shrink-0">
                      Contacted
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium flex-shrink-0 cursor-pointer">
                      Reach Out
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-900">${vendor.quote.toLocaleString()}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="flex items-center gap-0.5">
                    <IoStarOutline className="w-2.5 h-2.5" />
                    {vendor.rating}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <IoLocationOutline className="w-2.5 h-2.5" />
                    {vendor.distance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cast vote (pending only) */}
      {isPending && (
        <div className="px-4 py-3 border-b border-gray-100 space-y-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Cast your vote</p>
          <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors">
            Vote DIY
          </button>
          <button className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors">
            Vote Pro
          </button>
        </div>
      )}

      {/* Outcome record (resolved only) */}
      {decision.outcome && (
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Outcome Record</p>
          <div className="rounded-lg bg-green-50 border border-green-100 p-3 space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-green-700">Chose</span>
              <span className="font-semibold text-green-800 capitalize">{decision.outcome.chosen}</span>
            </div>
            {/* Actual vs Estimated (costDelta) */}
            {(() => {
              const delta = decision.outcome.actualCost - decision.outcome.estimatedCost;
              const under = delta <= 0;
              return (
                <div className="flex justify-between text-[10px]">
                  <span className="text-green-700">Actual vs Estimated</span>
                  <span className={`font-semibold ${under ? "text-green-700" : "text-red-600"}`}>
                    ${decision.outcome.actualCost}{" "}
                    <span className={`text-[9px] ${under ? "text-green-600" : "text-red-500"}`}>
                      ({under ? "" : "+"}{delta})
                    </span>
                  </span>
                </div>
              );
            })()}
            <div className="flex justify-between text-[10px]">
              <span className="text-green-700">Saved</span>
              <span className="font-semibold text-green-800">${decision.outcome.savedVsPro}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-green-700">Days taken</span>
              <span className="font-semibold text-green-800">{decision.outcome.timeDays}</span>
            </div>
          </div>

          {/* Retrospective */}
          {(decision.outcome.whatWentWell ||
            decision.outcome.whatWentWrong ||
            decision.outcome.wouldDoAgain !== undefined ||
            decision.outcome.lessonsLearned) && (
            <div className="mt-2 rounded-lg border border-gray-100 bg-white p-3 space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Retrospective</p>
              {decision.outcome.whatWentWell && (
                <div className="flex items-start gap-1.5">
                  <IoCheckmarkCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-600 leading-tight">{decision.outcome.whatWentWell}</p>
                </div>
              )}
              {decision.outcome.whatWentWrong && (
                <div className="flex items-start gap-1.5">
                  <IoCloseOutline className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-600 leading-tight">{decision.outcome.whatWentWrong}</p>
                </div>
              )}
              {decision.outcome.wouldDoAgain !== undefined && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Would do again</span>
                  {decision.outcome.wouldDoAgain ? (
                    <span className="flex items-center gap-0.5 text-green-600 font-semibold">
                      <IoCheckmarkOutline className="w-3 h-3" />
                      Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-red-500 font-semibold">
                      <IoCloseOutline className="w-3 h-3" />
                      No
                    </span>
                  )}
                </div>
              )}
              {decision.outcome.lessonsLearned && (
                <div className="pt-1 border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 mb-0.5">Lesson learned</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{decision.outcome.lessonsLearned}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function DecisionsView() {
  const [selectedId, setSelectedId] = useState<string>(decisions[0].id);
  const selected = decisions.find((d) => d.id === selectedId) ?? decisions[0];

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* Panel 1: Decision list */}
      <div className="w-[220px] flex-shrink-0 border-r border-gray-100 flex flex-col h-full">
        <div className="px-3 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-900">Decisions</span>
          <span className="text-[10px] text-gray-400">{decisions.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {decisions.map((d) => (
            <DecisionRow
              key={d.id}
              decision={d}
              selected={selectedId === d.id}
              onClick={() => setSelectedId(d.id)}
            />
          ))}
        </div>

        <div className="p-3 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
            <IoAddOutline className="w-3.5 h-3.5" />
            New Decision
          </button>
        </div>
      </div>

      {/* Panel 2: Decision detail */}
      <div className="flex-1 min-w-0 border-r border-gray-100 h-full overflow-hidden">
        <DecisionDetail decision={selected} />
      </div>

      {/* Panel 3: Vote tally */}
      <div className="w-[220px] flex-shrink-0 h-full overflow-hidden">
        <VotePanel decision={selected} />
      </div>
    </div>
  );
}
