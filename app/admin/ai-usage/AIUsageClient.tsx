"use client";

import { useState } from "react";
import {
  IoSparkles,
  IoTime,
  IoCash,
  IoChatbubble,
  IoHammer,
  IoChevronDown,
  IoChevronUp,
  IoImage,
  IoMic,
  IoVolumeHigh,
  IoCloud,
} from "react-icons/io5";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface Stats {
  totalConversations: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  totalMessages: number;
  avgLatency: number;
  totalImages: number;
  totalVoiceInputs: number;
  totalPhotoInputs: number;
}

interface Conversation {
  id: string;
  title: string | null;
  type: string;
  category: string | null;
  severity: string | null;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: string | null;
  createdAt: string;
  lastMessageAt: string;
  userName: string | null;
  userEmail: string | null;
  usedVoice: boolean;
  usedPhoto: boolean;
  toolCallCount: number;
}

interface ToolCall {
  id: string;
  conversationId: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: string | null;
  latencyMs: number | null;
  toolCalls: Array<{ name: string; args: unknown }> | null;
  createdAt: string;
}

interface DailyUsage {
  date: string;
  conversations: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  images: number;
}

interface VoiceStats {
  totalSttCalls: number;
  totalTtsCalls: number;
  totalSttDurationMs: number;
  totalTtsCharacters: number;
  totalVoiceCost: number;
  avgSttLatency: number;
  avgTtsLatency: number;
  googleSttCalls: number;
  openaiSttCalls: number;
  googleTtsCalls: number;
  openaiTtsCalls: number;
}

interface VoiceCall {
  id: string;
  userId: string;
  apiType: string;
  provider: string;
  languageCode: string | null;
  durationMs: number | null;
  characterCount: number | null;
  latencyMs: number | null;
  costUsd: string | null;
  model: string | null;
  voiceName: string | null;
  success: number;
  errorMessage: string | null;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
}

interface DailyVoiceUsage {
  date: string;
  sttCalls: number;
  ttsCalls: number;
  cost: number;
}

interface AccuracyMetrics {
  totalOutcomes: number;
  avgCostDelta: number;
  accuracyRate: number;
  byServiceType: Array<{ category: string; count: number; avgDelta: number }>;
}

interface AIUsageClientProps {
  stats: Stats;
  toolUsage: Record<string, number>;
  recentConversations: Conversation[];
  recentToolCalls: ToolCall[];
  voiceStats: VoiceStats;
  recentVoiceCalls: VoiceCall[];
  dailyVoiceUsage: DailyVoiceUsage[];
  dailyUsage: DailyUsage[];
  accuracyMetrics: AccuracyMetrics;
}

// Chart colors
const COLORS = {
  purple: "#3ECF8E",
  blue: "#3ECF8E",
  cyan: "#249361",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  pink: "#ec4899",
  red: "#ef4444",
};

