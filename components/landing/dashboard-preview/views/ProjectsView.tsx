"use client";

import { useState, useCallback } from "react";
import {
  IoSearch,
  IoAdd,
  IoCheckmarkCircle,
  IoChevronForward,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
  IoStorefrontOutline,
  IoConstructOutline,
  IoSparkles,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoFlashOutline,
  IoStar,
} from "react-icons/io5";

// Diagnose sub-components (reused for active projects)
import { ChatArea, ResourcePanel, issuesData } from "./diagnose";
import { DemoFlowProvider } from "./diagnose/DemoFlowContext";
import { useDarkMode } from "../DarkModeContext";

// History data (all projects — active + completed)
import { issuesHistoryData } from "./issues";
import type { Issue } from "./issues/types";

// ── helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<Issue["status"], { label: string; bg: string; text: string }> = {
  open:          { label: "Open",          bg: "bg-blue-50",   text: "text-blue-600"  },
  investigating: { label: "Active",        bg: "bg-amber-50",  text: "text-amber-600" },
  in_progress:   { label: "In Progress",   bg: "bg-purple-50", text: "text-purple-600"},
  completed:     { label: "Done",          bg: "bg-gray-100",  text: "text-gray-400"  },
};

const priorityDot: Record<Issue["priority"], string> = {
  high:   "bg-red-400",
  medium: "bg-amber-400",
  low:    "bg-blue-300",
};

const urgencyChip: Record<Issue["priority"], { label: string; bg: string; text: string }> = {
  high:   { label: "Today",     bg: "bg-red-50",   text: "text-red-600"   },
  medium: { label: "This Week", bg: "bg-amber-50", text: "text-amber-600" },
  low:    { label: "Monitor",   bg: "bg-gray-100", text: "text-gray-500"  },
};

const resolutionTypes = ["DIY", "Hire Pro", "Replace", "Defer", "Monitor"] as const;

// ── Left panel row ────────────────────────────────────────────────────────────

