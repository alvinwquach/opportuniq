"use client";

import { useState } from "react";
import {
  IoSearch,
  IoAdd,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoAlertCircleOutline,
  IoConstructOutline,
  IoSparkles,
  IoChevronForward,
  IoShieldCheckmarkOutline,
  IoPersonOutline,
  IoStorefrontOutline,
  IoStar,
} from "react-icons/io5";
import { issuesHistoryData } from "./issues";
import type { Issue } from "./issues/types";

// ── helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<Issue["status"], { label: string; bg: string; text: string; dot: string }> = {
  open:          { label: "Open",          bg: "bg-blue-50",   text: "text-blue-600",  dot: "bg-blue-400"  },
  investigating: { label: "Investigating", bg: "bg-amber-50",  text: "text-amber-600", dot: "bg-amber-400" },
  in_progress:   { label: "In Progress",   bg: "bg-purple-50", text: "text-purple-600",dot: "bg-purple-400"},
  completed:     { label: "Resolved",      bg: "bg-gray-100",  text: "text-gray-500",  dot: "bg-gray-400"  },
};

const priorityDot: Record<Issue["priority"], string> = {
  high:   "bg-red-400",
  medium: "bg-amber-400",
  low:    "bg-blue-300",
};

// ── Left panel: Gmail-style row list ─────────────────────────────────────────

