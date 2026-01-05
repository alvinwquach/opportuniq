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
} from "react-icons/io5";
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

interface AIUsageClientProps {
  stats: Stats;
  toolUsage: Record<string, number>;
  recentConversations: Conversation[];
  recentToolCalls: ToolCall[];
  dailyUsage: DailyUsage[];
}

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
    <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
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

function ToolUsageCard({ toolUsage }: { toolUsage: Record<string, number> }) {
  const sortedTools = Object.entries(toolUsage).sort((a, b) => b[1] - a[1]);
  const totalCalls = sortedTools.reduce((acc, [, count]) => acc + count, 0);

  return (
    <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400">
          <IoHammer className="h-4 w-4" />
        </div>
        <span className="text-[14px] font-medium text-white">Tool Usage</span>
        <span className="text-[12px] text-[#666] ml-auto">{totalCalls} total calls</span>
      </div>
      {sortedTools.length === 0 ? (
        <p className="text-[13px] text-[#666]">No tool calls recorded yet</p>
      ) : (
        <div className="space-y-2">
          {sortedTools.map(([name, count]) => {
            const percentage = (count / totalCalls) * 100;
            return (
              <div key={name}>
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-white font-mono">{name}</span>
                  <span className="text-[#888]">{count} calls</span>
                </div>
                <div className="h-1.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-[#1f1f1f] last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#1a1a1a] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-white truncate">
            {conversation.title || "Untitled Conversation"}
          </p>
          <p className="text-[12px] text-[#666]">
            {conversation.userName || conversation.userEmail || "Unknown user"}
          </p>
        </div>

        {/* Input type indicators */}
        <div className="flex items-center gap-1.5">
          {conversation.usedVoice && (
            <span className="p-1 rounded bg-blue-500/20 text-blue-400" title="Voice input">
              <IoMic className="h-3.5 w-3.5" />
            </span>
          )}
          {conversation.usedPhoto && (
            <span className="p-1 rounded bg-pink-500/20 text-pink-400" title="Photo input">
              <IoImage className="h-3.5 w-3.5" />
            </span>
          )}
          {conversation.toolCallCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-medium" title="Tool calls">
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
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[#1f1f1f] mt-2">
            <div>
              <span className="text-[#666]">Voice Input:</span>{" "}
              <span className={conversation.usedVoice ? "text-blue-400" : "text-[#444]"}>
                {conversation.usedVoice ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="text-[#666]">Photo Input:</span>{" "}
              <span className={conversation.usedPhoto ? "text-pink-400" : "text-[#444]"}>
                {conversation.usedPhoto ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="text-[#666]">Tool Calls:</span>{" "}
              <span className={conversation.toolCallCount > 0 ? "text-purple-400" : "text-[#444]"}>
                {conversation.toolCallCount}
              </span>
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
    <div className="border-b border-[#1f1f1f] last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[#1a1a1a] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex gap-2">
            {toolCall.toolCalls?.map((tc, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[11px] font-mono"
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
          <pre className="text-[11px] text-[#888] overflow-x-auto p-2 bg-[#1a1a1a] rounded">
            {JSON.stringify(toolCall.toolCalls, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function AIUsageClient({
  stats,
  toolUsage,
  recentConversations,
  recentToolCalls,
  dailyUsage,
}: AIUsageClientProps) {
  const [activeTab, setActiveTab] = useState<"conversations" | "tools">("conversations");

  // Calculate max for chart scaling
  const maxTokens = Math.max(...dailyUsage.map((d) => d.inputTokens + d.outputTokens), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <IoSparkles className="text-purple-400" />
          AI Usage Dashboard
        </h1>
        <p className="text-[13px] text-[#888] mt-1">
          Monitor token usage, costs, and tool calls across all AI conversations
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard
          icon={IoChatbubble}
          label="Conversations"
          value={stats.totalConversations.toLocaleString()}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={IoSparkles}
          label="Total Tokens"
          value={(stats.totalInputTokens + stats.totalOutputTokens).toLocaleString()}
          subValue={`${stats.totalInputTokens.toLocaleString()} in / ${stats.totalOutputTokens.toLocaleString()} out`}
          color="bg-purple-500/20 text-purple-400"
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
          color="bg-cyan-500/20 text-cyan-400"
        />
        <StatCard
          icon={IoTime}
          label="Avg Latency"
          value={`${stats.avgLatency}ms`}
          color="bg-yellow-500/20 text-yellow-400"
        />
        <StatCard
          icon={IoMic}
          label="Voice Inputs"
          value={stats.totalVoiceInputs.toLocaleString()}
          color="bg-blue-500/20 text-blue-400"
        />
        <StatCard
          icon={IoImage}
          label="Photo Inputs"
          value={stats.totalPhotoInputs.toLocaleString()}
          color="bg-pink-500/20 text-pink-400"
        />
        <StatCard
          icon={IoHammer}
          label="Tool Calls"
          value={Object.values(toolUsage).reduce((a, b) => a + b, 0).toLocaleString()}
          color="bg-orange-500/20 text-orange-400"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#141414] border border-[#1f1f1f] rounded-lg p-4">
          <h3 className="text-[14px] font-medium text-white mb-4">Daily Usage (Last 30 Days)</h3>
          {dailyUsage.length === 0 ? (
            <p className="text-[13px] text-[#666]">No usage data yet</p>
          ) : (
            <div className="h-48 flex items-end gap-1">
              {dailyUsage.map((day, i) => {
                const totalTokens = day.inputTokens + day.outputTokens;
                const height = (totalTokens / maxTokens) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 group relative"
                    title={`${day.date}: ${totalTokens.toLocaleString()} tokens, $${day.cost.toFixed(4)}, ${day.images} images`}
                  >
                    <div
                      className="bg-purple-500/50 hover:bg-purple-500 transition-colors rounded-t"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#1f1f1f] px-2 py-1 rounded text-[11px] text-white whitespace-nowrap z-10">
                      {day.date}
                      <br />
                      {totalTokens.toLocaleString()} tokens
                      <br />${day.cost.toFixed(4)}
                      {day.images > 0 && (
                        <>
                          <br />
                          {day.images} image{day.images !== 1 ? "s" : ""}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <ToolUsageCard toolUsage={toolUsage} />
      </div>
      <div className="border-b border-[#1f1f1f]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("conversations")}
            className={cn(
              "pb-2 px-1 text-[13px] font-medium border-b-2 transition-colors",
              activeTab === "conversations"
                ? "text-white border-purple-500"
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
                ? "text-white border-purple-500"
                : "text-[#888] border-transparent hover:text-white"
            )}
          >
            Recent Tool Calls
          </button>
        </div>
      </div>
      <div className="bg-[#141414] border border-[#1f1f1f] rounded-lg overflow-hidden">
        {activeTab === "conversations" ? (
          recentConversations.length === 0 ? (
            <p className="p-4 text-[13px] text-[#666]">No conversations yet</p>
          ) : (
            recentConversations.map((conv) => (
              <ConversationRow key={conv.id} conversation={conv} />
            ))
          )
        ) : recentToolCalls.length === 0 ? (
          <p className="p-4 text-[13px] text-[#666]">No tool calls recorded yet</p>
        ) : (
          recentToolCalls.map((tc) => <ToolCallRow key={tc.id} toolCall={tc} />)
        )}
      </div>
    </div>
  );
}