const PIE_COLORS = [COLORS.purple, COLORS.cyan, COLORS.green, COLORS.orange, COLORS.yellow];

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-md", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[13px] text-[#888]">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {subValue && <p className="text-[12px] text-[#666] mt-1">{subValue}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1f1f1f] border border-[#333] rounded-lg p-3 shadow-xl">
        <p className="text-[12px] text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-[11px]" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#171717] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-white truncate">
            {conversation.title || "Untitled Conversation"}
          </p>
          <p className="text-[12px] text-[#666]">
            {conversation.userName || conversation.userEmail || "Unknown user"}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {conversation.usedVoice && (
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-400" title="Voice input">
              <IoMic className="h-3.5 w-3.5" />
            </span>
          )}
          {conversation.usedPhoto && (
            <span className="p-1 rounded bg-pink-500/20 text-pink-400" title="Photo input">
              <IoImage className="h-3.5 w-3.5" />
            </span>
          )}
          {conversation.toolCallCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium" title="Tool calls">
              <IoHammer className="h-3 w-3 inline mr-0.5" />
              {conversation.toolCallCount}
            </span>
          )}
        </div>

        <div className="text-right">
          <p className="text-[12px] text-[#888]">
            {(conversation.totalInputTokens + conversation.totalOutputTokens).toLocaleString()} tokens
          </p>
          <p className="text-[11px] text-green-500">
            ${parseFloat(conversation.totalCostUsd || "0").toFixed(4)}
          </p>
        </div>
        {conversation.severity && (
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-medium",
              conversation.severity === "urgent"
                ? "bg-red-500/20 text-red-400"
                : conversation.severity === "moderate"
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-green-500/20 text-green-400"
            )}
          >
            {conversation.severity}
          </span>
        )}
        <span className="text-[12px] text-[#666]">
          {new Date(conversation.lastMessageAt).toLocaleDateString()}
        </span>
        {expanded ? (
          <IoChevronUp className="h-4 w-4 text-[#666]" />
        ) : (
          <IoChevronDown className="h-4 w-4 text-[#666]" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-3 text-[12px] text-[#888] bg-[#0f0f0f]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div>
              <span className="text-[#666]">Type:</span> {conversation.type}
            </div>
            <div>
              <span className="text-[#666]">Category:</span> {conversation.category || "N/A"}
            </div>
            <div>
              <span className="text-[#666]">Input Tokens:</span>{" "}
              {conversation.totalInputTokens.toLocaleString()}
            </div>
            <div>
              <span className="text-[#666]">Output Tokens:</span>{" "}
              {conversation.totalOutputTokens.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolCallRow({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#171717] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 flex-wrap">
            {toolCall.toolCalls?.map((tc, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[11px] font-mono"
              >
                {tc.name}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-[#888]">
            {((toolCall.inputTokens || 0) + (toolCall.outputTokens || 0)).toLocaleString()} tokens
          </p>
          {toolCall.latencyMs && (
            <p className="text-[11px] text-[#666]">{toolCall.latencyMs}ms</p>
          )}
        </div>
        <span className="text-[12px] text-[#666]">
          {new Date(toolCall.createdAt).toLocaleString()}
        </span>
        {expanded ? (
          <IoChevronUp className="h-4 w-4 text-[#666]" />
        ) : (
          <IoChevronDown className="h-4 w-4 text-[#666]" />
        )}
      </button>
      {expanded && (
        <div className="px-4 pb-3 bg-[#0f0f0f]">
          <pre className="text-[11px] text-[#888] overflow-x-auto p-2 bg-[#171717] rounded">
            {JSON.stringify(toolCall.toolCalls, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function VoiceCallRow({ voiceCall }: { voiceCall: VoiceCall }) {
  const providerLabel = {
    google_stt: "Google STT",
    google_tts: "Google TTS",
    openai_whisper: "Whisper",
    openai_tts: "OpenAI TTS",
  }[voiceCall.provider] || voiceCall.provider;

  const isGoogle = voiceCall.provider.startsWith("google");

  return (
    <div className="border-b border-white/[0.06] last:border-0 px-4 py-3 flex items-center gap-4">
      <div className={cn(
        "p-1.5 rounded-md",
        isGoogle ? "bg-emerald-500/20 text-emerald-400" : "bg-green-500/20 text-green-400"
      )}>
        {voiceCall.apiType === "stt" ? (
          <IoMic className="h-4 w-4" />
        ) : (
          <IoVolumeHigh className="h-4 w-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded text-[11px] font-medium",
            isGoogle ? "bg-emerald-500/20 text-emerald-400" : "bg-green-500/20 text-green-400"
          )}>
            {providerLabel}
          </span>
          {voiceCall.languageCode && (
            <span className="text-[11px] text-[#666]">{voiceCall.languageCode}</span>
          )}
          {voiceCall.success === 0 && (
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px]">
              Error
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#666] mt-0.5">
          {voiceCall.userName || voiceCall.userEmail || "Unknown user"}
        </p>
      </div>

      <div className="text-right">
        {voiceCall.apiType === "stt" ? (
          <p className="text-[12px] text-[#888]">
            {voiceCall.durationMs ? `${(voiceCall.durationMs / 1000).toFixed(1)}s` : "—"}
          </p>
        ) : (
          <p className="text-[12px] text-[#888]">
            {voiceCall.characterCount?.toLocaleString() || "—"} chars
          </p>
        )}
        {voiceCall.latencyMs && (
          <p className="text-[11px] text-[#666]">{voiceCall.latencyMs}ms</p>
        )}
      </div>

      <div className="text-right w-16">
        <p className="text-[11px] text-green-500">
          ${parseFloat(voiceCall.costUsd || "0").toFixed(5)}
        </p>
      </div>

      <span className="text-[12px] text-[#666] w-36 text-right">
        {new Date(voiceCall.createdAt).toLocaleString()}
      </span>
    </div>
  );
}

export function AIUsageClient({
  stats,
  toolUsage,
  recentConversations,
  recentToolCalls,
  voiceStats,
  recentVoiceCalls,
  dailyVoiceUsage,
  dailyUsage,
  accuracyMetrics,
}: AIUsageClientProps) {
  const [activeTab, setActiveTab] = useState<"conversations" | "tools" | "voice">("conversations");

  // Format daily usage data for charts
  const formattedDailyUsage = dailyUsage.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    totalTokens: d.inputTokens + d.outputTokens,
  }));

  // Format voice usage data for charts
  const formattedVoiceUsage = dailyVoiceUsage.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    totalCalls: d.sttCalls + d.ttsCalls,
  }));

  // Tool usage pie chart data
  const toolUsageData = Object.entries(toolUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Voice provider pie chart data
  const voiceProviderData = [
    { name: "Google STT", value: voiceStats.googleSttCalls },
    { name: "Whisper", value: voiceStats.openaiSttCalls },
    { name: "Google TTS", value: voiceStats.googleTtsCalls },
    { name: "OpenAI TTS", value: voiceStats.openaiTtsCalls },
  ].filter((d) => d.value > 0);

  // Token distribution pie chart data
  const tokenDistribution = [
    { name: "Input Tokens", value: stats.totalInputTokens },
    { name: "Output Tokens", value: stats.totalOutputTokens },
  ];

  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#0f0f0f] p-3 sm:p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <IoSparkles className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-white">AI Usage</h1>
          <p className="text-[10px] sm:text-xs text-[#666]">
            Monitor token usage, costs, and API calls
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard
          icon={IoChatbubble}
          label="Conversations"
          value={stats.totalConversations.toLocaleString()}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={IoSparkles}
          label="Total Tokens"
          value={(stats.totalInputTokens + stats.totalOutputTokens).toLocaleString()}
          subValue={`${stats.totalInputTokens.toLocaleString()} in / ${stats.totalOutputTokens.toLocaleString()} out`}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={IoCash}
          label="Total Cost"
          value={`$${stats.totalCost.toFixed(2)}`}
          color="bg-green-500/20 text-green-400"
        />
        <StatCard
          icon={IoChatbubble}
          label="Messages"
          value={stats.totalMessages.toLocaleString()}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <StatCard
          icon={IoTime}
          label="Avg Latency"
          value={`${stats.avgLatency}ms`}
          color="bg-yellow-500/20 text-yellow-400"
        />
      </div>

      {/* Charts Row 1: Token Usage & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Token Usage Area Chart */}
        <div className="lg:col-span-2 bg-[#171717] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[15px] font-semibold text-white mb-4">Daily Token Usage</h3>
          {formattedDailyUsage.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#666]">
              No usage data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={formattedDailyUsage}>
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#666" tickLine={{ stroke: "#666" }} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dy={16} textAnchor="middle" fill="#fff" fontSize={11}>
                      {payload.value}
                    </text>
                  );
                }} />
                <YAxis stroke="#666" tickLine={{ stroke: "#666" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dx={-5} textAnchor="end" fill="#fff" fontSize={11}>
                      {`${(payload.value / 1000).toFixed(0)}k`}
                    </text>
                  );
                }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="inputTokens"
                  name="Input Tokens"
                  stroke={COLORS.purple}
                  fillOpacity={1}
                  fill="url(#colorInput)"
                />
                <Area
                  type="monotone"
                  dataKey="outputTokens"
                  name="Output Tokens"
                  stroke={COLORS.cyan}
                  fillOpacity={1}
                  fill="url(#colorOutput)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-6 mt-4 justify-center text-[13px] text-[#ccc]">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.purple }} /> Input Tokens
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.cyan }} /> Output Tokens
            </span>
          </div>
        </div>

        {/* Token Distribution Pie */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[15px] font-semibold text-white mb-4">Token Distribution</h3>
          {stats.totalInputTokens === 0 && stats.totalOutputTokens === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#666]">
              No token data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={tokenDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={COLORS.purple} />
                  <Cell fill={COLORS.cyan} />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#fff", fontSize: 12, fontWeight: 500 }}
                  itemStyle={{ color: "#fff", fontSize: 12 }}
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => <span style={{ color: "#ccc", fontSize: 13 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2: Cost & Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Cost Bar Chart */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[15px] font-semibold text-white mb-4">Daily Cost</h3>
          {formattedDailyUsage.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#666]">
              No cost data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={formattedDailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#666" tickLine={{ stroke: "#666" }} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dy={16} textAnchor="middle" fill="#fff" fontSize={11}>
                      {payload.value}
                    </text>
                  );
                }} />
                <YAxis stroke="#666" tickLine={{ stroke: "#666" }} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dx={-5} textAnchor="end" fill="#fff" fontSize={11}>
                      {`$${payload.value.toFixed(2)}`}
                    </text>
                  );
                }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#fff", fontSize: 12, fontWeight: 500 }}
                  itemStyle={{ fontSize: 12 }}
                  formatter={(value: number) => [`$${value.toFixed(4)}`, "Cost"]}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="cost" name="Cost" fill={COLORS.green} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Daily Conversations & Images */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[15px] font-semibold text-white mb-4">Daily Conversations & Images</h3>
          {formattedDailyUsage.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#666]">
              No conversation data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={formattedDailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#666" tickLine={{ stroke: "#666" }} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dy={16} textAnchor="middle" fill="#fff" fontSize={11}>
                      {payload.value}
                    </text>
                  );
                }} />
                <YAxis stroke="#666" tickLine={{ stroke: "#666" }} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dx={-5} textAnchor="end" fill="#fff" fontSize={11}>
                      {payload.value}
                    </text>
                  );
                }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#fff", fontSize: 12, fontWeight: 500 }}
                  itemStyle={{ fontSize: 12 }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="conversations" name="Conversations" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                <Bar dataKey="images" name="Images" fill={COLORS.pink} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-6 mt-4 justify-center text-[13px] text-[#ccc]">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.blue }} /> Conversations
            </span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.pink }} /> Images
            </span>
          </div>
        </div>
      </div>

      {/* Voice API Section */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <IoMic className="text-cyan-400" />
          Voice API Usage
        </h2>

        {/* Voice Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon={IoMic}
            label="STT Calls"
            value={voiceStats.totalSttCalls.toLocaleString()}
            subValue={`${(voiceStats.totalSttDurationMs / 1000 / 60).toFixed(1)} min audio`}
            color="bg-emerald-500/20 text-emerald-400"
          />
          <StatCard
            icon={IoVolumeHigh}
            label="TTS Calls"
            value={voiceStats.totalTtsCalls.toLocaleString()}
            subValue={`${voiceStats.totalTtsCharacters.toLocaleString()} chars`}
            color="bg-emerald-500/20 text-emerald-400"
          />
          <StatCard
            icon={IoCash}
            label="Voice Cost"
            value={`$${voiceStats.totalVoiceCost.toFixed(4)}`}
            color="bg-green-500/20 text-green-400"
          />
          <StatCard
            icon={IoTime}
            label="Avg STT Latency"
            value={`${voiceStats.avgSttLatency}ms`}
            color="bg-yellow-500/20 text-yellow-400"
          />
          <StatCard
            icon={IoTime}
            label="Avg TTS Latency"
            value={`${voiceStats.avgTtsLatency}ms`}
            color="bg-orange-500/20 text-orange-400"
          />
          <StatCard
            icon={IoCloud}
            label="Total Voice Calls"
            value={(voiceStats.totalSttCalls + voiceStats.totalTtsCalls).toLocaleString()}
            color="bg-emerald-500/20 text-emerald-400"
          />
        </div>

        {/* Voice Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Voice Usage */}
          <div className="lg:col-span-2 bg-[#171717] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-white mb-4">Daily Voice API Calls</h3>
            {formattedVoiceUsage.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-[#666]">
                No voice API usage data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={formattedVoiceUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#666" tickLine={{ stroke: "#666" }} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dy={16} textAnchor="middle" fill="#fff" fontSize={11}>
                      {payload.value}
                    </text>
                  );
                }} />
                  <YAxis stroke="#666" tickLine={{ stroke: "#666" }} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dx={-5} textAnchor="end" fill="#fff" fontSize={11}>
                      {payload.value}
                    </text>
                  );
                }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: 8 }}
                    labelStyle={{ color: "#fff", fontSize: 12, fontWeight: 500 }}
                    itemStyle={{ fontSize: 12 }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="sttCalls" name="STT Calls" fill={COLORS.blue} stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="ttsCalls" name="TTS Calls" fill={COLORS.cyan} stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="flex gap-6 mt-4 justify-center text-[13px] text-[#ccc]">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.blue }} /> STT Calls
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.cyan }} /> TTS Calls
              </span>
            </div>
          </div>

          {/* Voice Provider Distribution */}
          <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-[15px] font-semibold text-white mb-4">Provider Distribution</h3>
            {voiceProviderData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-[#666]">
                No voice provider data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={voiceProviderData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {voiceProviderData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: 8 }}
                    labelStyle={{ color: "#fff", fontSize: 12, fontWeight: 500 }}
                    itemStyle={{ color: "#fff", fontSize: 12 }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: 20 }}
                    formatter={(value) => <span style={{ color: "#ccc", fontSize: 13 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tool Usage Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#171717] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400">
              <IoHammer className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-semibold text-white">Tool Usage</h3>
            <span className="text-[12px] text-[#666] ml-auto">
              {Object.values(toolUsage).reduce((a, b) => a + b, 0)} total calls
            </span>
          </div>
          {toolUsageData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#666]">
              No tool calls recorded yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={toolUsageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis type="number" stroke="#666" tickLine={{ stroke: "#666" }} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dy={16} textAnchor="middle" fill="#fff" fontSize={11}>
                      {payload.value}
                    </text>
                  );
                }} />
                <YAxis type="category" dataKey="name" stroke="#666" tickLine={{ stroke: "#666" }} width={120} tick={(props) => {
                  const { x, y, payload } = props;
                  return (
                    <text x={x} y={y} dx={-5} textAnchor="end" fill="#fff" fontSize={11}>
                      {payload.value}
                    </text>
                  );
                }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#fff", fontSize: 12, fontWeight: 500 }}
                  itemStyle={{ fontSize: 12 }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="value" name="Calls" fill={COLORS.purple} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Input Types Pie */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[15px] font-semibold text-white mb-4">Input Types</h3>
          {stats.totalVoiceInputs === 0 && stats.totalPhotoInputs === 0 ? (
            <div className="h-64 flex items-center justify-center text-[#666]">
              No input type data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Voice Inputs", value: stats.totalVoiceInputs },
                    { name: "Photo Inputs", value: stats.totalPhotoInputs },
                  ].filter((d) => d.value > 0)}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={COLORS.blue} />
                  <Cell fill={COLORS.pink} />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f1f1f", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#fff", fontSize: 12, fontWeight: 500 }}
                  itemStyle={{ color: "#fff", fontSize: 12 }}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value) => <span style={{ color: "#ccc", fontSize: 13 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Accuracy Metrics */}
      <div className="bg-[#171717] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-[15px] font-semibold text-white mb-4">Cost Estimate Accuracy</h3>
        {accuracyMetrics.totalOutcomes === 0 ? (
          <p className="text-[13px] text-[#666]">No outcomes recorded yet</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <p className="text-xs text-[#666] mb-1">Outcomes recorded</p>
                <p className="text-2xl font-semibold text-white">{accuracyMetrics.totalOutcomes}</p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <p className="text-xs text-[#666] mb-1">Avg cost delta</p>
                <p className={`text-2xl font-semibold ${accuracyMetrics.avgCostDelta > 0 ? "text-red-400" : accuracyMetrics.avgCostDelta < 0 ? "text-teal-400" : "text-white"}`}>
                  {accuracyMetrics.avgCostDelta > 0 ? "+" : ""}${accuracyMetrics.avgCostDelta.toFixed(0)}
                </p>
                <p className="text-[11px] text-[#555] mt-0.5">
                  {accuracyMetrics.avgCostDelta > 0 ? "over-estimating" : accuracyMetrics.avgCostDelta < 0 ? "under-estimating" : "on target"}
                </p>
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-3">
                <p className="text-xs text-[#666] mb-1">Accuracy rate</p>
                <p className={`text-2xl font-semibold ${accuracyMetrics.accuracyRate >= 70 ? "text-teal-400" : "text-amber-400"}`}>
                  {accuracyMetrics.accuracyRate.toFixed(0)}%
                </p>
                <p className="text-[11px] text-[#555] mt-0.5">within ±30% of estimate</p>
              </div>
            </div>

            {accuracyMetrics.byServiceType.length > 0 && (
              <div>
                <p className="text-xs text-[#666] mb-2">By service type</p>
                <div className="space-y-1.5">
                  {accuracyMetrics.byServiceType.map((row) => (
                    <div key={row.category} className="flex items-center justify-between text-xs">
                      <span className="text-[#9a9a9a] capitalize">{row.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#555]">{row.count} outcome{row.count !== 1 ? "s" : ""}</span>
                        <span className={row.avgDelta > 0 ? "text-red-400" : row.avgDelta < 0 ? "text-teal-400" : "text-[#666]"}>
                          {row.avgDelta > 0 ? "+" : ""}${row.avgDelta.toFixed(0)} avg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("conversations")}
            className={cn(
              "pb-2 px-1 text-[13px] font-medium border-b-2 transition-colors",
              activeTab === "conversations"
                ? "text-white border-emerald-500"
                : "text-[#888] border-transparent hover:text-white"
            )}
          >
            Recent Conversations
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={cn(
              "pb-2 px-1 text-[13px] font-medium border-b-2 transition-colors",
              activeTab === "tools"
                ? "text-white border-emerald-500"
                : "text-[#888] border-transparent hover:text-white"
            )}
          >
            Recent Tool Calls
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={cn(
              "pb-2 px-1 text-[13px] font-medium border-b-2 transition-colors",
              activeTab === "voice"
                ? "text-white border-emerald-500"
                : "text-[#888] border-transparent hover:text-white"
            )}
          >
            Voice API Calls
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[#171717] border border-white/[0.06] rounded-xl overflow-hidden">
        {activeTab === "conversations" ? (
          recentConversations.length === 0 ? (
            <p className="p-6 text-[13px] text-[#666]">No conversations yet</p>
          ) : (
            recentConversations.map((conv) => (
              <ConversationRow key={conv.id} conversation={conv} />
            ))
          )
        ) : activeTab === "tools" ? (
          recentToolCalls.length === 0 ? (
            <p className="p-6 text-[13px] text-[#666]">No tool calls recorded yet</p>
          ) : (
            recentToolCalls.map((tc) => <ToolCallRow key={tc.id} toolCall={tc} />)
          )
        ) : recentVoiceCalls.length === 0 ? (
          <p className="p-6 text-[13px] text-[#666]">No voice API calls recorded yet</p>
        ) : (
          recentVoiceCalls.map((vc) => <VoiceCallRow key={vc.id} voiceCall={vc} />)
        )}
      </div>
    </div>
  );
}