function ProjectRow({ issue, selected, onClick }: { issue: Issue; selected: boolean; onClick: () => void }) {
  const dark = useDarkMode();
  const Icon = issue.icon;
  const st = statusConfig[issue.status];
  const uc = urgencyChip[issue.priority];
  const done = issue.status === "completed";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 border-b text-left transition-colors group ${
        dark
          ? `border-white/[0.06] ${selected ? "bg-blue-600/10" : "bg-transparent hover:bg-white/[0.04]"}`
          : `border-gray-100 ${selected ? "bg-blue-50" : "bg-white hover:bg-blue-50/40"}`
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[issue.priority]}`} />
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${issue.iconBg}`}>
        <Icon className={`w-3.5 h-3.5 ${issue.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${done ? (dark ? "text-gray-600 font-normal" : "text-gray-400 font-normal") : (dark ? "text-gray-200 font-medium" : "text-gray-900 font-medium")}`}>
          {issue.title}
        </p>
        <p className={`text-xs truncate mt-0.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>
          {issue.group} · {issue.category} · {issue.diagnosis}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{issue.updatedAt}</span>
        <div className="flex items-center gap-1">
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${st.bg} ${st.text}`}>{st.label}</span>
          {!done && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${uc.bg} ${uc.text}`}>{uc.label}</span>
          )}
        </div>
      </div>
      {done
        ? <IoCheckmarkCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
        : <IoChevronForward className={`w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${dark ? "text-gray-600" : "text-gray-300"}`} />
      }
    </button>
  );
}

// ── Center: read-only detail for completed projects ───────────────────────────

function ProjectDetail({ issue }: { issue: Issue }) {
  const Icon = issue.icon;
  const st = statusConfig[issue.status];

  return (
    <div className="flex flex-col h-full scrollbar-auto-hide">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${issue.iconBg}`}>
            <Icon className={`w-5 h-5 ${issue.iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900">{issue.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{issue.group} · {issue.category}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.bg} ${st.text}`}>
              {st.label}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-600">
              {issue.confidence}% confidence
            </span>
          </div>
        </div>

        {/* Severity / urgency / emergency row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            issue.priority === "high" ? "bg-red-50 text-red-600" : issue.priority === "medium" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
          }`}>
            {issue.priority === "high" ? "Serious" : issue.priority === "medium" ? "Moderate" : "Minor"}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${urgencyChip[issue.priority].bg} ${urgencyChip[issue.priority].text}`}>
            {urgencyChip[issue.priority].label}
          </span>
          {issue.priority === "high" && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-500 text-white flex items-center gap-0.5">
              <IoFlashOutline className="w-2.5 h-2.5" />Emergency
            </span>
          )}
        </div>

        {/* Warning signs callout */}
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <IoWarningOutline className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Warning Signs to Watch</span>
          </div>
          <ul className="space-y-1">
            {["Water damage spreading to drywall", "Pressure drops below 40 PSI"].map((sign) => (
              <li key={sign} className="flex items-start gap-1.5 text-[10px] text-amber-700 leading-relaxed">
                <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                {sign}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><IoTimeOutline className="w-3.5 h-3.5" />{issue.createdAt}</span>
          <span className="flex items-center gap-1"><IoAlertCircleOutline className="w-3.5 h-3.5" />{issue.priority} priority</span>
          <span className="flex items-center gap-1"><IoPersonOutline className="w-3.5 h-3.5" />{issue.assignee.name}</span>
        </div>
      </div>

      {/* AI Diagnosis */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
            <span className="text-[7px] text-white font-bold">AI</span>
          </div>
          <span className="text-xs font-semibold text-gray-700">OpportunIQ</span>
          <span className="text-[10px] text-gray-400">· {issue.confidence}% confident</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed mb-3">{issue.diagnosis}</p>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-md font-medium ${
            issue.difficulty === "Professional Required" ? "bg-red-50 text-red-600"
            : issue.difficulty === "Easy" ? "bg-green-50 text-green-700"
            : "bg-amber-50 text-amber-700"
          }`}>{issue.difficulty}</span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />Safety check passed
          </span>
        </div>
      </div>

      {/* Conversation record */}
      <div className="px-6 py-4 space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Conversation</p>
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">{issue.title}</div>
        </div>
        <div className="flex gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[7px] text-white font-bold">AI</span>
          </div>
          <div className="bg-gray-100 text-gray-800 text-sm rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] leading-relaxed">
            {issue.diagnosis}. Confidence: {issue.confidence}%.
          </div>
        </div>
        <div className="flex gap-2 flex-wrap pt-1">
          {["What tools do I need?", "How long will this take?", "Is it safe to DIY?"].map((q) => (
            <button key={q} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Resolution section (shared between DIY + Pro tabs) ───────────────────────

function ResolutionSection() {
  const [selected, setSelected] = useState<typeof resolutionTypes[number]>("DIY");

  return (
    <div className="mt-5 pt-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Resolution</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {resolutionTypes.map((rt) => (
          <button
            key={rt}
            onClick={() => setSelected(rt)}
            className={`text-[10px] px-2.5 py-1 rounded-full font-medium border transition-colors ${
              selected === rt
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            {rt}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 min-h-[56px] flex items-start">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          Add resolution notes — e.g. steps taken, parts used, outcome…
        </p>
      </div>
    </div>
  );
}

// ── Right: resources for history items ───────────────────────────────────────

function ProjectResources({ issue }: { issue: Issue }) {
  const [tab, setTab] = useState<"diy" | "pro">("diy");
  const canDIY = issue.difficulty !== "Professional Required";

  return (
    <div className="flex flex-col h-full scrollbar-auto-hide">
      <div className="flex border-b border-gray-100">
        {(["diy", "pro"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors border-b-2 ${
              tab === t ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}>
            {t === "diy" ? "DIY" : "Hire Pro"}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {tab === "diy" ? (
          <>
            <div className={`rounded-xl p-4 ${canDIY ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-200"}`}>
              {canDIY ? (
                <>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-500">Total DIY Cost</span>
                    <span className="text-xs font-semibold text-green-600">Save ${Math.round(issue.proCost - issue.diyCost)}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${issue.diyCost.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">vs ${issue.proCost} professional</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-600 mb-1">Professional Required</p>
                  <p className="text-xs text-gray-400">This requires a licensed professional.</p>
                </>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1.5"><IoConstructOutline className="w-3.5 h-3.5" />Difficulty</span>
                <span className={`font-medium ${canDIY ? "text-green-600" : "text-red-500"}`}>{issue.difficulty}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1.5"><IoSparkles className="w-3.5 h-3.5" />AI confidence</span>
                <span className="font-medium text-gray-700">{issue.confidence}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Guides</p>
              {[
                { source: "YouTube", title: `How to fix: ${issue.title}`, meta: "8:24 · 4.7" },
                { source: "iFixit", title: `${issue.category} repair guide`, meta: "12 steps · 4.9" },
              ].map((g) => (
                <div key={g.title} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer mb-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${g.source === "YouTube" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}>{g.source[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{g.title}</p>
                    <p className="text-[10px] text-gray-400">{g.source} · {g.meta}</p>
                  </div>
                </div>
              ))}
            </div>
            {canDIY && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs">
                <IoStorefrontOutline className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-700 font-medium">In stock at Home Depot</span>
                <span className="text-emerald-600 ml-auto">${issue.diyCost.toFixed(2)}</span>
              </div>
            )}
            <ResolutionSection />
          </>
        ) : (
          <>
            <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
              <span className="text-xs text-gray-500">Estimated professional cost</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">${issue.proCost}</p>
              <p className="text-xs text-gray-400 mt-1">Based on your region</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Rated contractors</p>
              {[
                { name: "Mike's Plumbing", rating: "4.8", reviews: "142 reviews", tag: "Licensed" },
                { name: "Bay Area Rooter", rating: "4.6", reviews: "89 reviews", tag: "Same-day" },
              ].map((c) => (
                <div key={c.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 mb-2">
                  <div>
                    <p className="text-xs font-medium text-gray-800">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.reviews}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">{c.tag}</span>
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-0.5"><IoStar className="w-3 h-3 inline text-amber-500" />{c.rating}</span>
                  </div>
                </div>
              ))}
              <button className="w-full text-xs font-medium text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors">
                Send quote request via Gmail
              </button>
            </div>
            <ResolutionSection />
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ProjectsView ─────────────────────────────────────────────────────────

// Diagnose-side issues (active, with live chat)
const diagnosisIssueIds = Object.keys(issuesData);

export function ProjectsView({ previewMode = false }: { previewMode?: boolean } = {}) {
  const dark = useDarkMode();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Issue["status"]>("all");

  const [selectedDiagnoseId, setSelectedDiagnoseId] = useState<string | null>("current");
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const mode: "diagnose" | "history" | "new" =
    isCreatingNew ? "new"
    : selectedDiagnoseId ? "diagnose"
    : "history";

  const currentDiagnoseIssue = selectedDiagnoseId ? (issuesData[selectedDiagnoseId] ?? null) : null;
  const currentHistoryIssue  = selectedHistoryId  ? (issuesHistoryData.find((i) => i.id === selectedHistoryId) ?? null) : null;

  const filtered = issuesHistoryData.filter((issue) => {
    const matchSearch = !search ||
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || issue.status === filter;
    return matchSearch && matchFilter;
  });

  const activeRows    = filtered.filter((i) => i.status !== "completed");
  const completedRows = filtered.filter((i) => i.status === "completed");

  const handleSelectHistory = useCallback((id: string) => {
    setSelectedHistoryId(id);
    setSelectedDiagnoseId(null);
    setIsCreatingNew(false);
  }, []);

  const handleSelectDiagnose = useCallback((id: string) => {
    setSelectedDiagnoseId(id);
    setSelectedHistoryId(null);
    setIsCreatingNew(false);
  }, []);

  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  const panelBg = dark ? "bg-[#1a1a1a]" : "bg-white";
  const labelCls = dark ? "text-gray-600" : "text-gray-400";

  return (
    <div className={`flex h-full overflow-hidden ${panelBg}`}>

      {/* ── Panel 1: Project list ── */}
      <div className={`w-72 flex-shrink-0 border-r flex flex-col h-full ${b}`}>
        {/* Search + filter */}
        <div className={`px-3 py-3 border-b ${b}`}>
          <div className="relative">
            <IoSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelCls}`} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg placeholder:text-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors border ${
                dark
                  ? "bg-white/[0.04] border-white/10 text-gray-200 focus:bg-white/[0.06] focus:ring-blue-500/20"
                  : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
              }`}
            />
          </div>
          <div className="flex gap-0.5 mt-2">
            {(["all", "investigating", "in_progress", "completed"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                  filter === s
                    ? "bg-blue-100 text-blue-600"
                    : dark ? "text-gray-600 hover:text-gray-400 hover:bg-white/[0.06]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}>
                {s === "all" ? "All" : s === "investigating" ? "Active" : s === "in_progress" ? "Working" : "Done"}
              </button>
            ))}
          </div>
          <div className={`flex items-center gap-1.5 mt-2 pt-2 border-t ${b}`}>
            <span className={`text-[10px] font-medium ${labelCls}`}>
              {issuesHistoryData.length + diagnosisIssueIds.length} issues
            </span>
            <span className={`select-none ${dark ? "text-white/20" : "text-gray-200"}`}>·</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium flex items-center gap-0.5">
              <IoCheckmarkCircleOutline className="w-2.5 h-2.5" />3 evidence
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-500 font-medium flex items-center gap-0.5">
              <IoSparkles className="w-2.5 h-2.5" />2 hypotheses
            </span>
          </div>
        </div>

        <div className="flex-1 scrollbar-auto-hide">
          {diagnosisIssueIds.length > 0 && (
            <>
              <div className="px-4 py-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${labelCls}`}>Live · {diagnosisIssueIds.length}</span>
              </div>
              {Object.entries(issuesData).map(([id, issue]) => {
                const Icon = issue.icon;
                const isSelected = selectedDiagnoseId === id && !isCreatingNew;
                return (
                  <button key={id} onClick={() => handleSelectDiagnose(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b text-left transition-colors group ${
                      dark
                        ? `border-white/[0.06] ${isSelected ? "bg-blue-600/10" : "hover:bg-white/[0.04]"}`
                        : `border-gray-100 ${isSelected ? "bg-blue-50" : "bg-white hover:bg-blue-50/40"}`
                    }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      issue.iconColor.includes("blue") ? "bg-blue-50" : "bg-amber-50"
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${issue.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${dark ? "text-gray-200" : "text-gray-900"}`}>{issue.title}</p>
                      <p className={`text-xs truncate mt-0.5 ${labelCls}`}>{issue.date} · {issue.status}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium flex-shrink-0">{issue.status}</span>
                  </button>
                );
              })}
            </>
          )}

          {activeRows.length > 0 && (
            <>
              <div className="px-4 py-2 flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${dark ? "bg-gray-600" : "bg-gray-300"}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${labelCls}`}>Recent · {activeRows.length}</span>
              </div>
              {activeRows.map((issue) => (
                <ProjectRow key={issue.id} issue={issue} selected={selectedHistoryId === issue.id} onClick={() => handleSelectHistory(issue.id)} />
              ))}
            </>
          )}

          {completedRows.length > 0 && (
            <>
              <div className="px-4 py-2 flex items-center gap-2 mt-1">
                <IoCheckmarkCircle className={`w-3 h-3 ${dark ? "text-gray-600" : "text-gray-300"}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${labelCls}`}>Resolved · {completedRows.length}</span>
              </div>
              {completedRows.map((issue) => (
                <ProjectRow key={issue.id} issue={issue} selected={selectedHistoryId === issue.id} onClick={() => handleSelectHistory(issue.id)} />
              ))}
            </>
          )}
        </div>

        <div className={`p-3 border-t ${b}`}>
          <button
            onClick={() => { setIsCreatingNew(true); setSelectedDiagnoseId(null); setSelectedHistoryId(null); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <IoAdd className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* ── Panel 2 + 3 ── */}
      {mode === "diagnose" && (
        <DemoFlowProvider issue={currentDiagnoseIssue} skipToComplete={previewMode}>
          <div className={`hidden lg:flex flex-1 min-w-0 border-r h-full overflow-hidden ${b}`}>
            <ChatArea issue={currentDiagnoseIssue} isCreatingNewIssue={false} />
          </div>
          <div className="w-[260px] flex-shrink-0 h-full overflow-hidden">
            <ResourcePanel issue={currentDiagnoseIssue} isCreatingNewIssue={false} />
          </div>
        </DemoFlowProvider>
      )}

      {mode === "history" && currentHistoryIssue && (
        <>
          <div className={`flex-1 min-w-0 border-r h-full overflow-hidden ${b}`}>
            <ProjectDetail issue={currentHistoryIssue} />
          </div>
          <div className="w-[260px] flex-shrink-0 h-full overflow-hidden">
            <ProjectResources issue={currentHistoryIssue} />
          </div>
        </>
      )}

      {mode === "new" && (
        <div className="flex-1 h-full flex items-center justify-center text-center px-12">
          <div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <IoAdd className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className={`text-base font-semibold mb-2 ${dark ? "text-gray-200" : "text-gray-900"}`}>Start a new project</h3>
            <p className={`text-sm leading-relaxed max-w-xs mx-auto ${dark ? "text-gray-600" : "text-gray-400"}`}>
              Describe what you&apos;re fixing, building, or figuring out — in any language.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
