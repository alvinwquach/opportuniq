"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  IoCamera,
  IoMic,
  IoAttach,
  IoSend,
  IoVideocam,
  IoPeople,
} from "react-icons/io5";
import { IoHammerOutline } from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { OpportunIQLogo } from "../../../OpportunIQLogo";
import { useDemoFlowContextSafe } from "./DemoFlowContext";
import type { IssueData, ChatMessage } from "./types";

const WELCOME_MESSAGE = "Hey! I'm here to help you diagnose issues, plan DIY projects, or find the right professional for the job. Describe what you're working on, share a photo, or use voice in any language.";

// Simulated AI responses for suggestions
const SUGGESTION_RESPONSES: Record<string, string> = {
  "What tools do I need for this?": "For this repair, you'll need:\n\n• **Flathead screwdriver** - to pry off the handle cap\n• **Phillips screwdriver** - for the handle screw\n• **Needle-nose pliers** - to remove the retaining clip\n• **Adjustable wrench** - for the cartridge\n• **Cartridge puller** (optional) - makes removal easier\n\nAll of these are common household tools. The cartridge puller is optional but recommended if the cartridge is stuck.",
  "How long will this take?": "This repair typically takes **30-45 minutes** for a first-timer. Here's the breakdown:\n\n• Turning off water & prep: 5 min\n• Removing the handle: 5-10 min\n• Replacing the cartridge: 10-15 min\n• Reassembly & testing: 10-15 min\n\nIf you've done this before, you can finish in about 20 minutes.",
  "Is this safe for a beginner?": "Yes, with some caution! Here's what to know:\n\n✅ **Safe for beginners** - no electrical work involved\n✅ **Low risk** - worst case is a small water mess\n\n⚠️ **Key safety steps:**\n1. Always turn off water supply FIRST\n2. Have towels ready for residual water\n3. Take photos before disassembly\n\nI'd rate this a **3/10 difficulty** - very manageable for your first plumbing repair!",
  "What could go wrong?": "Good question! Here are common issues and how to handle them:\n\n**1. Cartridge is stuck**\n→ Use a cartridge puller tool, or try WD-40 and wait 10 min\n\n**2. Water still leaks after repair**\n→ The cartridge may be installed backwards - check the hot/cold orientation\n\n**3. Parts don't fit**\n→ Take the old cartridge to the store to match it exactly\n\n**4. Stripped screws**\n→ Use a rubber band between screwdriver and screw for grip\n\nMost issues are easily fixable!",
  "Show me a video guide": "I found a great video guide for you:\n\n📺 **\"Moen Faucet Cartridge Replacement\"** (12:34)\n⭐ 4.8 rating · 1.2M views\n\nThis video covers:\n• Identifying your faucet model\n• Step-by-step cartridge removal\n• Common mistakes to avoid\n• Testing for leaks\n\nWould you like me to walk you through the steps here instead?",
  "Compare DIY vs hiring a pro": "Here's the comparison:\n\n**DIY Route:**\n• Cost: ~$33 (parts only)\n• Time: 30-45 minutes\n• Skill: Beginner-friendly\n• Satisfaction: High!\n\n**Hiring a Pro:**\n• Cost: ~$185 (labor + parts)\n• Time: Same day appointment\n• Warranty: Usually 30-90 days\n\n**My recommendation:** This is a great DIY project! You'll save **$150+** and learn a valuable skill. The guides I found make it very straightforward.",
  "Why can't I do this myself?": "This repair requires **EPA 608 certification** to handle refrigerants legally. Here's why:\n\n⚠️ **Legal requirement:** It's a federal violation to release refrigerants into the atmosphere\n\n⚠️ **Safety risk:** Refrigerants can cause frostbite and displace oxygen in enclosed spaces\n\n⚠️ **Equipment needed:** Specialized gauges, vacuum pumps, and recovery machines\n\nThe good news: I've already contacted 3 certified HVAC pros near you with great reviews!",
  "How do I find a good contractor?": "Here's how to find a reliable HVAC contractor:\n\n**What I've already done:**\n✅ Found 3 highly-rated pros near you\n✅ Verified their licenses and insurance\n✅ Checked recent reviews\n✅ Requested quotes from all of them\n\n**Questions to ask:**\n1. Are you EPA 608 certified?\n2. What's included in the service call?\n3. Do you offer a warranty on repairs?\n\n**Cool Air HVAC** has the best availability - today at 4pm!",
};