function IssueRow({
  issue,
  selected,
  onClick,
}: {
  issue: Issue;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = issue.icon;
  const st = statusConfig[issue.status];
  const isResolved = issue.status === "completed";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left transition-colors group ${
        selected ? "bg-blue-50" : isResolved ? "bg-white hover:bg-gray-50" : "bg-white hover:bg-blue-50/40"
      }`}
    >
      {/* Priority dot */}
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[issue.priority]}`} />

      {/* Icon */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${issue.iconBg}`}>
        <Icon className={`w-3.5 h-3.5 ${issue.iconColor}`} />
      </div>

      {/* Title + preview */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isResolved ? "text-gray-400 font-normal" : "text-gray-900 font-medium"}`}>
          {issue.title}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {issue.group} · {issue.category} · {issue.diagnosis}
        </p>
      </div>

      {/* Right meta */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-gray-400">{issue.updatedAt}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${st.bg} ${st.text}`}>
          {st.label}
        </span>
      </div>

      {isResolved ? (
        <IoCheckmarkCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
      ) : (
        <IoChevronForward className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

// ── Center panel: issue detail ────────────────────────────────────────────────

function IssueDetail({ issue }: { issue: Issue }) {
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
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${st.bg} ${st.text}`}>
            {st.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <IoTimeOutline className="w-3.5 h-3.5" />
            {issue.createdAt}
          </span>
          <span className="flex items-center gap-1">
            <IoAlertCircleOutline className="w-3.5 h-3.5" />
            {issue.priority} priority
          </span>
          <span className="flex items-center gap-1">
            <IoPersonOutline className="w-3.5 h-3.5" />
            {issue.assignee.name}
          </span>
        </div>
      </div>

      {/* AI Diagnosis */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
            <span className="text-[7px] text-white font-bold">AI</span>
          </div>
          <span className="text-xs font-semibold text-gray-700">OpportunIQ Diagnosis</span>
          <span className="text-[10px] text-gray-400">· {issue.confidence}% confident</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed mb-3">{issue.diagnosis}</p>

        {/* Difficulty + safety */}
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-md font-medium ${
            issue.difficulty === "Professional Required"
              ? "bg-red-50 text-red-600"
              : issue.difficulty === "Easy"
              ? "bg-green-50 text-green-700"
              : "bg-amber-50 text-amber-700"
          }`}>
            {issue.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <IoShieldCheckmarkOutline className="w-3.5 h-3.5" />
            Safety check passed
          </span>
        </div>
      </div>

      {/* Conversation thread stub */}
      <div className="px-6 py-4 space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Conversation</p>

        {/* User message */}
        <div className="flex justify-end">
          <div className="bg-blue-600 text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
            {issue.title}
          </div>
        </div>

        {/* AI response */}
        <div className="flex gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-[7px] text-white font-bold">AI</span>
          </div>
          <div className="bg-gray-100 text-gray-800 text-sm rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] leading-relaxed">
            {issue.diagnosis}. Confidence: {issue.confidence}%.
          </div>
        </div>

        {/* Follow-up chips */}
        <div className="flex gap-2 flex-wrap pt-1">
          {["What tools do I need?", "How long will this take?", "Is it safe to DIY?"].map((q) => (
            <button key={q} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Right panel: cost + actions ───────────────────────────────────────────────

function IssueResources({ issue }: { issue: Issue }) {
  const [tab, setTab] = useState<"diy" | "pro">("diy");
  const canDIY = issue.difficulty !== "Professional Required";

  return (
    <div className="flex flex-col h-full scrollbar-auto-hide">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        {(["diy", "pro"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-colors border-b-2 ${
              tab === t
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t === "diy" ? "DIY" : "Hire Pro"}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {tab === "diy" ? (
          <>
            {/* Cost card */}
            <div className={`rounded-xl p-4 ${canDIY ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-200"}`}>
              {canDIY ? (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Total DIY Cost</span>
                    <span className="text-xs font-semibold text-green-600">
                      Save ${Math.round(issue.proCost - issue.diyCost)}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${issue.diyCost.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">vs ${issue.proCost} professional</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-600 mb-1">Professional Required</p>
                  <p className="text-xs text-gray-400">This issue requires a licensed professional for safety reasons.</p>
                </>
              )}
            </div>

            {/* Difficulty + tools */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <IoConstructOutline className="w-3.5 h-3.5" />
                  Difficulty
                </span>
                <span className={`font-medium ${canDIY ? "text-green-600" : "text-red-500"}`}>
                  {issue.difficulty}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <IoSparkles className="w-3.5 h-3.5" />
                  AI confidence
                </span>
                <span className="font-medium text-gray-700">{issue.confidence}%</span>
              </div>
            </div>

            {/* Guides */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Step-by-step guides</p>
              <div className="space-y-2">
                {[
                  { source: "YouTube", title: `How to fix: ${issue.title}`, time: "8:24", rating: "4.7" },
                  { source: "iFixit",  title: `${issue.category} repair guide`, time: "12 steps", rating: "4.9" },
                ].map((g) => (
                  <div key={g.title} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      g.source === "YouTube" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"
                    }`}>
                      {g.source[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{g.title}</p>
                      <p className="text-[10px] text-gray-400">{g.source} · {g.time} · {g.rating}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parts availability */}
            {canDIY && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Parts at Home Depot</p>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs">
                  <IoStorefrontOutline className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="text-emerald-700 font-medium">In stock near you</span>
                  <span className="text-emerald-600 ml-auto">${issue.diyCost.toFixed(2)}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Pro cost */}
            <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
              <span className="text-xs text-gray-500">Estimated professional cost</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">${issue.proCost}</p>
              <p className="text-xs text-gray-400 mt-1">Based on your region</p>
            </div>

            {/* Contractor stubs */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Rated contractors</p>
              <div className="space-y-2">
                {[
                  { name: "Mike's Plumbing", rating: "4.8", reviews: "142 reviews", tag: "Licensed" },
                  { name: "Bay Area Rooter",  rating: "4.6", reviews: "89 reviews",  tag: "Same-day" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-800">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.reviews}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium border border-blue-100">{c.tag}</span>
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-0.5"><IoStar className="w-3 h-3 inline text-amber-500" />{c.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-2 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors">
                Send quote request via Gmail
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main IssuesView: 3-panel ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function IssuesView(_props?: { onNavigateToIssue?: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string>(issuesHistoryData[0].id);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Issue["status"]>("all");

  const filtered = issuesHistoryData.filter((issue) => {
    const matchSearch = !search ||
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.diagnosis.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || issue.status === filter;
    return matchSearch && matchFilter;
  });

  const active    = filtered.filter((i) => i.status !== "completed");
  const resolved  = filtered.filter((i) => i.status === "completed");
  const selected  = issuesHistoryData.find((i) => i.id === selectedId) ?? issuesHistoryData[0];

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* ── Panel 1: Issue list (Gmail inbox) ── */}
      <div className="w-72 flex-shrink-0 border-r border-gray-100 flex flex-col h-full">
        {/* Search */}
        <div className="px-3 py-3 border-b border-gray-100">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-0.5 mt-2">
            {(["all", "investigating", "in_progress", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                  filter === s ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s === "all" ? "All" : s === "investigating" ? "Active" : s === "in_progress" ? "In Progress" : "Done"}
              </button>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="flex-1 scrollbar-auto-hide">
          {active.length > 0 && (
            <>
              <div className="px-4 py-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Active · {active.length}
                </span>
              </div>
              {active.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  selected={selectedId === issue.id}
                  onClick={() => setSelectedId(issue.id)}
                />
              ))}
            </>
          )}

          {resolved.length > 0 && (
            <>
              <div className="px-4 py-2 flex items-center gap-2 mt-1">
                <IoCheckmarkCircle className="w-3 h-3 text-gray-300" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Resolved · {resolved.length}
                </span>
              </div>
              {resolved.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  selected={selectedId === issue.id}
                  onClick={() => setSelectedId(issue.id)}
                />
              ))}
            </>
          )}
        </div>

        {/* New issue button */}
        <div className="p-3 border-t border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
            <IoAdd className="w-4 h-4" />
            Report New Issue
          </button>
        </div>
      </div>

      {/* ── Panel 2: Issue detail (email reader) ── */}
      <div className="flex-1 min-w-0 border-r border-gray-100 h-full overflow-hidden">
        <IssueDetail issue={selected} />
      </div>

      {/* ── Panel 3: Resources (DIY / Hire Pro) ── */}
      <div className="w-72 flex-shrink-0 h-full overflow-hidden">
        <IssueResources issue={selected} />
      </div>
    </div>
  );
}
