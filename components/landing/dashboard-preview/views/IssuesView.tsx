"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  IoAddOutline,
  IoClose,
  IoCamera,
  IoMic,
  IoVideocam,
  IoCloudUpload,
  IoChevronForward,
  IoChevronDown,
  IoSearchOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoTime,
  IoSwapVertical,
  IoWater,
  IoSnow,
  IoFlash,
  IoHome,
  IoConstruct,
  IoTrendingUp,
  IoWallet,
  IoSparkles,
  IoCalendarOutline,
  IoFilterOutline,
  IoGridOutline,
  IoListOutline,
  IoArrowForward,
  IoLocationSharp,
  IoOpenOutline,
  IoEaselOutline,
} from "react-icons/io5";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Enhanced issue data with more detail for history view
const issuesHistoryData = [
  {
    id: "1",
    title: "Leaky kitchen faucet",
    icon: IoWater,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/20",
    status: "investigating",
    priority: "medium",
    category: "Plumbing",
    group: "My Apartment",
    createdAt: "2 days ago",
    updatedAt: "Just now",
    diagnosis: "Worn O-ring or cartridge seal",
    confidence: 92,
    difficulty: "Easy",
    diyCost: 33.48,
    proCost: 185,
    resolvedBy: null,
    assignee: { name: "Alex Chen", avatar: "👨" },
  },
  {
    id: "2",
    title: "AC not cooling properly",
    icon: IoSnow,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/20",
    status: "in_progress",
    priority: "high",
    category: "HVAC",
    group: "My Apartment",
    createdAt: "1 week ago",
    updatedAt: "2 days ago",
    diagnosis: "Low refrigerant levels - requires professional",
    confidence: 88,
    difficulty: "Professional Required",
    diyCost: 0,
    proCost: 350,
    resolvedBy: null,
    assignee: { name: "Jamie Lee", avatar: "👩" },
  },
  {
    id: "3",
    title: "Garage door squeaking",
    icon: IoHome,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/20",
    status: "open",
    priority: "low",
    category: "Garage",
    group: "Parents' House",
    createdAt: "3 days ago",
    updatedAt: "3 days ago",
    diagnosis: "Dry rollers and hinges",
    confidence: 95,
    difficulty: "Easy",
    diyCost: 12.98,
    proCost: 95,
    resolvedBy: null,
    assignee: { name: "Dad", avatar: "👴" },
  },
  {
    id: "4",
    title: "Flickering lights in living room",
    icon: IoFlash,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/20",
    status: "completed",
    priority: "high",
    category: "Electrical",
    group: "My Apartment",
    createdAt: "2 weeks ago",
    updatedAt: "1 week ago",
    resolvedAt: "1 week ago",
    diagnosis: "Loose wire connection at junction box",
    confidence: 78,
    difficulty: "Professional Required",
    diyCost: 0,
    proCost: 125,
    resolvedBy: "pro",
    savedAmount: 0,
    assignee: { name: "Alex Chen", avatar: "👨" },
    proUsed: "Spark Electric",
  },
  {
    id: "5",
    title: "Water heater maintenance",
    icon: IoWater,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/20",
    status: "completed",
    priority: "medium",
    category: "Plumbing",
    group: "My Apartment",
    createdAt: "3 weeks ago",
    updatedAt: "2 weeks ago",
    resolvedAt: "2 weeks ago",
    diagnosis: "Sediment buildup requiring flush",
    confidence: 96,
    difficulty: "Easy",
    diyCost: 0,
    proCost: 225,
    resolvedBy: "diy",
    savedAmount: 225,
    assignee: { name: "Alex Chen", avatar: "👨" },
  },
  {
    id: "6",
    title: "Clogged bathroom drain",
    icon: IoWater,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/20",
    status: "completed",
    priority: "medium",
    category: "Plumbing",
    group: "My Apartment",
    createdAt: "1 month ago",
    updatedAt: "1 month ago",
    resolvedAt: "3 weeks ago",
    diagnosis: "Hair and soap buildup in P-trap",
    confidence: 94,
    difficulty: "Easy",
    diyCost: 12,
    proCost: 150,
    resolvedBy: "diy",
    savedAmount: 138,
    assignee: { name: "Jamie Lee", avatar: "👩" },
  },
  {
    id: "7",
    title: "Broken window lock",
    icon: IoHome,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/20",
    status: "open",
    priority: "high",
    category: "Security",
    group: "Parents' House",
    createdAt: "1 day ago",
    updatedAt: "1 day ago",
    diagnosis: "Latch mechanism worn - replacement needed",
    confidence: 89,
    difficulty: "Easy",
    diyCost: 18,
    proCost: 85,
    resolvedBy: null,
    assignee: { name: "Dad", avatar: "👴" },
  },
  {
    id: "8",
    title: "Dishwasher not draining",
    icon: IoConstruct,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/20",
    status: "completed",
    priority: "medium",
    category: "Appliances",
    group: "My Apartment",
    createdAt: "2 months ago",
    updatedAt: "6 weeks ago",
    resolvedAt: "6 weeks ago",
    diagnosis: "Clogged filter and drain hose kink",
    confidence: 91,
    difficulty: "Easy",
    diyCost: 0,
    proCost: 175,
    resolvedBy: "diy",
    savedAmount: 175,
    assignee: { name: "Alex Chen", avatar: "👨" },
  },
];