// Context-aware follow-up suggestions based on issue type
function getFollowUpSuggestions(issue: IssueData): string[] {
  const suggestions: string[] = [];

  if (issue.difficulty === "Easy") {
    suggestions.push("What tools do I need for this?");
    suggestions.push("How long will this take?");
  } else if (issue.difficulty.includes("Moderate")) {
    suggestions.push("Is this safe for a beginner?");
    suggestions.push("What could go wrong?");
  } else if (issue.difficulty.includes("Professional")) {
    suggestions.push("Why can't I do this myself?");
    suggestions.push("How do I find a good contractor?");
  }

  if (issue.status !== "resolved") {
    if (issue.guides.length > 0) {
      suggestions.push("Show me a video guide");
    }
    suggestions.push("Compare DIY vs hiring a pro");
  }

  return suggestions.slice(0, 3);
}

interface ChatAreaProps {
  issue: IssueData | null;
  isCreatingNewIssue: boolean;
}

export function ChatArea({ issue, isCreatingNewIssue }: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const [isTypingWelcome, setIsTypingWelcome] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [additionalMessages, setAdditionalMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Get demo flow context (may be null if not in provider)
  const demoFlow = useDemoFlowContextSafe();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
  }, []);

  // Scroll to bottom when new messages arrive (within container only)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [additionalMessages, streamingMessage, demoFlow?.streamedDiagnosis]);

  // Reset additional messages when issue changes
  useEffect(() => {
    setAdditionalMessages([]);
    setStreamingMessage("");
    setIsStreamingResponse(false);
  }, [issue?.title]);

  // Stream a response character by character (for follow-up questions)
  const streamResponse = useCallback((response: string, userMessage: string) => {
    setAdditionalMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsStreamingResponse(true);
    setStreamingMessage("");

    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < response.length) {
        const charsToAdd = Math.min(3, response.length - currentIndex);
        currentIndex += charsToAdd;
        setStreamingMessage(response.slice(0, currentIndex));
      } else {
        clearInterval(streamInterval);
        setIsStreamingResponse(false);
        setAdditionalMessages(prev => [...prev, { role: "assistant", content: response }]);
        setStreamingMessage("");
      }
    }, 15);

    return () => clearInterval(streamInterval);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (isStreamingResponse || demoFlow?.isStreaming) return;
    const response = SUGGESTION_RESPONSES[suggestion];
    if (response) {
      streamResponse(response, suggestion);
    }
  }, [isStreamingResponse, demoFlow?.isStreaming, streamResponse]);

  const handleSend = useCallback(() => {
    if (!messageInput.trim() || isStreamingResponse || demoFlow?.isStreaming) return;

    const userMsg = messageInput.trim();
    setMessageInput("");

    const response = SUGGESTION_RESPONSES[userMsg] ||
      "I understand you're asking about \"" + userMsg + "\". Let me look into that for you...\n\nBased on your question, I'd recommend checking the DIY guides I've found - they cover most common questions about this repair. You can also upload a photo if you need help with a specific step!";

    streamResponse(response, userMsg);
  }, [messageInput, isStreamingResponse, demoFlow?.isStreaming, streamResponse]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Typing animation for welcome message
  useEffect(() => {
    if (!isCreatingNewIssue) {
      setWelcomeText("");
      setIsTypingWelcome(false);
      return;
    }

    setIsTypingWelcome(true);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < WELCOME_MESSAGE.length) {
        currentIndex++;
        setWelcomeText(WELCOME_MESSAGE.slice(0, currentIndex));
      } else {
        setIsTypingWelcome(false);
        clearInterval(typingInterval);
      }
    }, 20);

    return () => clearInterval(typingInterval);
  }, [isCreatingNewIssue]);

  // Memoize suggestions
  const followUpSuggestions = useMemo(() => {
    if (!issue || issue.status === "resolved") return [];
    return getFollowUpSuggestions(issue);
  }, [issue]);

  // Filter out suggestions that have already been asked
  const availableSuggestions = useMemo(() => {
    const askedQuestions = additionalMessages
      .filter(m => m.role === "user")
      .map(m => m.content);
    return followUpSuggestions.filter(s => !askedQuestions.includes(s));
  }, [followUpSuggestions, additionalMessages]);

  // Determine if we're in any streaming state
  const isAnyStreaming = isStreamingResponse || (demoFlow?.isStreaming ?? false);
  const isDiagnosisStreaming = demoFlow?.isStreaming && !demoFlow?.diagnosisComplete;
  const showDiagnosisCursor = isDiagnosisStreaming;

  if (isCreatingNewIssue) {
    return (
      <div className="flex-1 h-full flex flex-col min-w-0">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Welcome Message */}
            <div className="flex justify-start">
              <div className="max-w-[90%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <OpportunIQLogo className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-white">OpportunIQ</span>
                </div>
                <div className="pl-10">
                  <p className="text-[15px] text-[#e0e0e0] leading-relaxed">
                    {welcomeText}
                    {isTypingWelcome && (
                      <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="shrink-0 p-4">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] focus-within:border-emerald-500/50 transition-colors">
            <textarea
              placeholder="Describe your issue..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full px-4 py-3 bg-transparent text-[15px] text-white placeholder:text-[#555] focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="p-2 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors"
                    >
                      <IoCamera className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Take photo</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="p-2 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors"
                    >
                      <IoAttach className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach file</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="p-2.5 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors"
                    >
                      <IoMic className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Voice message</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleSend}
                      className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full transition-colors"
                    >
                      <IoSend className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Send</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex-1 h-full flex flex-col min-w-0">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <IoHammerOutline className="w-12 h-12 text-[#333] mx-auto mb-3" />
            <p className="text-sm text-[#666]">Select an issue to view details</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = issue.icon;
  const iconBg = issue.status === "resolved"
    ? "bg-emerald-500/20"
    : issue.iconColor.includes("blue") ? "bg-blue-500/20"
    : issue.iconColor.includes("cyan") ? "bg-cyan-500/20"
    : issue.iconColor.includes("amber") ? "bg-amber-500/20"
    : issue.iconColor.includes("yellow") ? "bg-yellow-500/20"
    : "bg-emerald-500/20";

  const hasGuides = issue.guides.length > 0;
  const hasParts = issue.parts.length > 0;
  const hasDiyContent = hasGuides || hasParts;

  // Build the messages to display
  // First message is the user's original report (from issue.chatMessages[0])
  // Second message is the AI diagnosis (streamed from demoFlow or static)
  const userMessage = issue.chatMessages.find(m => m.role === "user");
  const originalAssistantMessage = issue.chatMessages.find(m => m.role === "assistant");

  // Use streamed diagnosis from demo flow, or fall back to static
  const diagnosisToShow = demoFlow?.streamedDiagnosis ?? originalAssistantMessage?.content ?? "";
  const showDiagnosis = diagnosisToShow.length > 0;

  return (
    <div className="flex-1 h-full flex flex-col min-w-0">
      {/* Issue Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-5 h-5 ${
              issue.status === "resolved" ? "text-emerald-400" : issue.iconColor
            }`} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">{issue.title}</h2>
            <div className="flex items-center gap-2 text-xs text-[#888]">
              <span>{issue.date}</span>
              <span>·</span>
              <span className={
                issue.difficulty === "Easy" ? "text-emerald-400" :
                issue.difficulty.includes("Professional") ? "text-red-400" :
                "text-amber-400"
              }>{issue.difficulty}</span>
              <span>·</span>
              <span>{issue.confidence}% confident</span>
            </div>
          </div>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
          issue.status === "resolved"
            ? "bg-[#2a2a2a] text-[#888]"
            : "bg-emerald-500/20 text-emerald-400"
        }`}>
          {issue.status === "resolved" ? "Resolved" : "Active"}
        </span>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* User's original message */}
        {userMessage && (
          <div className="flex justify-end">
            <div className="max-w-[85%]">
              <div className={`px-4 py-3 rounded-2xl bg-emerald-600 text-white rounded-br-md`}>
                {userMessage.hasImage && (
                  <div className="flex items-center gap-2 text-xs opacity-80 mb-2 pb-2 border-b border-white/20">
                    <IoCamera className="w-4 h-4" />
                    <span>Photo attached</span>
                  </div>
                )}
                {userMessage.hasVoice && (
                  <div className="flex items-center gap-2 text-xs opacity-80 mb-2 pb-2 border-b border-white/20">
                    <IoMic className="w-4 h-4" />
                    <span>Voice note transcribed</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{userMessage.content}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Diagnosis (streamed) */}
        {showDiagnosis && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <OpportunIQLogo className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs text-[#888]">OpportunIQ</span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#1a1a1a] text-[#e0e0e0] border border-[#2a2a2a] rounded-bl-md">
                <p className="text-sm whitespace-pre-wrap">
                  {diagnosisToShow}
                  {showDiagnosisCursor && (
                    <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional messages from user interaction */}
        {additionalMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%]">
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <OpportunIQLogo className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs text-[#888]">OpportunIQ</span>
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-md"
                  : "bg-[#1a1a1a] text-[#e0e0e0] border border-[#2a2a2a] rounded-bl-md"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Streaming response for follow-up questions */}
        {isStreamingResponse && streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <OpportunIQLogo className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs text-[#888]">OpportunIQ</span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#1a1a1a] text-[#e0e0e0] border border-[#2a2a2a] rounded-bl-md">
                <p className="text-sm whitespace-pre-wrap">
                  {streamingMessage}
                  <span className="inline-block w-2 h-4 bg-emerald-400 ml-0.5 animate-pulse" />
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cost Comparison Card - show after diagnosis complete */}
        {demoFlow?.diagnosisComplete && additionalMessages.length === 0 && !isStreamingResponse && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <OpportunIQLogo className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Cost Comparison</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${
                hasDiyContent
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-[#0f0f0f] border-[#2a2a2a]"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <IoHammerOutline className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">DIY Cost</span>
                </div>
                <p className="text-lg font-bold text-emerald-400">
                  {issue.diyCost > 0 ? `$${issue.diyCost.toFixed(2)}` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <IoPeople className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-400">Pro Cost</span>
                </div>
                <p className="text-lg font-bold text-white">${issue.proCost.toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Follow-ups + Chat Input */}
      <div className="shrink-0">
        {/* Chat Input with integrated suggestions */}
        <div className="p-4">
          {/* Suggestion chips - horizontal layout above input */}
          {availableSuggestions.length > 0 && !isAnyStreaming && demoFlow?.diagnosisComplete && (
            <div className="flex flex-wrap gap-2 mb-2">
              {availableSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-xs text-[#999] bg-[#1a1a1a] border border-[#2a2a2a] rounded-full hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] focus-within:border-emerald-500/50 transition-colors">
            <textarea
              placeholder="Ask a follow-up question..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isAnyStreaming}
              rows={1}
              className="w-full px-4 py-3 bg-transparent text-sm text-white placeholder:text-[#555] focus:outline-none resize-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors">
                      <IoCamera className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Take photo</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors">
                      <IoVideocam className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Record video</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors">
                      <IoMic className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Voice note</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors">
                      <IoAttach className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Attach file</TooltipContent>
                </Tooltip>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={isAnyStreaming || !messageInput.trim()}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                  >
                    <IoSend className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Send</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