// Chart data
const categoryData = [
  { name: "Plumbing", value: 4, color: "#3ECF8E" },
  { name: "HVAC", value: 1, color: "#3ECF8E" },
  { name: "Electrical", value: 1, color: "#f59e0b" },
  { name: "Appliances", value: 1, color: "#8b5cf6" },
  { name: "Security", value: 1, color: "#ef4444" },
];

const savingsOverTimeData = [
  { month: "Aug", savings: 0, issues: 1 },
  { month: "Sep", savings: 175, issues: 2 },
  { month: "Oct", savings: 313, issues: 1 },
  { month: "Nov", savings: 451, issues: 2 },
  { month: "Dec", savings: 538, issues: 1 },
  { month: "Jan", savings: 538, issues: 1 },
];

const resolutionData = [
  { name: "DIY", value: 3, color: "#3ECF8E" },
  { name: "Professional", value: 1, color: "#8b5cf6" },
];

const statusConfig = {
  open: { label: "Open", color: "bg-emerald-500/20 text-emerald-400", dotColor: "bg-emerald-500" },
  investigating: { label: "Investigating", color: "bg-amber-500/20 text-amber-400", dotColor: "bg-amber-500" },
  in_progress: { label: "In Progress", color: "bg-emerald-500/20 text-emerald-400", dotColor: "bg-emerald-500" },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-400", dotColor: "bg-emerald-500" },
};

const priorityConfig = {
  low: { label: "Low", color: "text-[#666]" },
  medium: { label: "Medium", color: "text-amber-400" },
  high: { label: "High", color: "text-red-400" },
};

const INPUT_METHODS = [
  { id: "photo" as const, icon: IoCamera, label: "Take a Photo", description: "Snap a picture of the issue" },
  { id: "voice" as const, icon: IoMic, label: "Voice Note", description: "Describe the problem verbally" },
  { id: "video" as const, icon: IoVideocam, label: "Record Video", description: "Show the issue in motion" },
  { id: "upload" as const, icon: IoCloudUpload, label: "Upload File", description: "Add existing photos or videos" },
];

interface IssuesViewProps {
  onNavigateToIssue?: (issueId: string) => void;
}

export function IssuesView({ onNavigateToIssue }: IssuesViewProps) {
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "priority">("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "kanban">("cards");
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: null as string | null,
    priority: null as string | null,
    category: null as string | null,
    group: null as string | null,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Filter issues
  let filteredIssues = issuesHistoryData.filter((issue) => {
    if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !issue.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.priority && issue.priority !== filters.priority) return false;
    if (filters.category && issue.category !== filters.category) return false;
    if (filters.group && issue.group !== filters.group) return false;
    return true;
  });

  // Sort issues
  filteredIssues = [...filteredIssues].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      comparison = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
                   (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const activeIssues = filteredIssues.filter((i) => i.status !== "completed");
  const completedIssues = filteredIssues.filter((i) => i.status === "completed");

  const allCategories = Array.from(new Set(issuesHistoryData.map((i) => i.category)));
  const allGroups = Array.from(new Set(issuesHistoryData.map((i) => i.group)));

  const hasActiveFilters = Object.values(filters).some((v) => v !== null);

  // Stats
  const totalSavings = completedIssues.reduce((sum, i) => sum + (i.savedAmount || 0), 0);
  const diyCount = completedIssues.filter((i) => i.resolvedBy === "diy").length;
  const proCount = completedIssues.filter((i) => i.resolvedBy === "pro").length;

  const handleIssueClick = (issueId: string) => {
    if (onNavigateToIssue) {
      onNavigateToIssue(issueId);
    }
  };

  // New Issue Modal
  const NewIssueModal = showNewIssueModal ? (
    <div
      className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setShowNewIssueModal(false); }}
    >
      <div className="bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#2a2a2a]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white">Report New Issue</h3>
          <button onClick={() => setShowNewIssueModal(false)} className="p-1 hover:bg-[#333] rounded-lg transition-colors">
            <IoClose className="w-5 h-5 text-[#666]" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#888] mb-4">Choose how you'd like to report the issue:</p>
          <div className="grid grid-cols-2 gap-3">
            {INPUT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setShowNewIssueModal(false)}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-[#2a2a2a] hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white mb-1">{method.label}</p>
                    <p className="text-xs text-[#666]">{method.description}</p>
                  </div>
                  <IoChevronForward className="w-4 h-4 text-[#555] group-hover:text-emerald-400 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {mounted && typeof window !== "undefined" && showNewIssueModal && createPortal(NewIssueModal, document.body)}

      {openFilterDropdown && (
        <div className="fixed inset-0 z-[9998]" onClick={() => setOpenFilterDropdown(null)} />
      )}

      <div className="min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#1f1f1f]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-white">Issue History</h1>
              <p className="text-sm text-[#666] mt-0.5">
                {filteredIssues.length} issues · {activeIssues.length} active · {completedIssues.length} resolved
              </p>
            </div>
            <button
              onClick={() => setShowNewIssueModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors font-medium"
            >
              <IoAddOutline className="w-5 h-5" />
              Report Issue
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <IoWallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">${totalSavings}</p>
                  <p className="text-xs text-[#666]">Total Saved</p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <IoConstruct className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{diyCount}</p>
                  <p className="text-xs text-[#666]">DIY Repairs</p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <IoLocationSharp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{proCount}</p>
                  <p className="text-xs text-[#666]">Pro Repairs</p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <IoTrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activeIssues.length}</p>
                  <p className="text-xs text-[#666]">Active Issues</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {/* Savings Over Time */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1">Savings Over Time</h3>
              <p className="text-xs text-[#666] mb-3">Cumulative savings from DIY repairs</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={savingsOverTimeData}>
                    <defs>
                      <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3ECF8E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3ECF8E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 10 }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#888' }}
                      formatter={(value: number) => [`$${value}`, 'Saved']}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#3ECF8E"
                      strokeWidth={2}
                      fill="url(#savingsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Issues by Category */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1">By Category</h3>
              <p className="text-xs text-[#666] mb-3">Issue distribution</p>
              <div className="flex items-center gap-4">
                <div className="h-32 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {categoryData.slice(0, 4).map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[#888]">{cat.name}</span>
                      </div>
                      <span className="text-white font-medium">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resolution Breakdown */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white mb-1">How Issues Were Resolved</h3>
              <p className="text-xs text-[#666] mb-3">DIY vs Professional</p>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resolutionData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888', fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [value, 'Issues']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {resolutionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2a2a2a]">
                <span className="text-xs text-[#666]">DIY Success Rate</span>
                <span className="text-sm font-semibold text-emerald-400">75%</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
              <input
                type="text"
                placeholder="Search issues, diagnoses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#2a2a2a] rounded-xl bg-[#1a1a1a] text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => setOpenFilterDropdown(openFilterDropdown === "status" ? null : "status")}
                  className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border rounded-xl transition-colors ${
                    filters.status ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:border-[#333]"
                  }`}
                >
                  {filters.status ? statusConfig[filters.status as keyof typeof statusConfig]?.label : "Status"}
                  <IoChevronDown className="w-3 h-3 opacity-50" />
                </button>
                {openFilterDropdown === "status" && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                    <button onClick={() => { setFilters({ ...filters, status: null }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${!filters.status ? "text-emerald-400" : "text-[#888]"}`}>
                      All Status
                    </button>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <button key={key} onClick={() => { setFilters({ ...filters, status: key }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${filters.status === key ? "text-emerald-400" : "text-[#888]"}`}>
                        {config.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Group Filter */}
              <div className="relative">
                <button
                  onClick={() => setOpenFilterDropdown(openFilterDropdown === "group" ? null : "group")}
                  className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border rounded-xl transition-colors ${
                    filters.group ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:border-[#333]"
                  }`}
                >
                  {filters.group || "All Groups"}
                  <IoChevronDown className="w-3 h-3 opacity-50" />
                </button>
                {openFilterDropdown === "group" && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                    <button onClick={() => { setFilters({ ...filters, group: null }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${!filters.group ? "text-emerald-400" : "text-[#888]"}`}>
                      All Groups
                    </button>
                    {allGroups.map((grp) => (
                      <button key={grp} onClick={() => { setFilters({ ...filters, group: grp }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${filters.group === grp ? "text-emerald-400" : "text-[#888]"}`}>
                        {grp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() => setOpenFilterDropdown(openFilterDropdown === "category" ? null : "category")}
                  className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border rounded-xl transition-colors ${
                    filters.category ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-[#1a1a1a] border-[#2a2a2a] text-[#888] hover:border-[#333]"
                  }`}
                >
                  {filters.category || "Category"}
                  <IoChevronDown className="w-3 h-3 opacity-50" />
                </button>
                {openFilterDropdown === "category" && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] shadow-lg py-1 z-[9999]">
                    <button onClick={() => { setFilters({ ...filters, category: null }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${!filters.category ? "text-emerald-400" : "text-[#888]"}`}>
                      All Categories
                    </button>
                    {allCategories.map((cat) => (
                      <button key={cat} onClick={() => { setFilters({ ...filters, category: cat }); setOpenFilterDropdown(null); }} className={`w-full text-left px-3 py-2 text-xs hover:bg-[#252525] ${filters.category === cat ? "text-emerald-400" : "text-[#888]"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={() => setFilters({ status: null, priority: null, category: null, group: null })}
                  className="flex items-center gap-1 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <IoClose className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}

              <div className="h-6 w-px bg-[#2a2a2a] mx-1" />

              {/* View Toggle */}
              <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "cards" ? "bg-[#2a2a2a] text-white" : "text-[#666] hover:text-white"}`}
                  title="Cards"
                >
                  <IoGridOutline className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#2a2a2a] text-white" : "text-[#666] hover:text-white"}`}
                  title="List"
                >
                  <IoListOutline className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "kanban" ? "bg-[#2a2a2a] text-white" : "text-[#666] hover:text-white"}`}
                  title="Kanban"
                >
                  <IoEaselOutline className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Toggle */}
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] rounded-xl hover:border-[#333] transition-colors"
              >
                <IoSwapVertical className="w-3.5 h-3.5" />
                {sortOrder === "asc" ? "Oldest" : "Newest"}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Kanban View */}
          {viewMode === "kanban" && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {/* Open Column */}
              <div className="flex-shrink-0 w-80">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-white">Open</h3>
                  <span className="text-xs text-[#666] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                    {filteredIssues.filter(i => i.status === "open").length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredIssues.filter(i => i.status === "open").map((issue) => {
                    const Icon = issue.icon;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue.id)}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-lg ${issue.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${issue.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-2">{issue.title}</p>
                            <p className="text-xs text-[#666] mt-0.5">{issue.group}</p>
                          </div>
                        </div>
                        <p className="text-xs text-[#888] line-clamp-2 mb-3">{issue.diagnosis}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${priorityConfig[issue.priority as keyof typeof priorityConfig].color}`}>
                            {priorityConfig[issue.priority as keyof typeof priorityConfig].label} priority
                          </span>
                          <span className="text-base">{issue.assignee.avatar}</span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredIssues.filter(i => i.status === "open").length === 0 && (
                    <div className="bg-[#1a1a1a]/50 border border-dashed border-[#2a2a2a] rounded-xl p-6 text-center">
                      <p className="text-xs text-[#555]">No open issues</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Investigating Column */}
              <div className="flex-shrink-0 w-80">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-semibold text-white">Investigating</h3>
                  <span className="text-xs text-[#666] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                    {filteredIssues.filter(i => i.status === "investigating").length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredIssues.filter(i => i.status === "investigating").map((issue) => {
                    const Icon = issue.icon;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue.id)}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-amber-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-lg ${issue.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${issue.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-2">{issue.title}</p>
                            <p className="text-xs text-[#666] mt-0.5">{issue.group}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3 p-2 bg-amber-500/10 rounded-lg">
                          <IoSparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs text-amber-400">{issue.confidence}% confident</span>
                        </div>
                        <p className="text-xs text-[#888] line-clamp-2 mb-3">{issue.diagnosis}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${priorityConfig[issue.priority as keyof typeof priorityConfig].color}`}>
                            {priorityConfig[issue.priority as keyof typeof priorityConfig].label} priority
                          </span>
                          <span className="text-base">{issue.assignee.avatar}</span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredIssues.filter(i => i.status === "investigating").length === 0 && (
                    <div className="bg-[#1a1a1a]/50 border border-dashed border-[#2a2a2a] rounded-xl p-6 text-center">
                      <p className="text-xs text-[#555]">No issues investigating</p>
                    </div>
                  )}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="flex-shrink-0 w-80">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-white">In Progress</h3>
                  <span className="text-xs text-[#666] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                    {filteredIssues.filter(i => i.status === "in_progress").length}
                  </span>
                </div>
                <div className="space-y-3">
                  {filteredIssues.filter(i => i.status === "in_progress").map((issue) => {
                    const Icon = issue.icon;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue.id)}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-lg ${issue.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-4 h-4 ${issue.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-2">{issue.title}</p>
                            <p className="text-xs text-[#666] mt-0.5">{issue.group}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3 p-2 bg-emerald-500/10 rounded-lg">
                          <IoConstruct className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-xs text-emerald-400">{issue.difficulty}</span>
                        </div>
                        <p className="text-xs text-[#888] line-clamp-2 mb-3">{issue.diagnosis}</p>
                        <div className="flex items-center justify-between">
                          {issue.diyCost > 0 ? (
                            <span className="text-xs text-emerald-400 font-medium">
                              Save ${(issue.proCost - issue.diyCost).toFixed(0)}
                            </span>
                          ) : (
                            <span className="text-xs text-[#666]">${issue.proCost} est.</span>
                          )}
                          <span className="text-base">{issue.assignee.avatar}</span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredIssues.filter(i => i.status === "in_progress").length === 0 && (
                    <div className="bg-[#1a1a1a]/50 border border-dashed border-[#2a2a2a] rounded-xl p-6 text-center">
                      <p className="text-xs text-[#555]">No issues in progress</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div className="flex-shrink-0 w-80">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-semibold text-white">Completed</h3>
                  <span className="text-xs text-[#666] bg-[#2a2a2a] px-2 py-0.5 rounded-full">
                    {filteredIssues.filter(i => i.status === "completed").length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
                  {filteredIssues.filter(i => i.status === "completed").map((issue) => {
                    const Icon = issue.icon;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue.id)}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer group opacity-75 hover:opacity-100"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#ccc] group-hover:text-white transition-colors line-clamp-2">{issue.title}</p>
                            <p className="text-xs text-[#666] mt-0.5">{issue.group}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded-lg mb-3">
                          <span className="text-xs text-[#888]">
                            {issue.resolvedBy === "diy" ? "DIY" : issue.proUsed || "Pro"}
                          </span>
                          {issue.savedAmount && issue.savedAmount > 0 && (
                            <span className="text-sm font-semibold text-emerald-400">+${issue.savedAmount}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#555]">{issue.resolvedAt}</span>
                          <span className="text-base">{issue.assignee.avatar}</span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredIssues.filter(i => i.status === "completed").length === 0 && (
                    <div className="bg-[#1a1a1a]/50 border border-dashed border-[#2a2a2a] rounded-xl p-6 text-center">
                      <p className="text-xs text-[#555]">No completed issues</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Issues (Cards/List view) */}
          {viewMode !== "kanban" && activeIssues.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Issues ({activeIssues.length})
              </h2>

              {viewMode === "cards" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {activeIssues.map((issue) => {
                    const Icon = issue.icon;
                    const status = statusConfig[issue.status as keyof typeof statusConfig];
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue.id)}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-emerald-500/30 hover:bg-[#1f1f1f] transition-all cursor-pointer group"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${issue.iconBg} flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 ${issue.iconColor}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{issue.title}</p>
                              <p className="text-xs text-[#666]">{issue.group} · {issue.category}</p>
                            </div>
                          </div>
                          <IoArrowForward className="w-4 h-4 text-[#444] group-hover:text-emerald-400 transition-colors" />
                        </div>

                        {/* Diagnosis */}
                        <div className="mb-3 p-3 bg-[#0f0f0f] rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <IoSparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-emerald-400 font-medium">AI Diagnosis</span>
                            <span className="text-xs text-[#555]">· {issue.confidence}%</span>
                          </div>
                          <p className="text-xs text-[#999] line-clamp-2">{issue.diagnosis}</p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${status.color}`}>{status.label}</span>
                            <span className={`text-xs ${priorityConfig[issue.priority as keyof typeof priorityConfig].color}`}>
                              {priorityConfig[issue.priority as keyof typeof priorityConfig].label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {issue.diyCost > 0 && (
                              <span className="text-xs text-emerald-400 font-medium">
                                Save ${(issue.proCost - issue.diyCost).toFixed(0)}
                              </span>
                            )}
                            <span className="text-xs text-[#555]">{issue.updatedAt}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
                  {activeIssues.map((issue, idx) => {
                    const Icon = issue.icon;
                    const status = statusConfig[issue.status as keyof typeof statusConfig];
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue.id)}
                        className={`flex items-center gap-4 p-4 hover:bg-[#1f1f1f] transition-colors cursor-pointer ${
                          idx !== activeIssues.length - 1 ? "border-b border-[#2a2a2a]" : ""
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl ${issue.iconBg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${issue.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{issue.title}</p>
                          <p className="text-xs text-[#666] truncate">{issue.diagnosis}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${status.color} flex-shrink-0`}>{status.label}</span>
                        <span className="text-xs text-[#555] flex-shrink-0 w-20 text-right">{issue.updatedAt}</span>
                        <IoChevronForward className="w-4 h-4 text-[#444] flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Completed Issues (Cards/List view) */}
          {viewMode !== "kanban" && completedIssues.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#888] mb-4 flex items-center gap-2">
                <IoCheckmarkCircle className="w-4 h-4 text-emerald-400" />
                Resolved ({completedIssues.length})
              </h2>

              {viewMode === "cards" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {completedIssues.map((issue) => {
                    const Icon = issue.icon;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue.id)}
                        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer group opacity-80 hover:opacity-100"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                              <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#ccc] group-hover:text-white transition-colors">{issue.title}</p>
                              <p className="text-xs text-[#666]">{issue.group} · {issue.category}</p>
                            </div>
                          </div>
                          <IoOpenOutline className="w-4 h-4 text-[#444] group-hover:text-emerald-400 transition-colors" />
                        </div>

                        {/* Resolution Info */}
                        <div className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg">
                          <div>
                            <p className="text-xs text-[#666] mb-0.5">Resolved by</p>
                            <p className="text-sm font-medium text-white">
                              {issue.resolvedBy === "diy" ? "DIY" : issue.proUsed || "Professional"}
                            </p>
                          </div>
                          {issue.savedAmount && issue.savedAmount > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-[#666] mb-0.5">Saved</p>
                              <p className="text-lg font-bold text-emerald-400">${issue.savedAmount}</p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2a2a2a]">
                          <div className="flex items-center gap-2 text-xs text-[#555]">
                            <IoCalendarOutline className="w-3.5 h-3.5" />
                            Resolved {issue.resolvedAt}
                          </div>
                          <span className="text-base">{issue.assignee.avatar}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden opacity-80">
                  {completedIssues.map((issue, idx) => {
                    const Icon = issue.icon;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleIssueClick(issue.id)}
                        className={`flex items-center gap-4 p-4 hover:bg-[#1f1f1f] hover:opacity-100 transition-all cursor-pointer ${
                          idx !== completedIssues.length - 1 ? "border-b border-[#2a2a2a]" : ""
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <IoCheckmarkCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#ccc] truncate">{issue.title}</p>
                          <p className="text-xs text-[#666]">
                            {issue.resolvedBy === "diy" ? "DIY" : issue.proUsed || "Professional"} · {issue.resolvedAt}
                          </p>
                        </div>
                        {issue.savedAmount && issue.savedAmount > 0 && (
                          <span className="text-sm font-semibold text-emerald-400 flex-shrink-0">+${issue.savedAmount}</span>
                        )}
                        <span className="text-xs text-[#555] flex-shrink-0 w-24 text-right">{issue.group}</span>
                        <IoChevronForward className="w-4 h-4 text-[#444] flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {viewMode !== "kanban" && filteredIssues.length === 0 && (
            <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
                <IoSearchOutline className="w-8 h-8 text-[#555]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">No issues found</h3>
              <p className="text-xs text-[#666] mb-4">
                {searchQuery || hasActiveFilters ? "Try adjusting your search or filters" : "Report an issue to get started"}
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={() => setShowNewIssueModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  Report New Issue
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
