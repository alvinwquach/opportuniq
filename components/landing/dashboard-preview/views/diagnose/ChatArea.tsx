"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  IoCamera,
  IoMic,
  IoAttach,
  IoSend,
  IoVideocam,
  IoPeople,
  IoSearch,
  IoCash,
  IoPerson,
  IoShieldCheckmark,
  IoLogoReddit,
} from "react-icons/io5";
import { IoHammerOutline } from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { OpportunIQLogo } from "../../../OpportunIQLogo";
import { useDemoFlowContextSafe } from "./DemoFlowContext";
import { useDarkMode } from "../../DarkModeContext";
import type { IssueData, ChatMessage } from "./types";

const WELCOME_MESSAGE = "Hey! I'm here to help you diagnose issues, plan DIY projects, or find the right professional for the job. Describe what you're working on, share a photo, or use voice in any language.";

// Simulated AI responses for suggestions
const SUGGESTION_RESPONSES: Record<string, string> = {
  "What tools do I need for this?": "For this repair, you'll need:\n\n• **Flathead screwdriver** - to pry off the handle cap\n• **Phillips screwdriver** - for the handle screw\n• **Needle-nose pliers** - to remove the retaining clip\n• **Adjustable wrench** - for the cartridge\n• **Cartridge puller** (optional) - makes removal easier\n\nAll of these are common household tools. The cartridge puller is optional but recommended if the cartridge is stuck.",
  "How long will this take?": "This repair typically takes **30-45 minutes** for a first-timer. Here's the breakdown:\n\n• Turning off water & prep: 5 min\n• Removing the handle: 5-10 min\n• Replacing the cartridge: 10-15 min\n• Reassembly & testing: 10-15 min\n\nIf you've done this before, you can finish in about 20 minutes.",
  "Is this safe for a beginner?": "Yes, with some caution! Here's what to know:\n\n- **Safe for beginners** - no electrical work involved\n- **Low risk** - worst case is a small water mess\n\n**Key safety steps:**\n1. Always turn off water supply FIRST\n2. Have towels ready for residual water\n3. Take photos before disassembly\n\nI'd rate this a **3/10 difficulty** - very manageable for your first plumbing repair!",
  "What could go wrong?": "Good question! Here are common issues and how to handle them:\n\n**1. Cartridge is stuck**\n→ Use a cartridge puller tool, or try WD-40 and wait 10 min\n\n**2. Water still leaks after repair**\n→ The cartridge may be installed backwards - check the hot/cold orientation\n\n**3. Parts don't fit**\n→ Take the old cartridge to the store to match it exactly\n\n**4. Stripped screws**\n→ Use a rubber band between screwdriver and screw for grip\n\nMost issues are easily fixable!",
  "Show me a video guide": "I found a great video guide for you:\n\n**\"Moen Faucet Cartridge Replacement\"** (12:34)\n4.8 rating · 1.2M views\n\nThis video covers:\n• Identifying your faucet model\n• Step-by-step cartridge removal\n• Common mistakes to avoid\n• Testing for leaks\n\nWould you like me to walk you through the steps here instead?",
  "Compare DIY vs hiring a pro": "Here's the comparison:\n\n**DIY Route:**\n• Cost: ~$33 (parts only)\n• Time: 30-45 minutes\n• Skill: Beginner-friendly\n• Satisfaction: High!\n\n**Hiring a Pro:**\n• Cost: ~$185 (labor + parts)\n• Time: Same day appointment\n• Warranty: Usually 30-90 days\n\n**My recommendation:** This is a great DIY project! You'll save **$150+** and learn a valuable skill. The guides I found make it very straightforward.",
  "Why can't I do this myself?": "This repair requires **EPA 608 certification** to handle refrigerants legally. Here's why:\n\n**Legal requirement:** It's a federal violation to release refrigerants into the atmosphere\n\n**Safety risk:** Refrigerants can cause frostbite and displace oxygen in enclosed spaces\n\n**Equipment needed:** Specialized gauges, vacuum pumps, and recovery machines\n\nThe good news: I've already contacted 3 certified HVAC pros near you with great reviews!",
  "How do I find a good contractor?": "Here's how to find a reliable HVAC contractor:\n\n**What I've already done:**\n- Found 3 highly-rated pros near you\n- Verified their licenses and insurance\n- Checked recent reviews\n- Requested quotes from all of them\n\n**Questions to ask:**\n1. Are you EPA 608 certified?\n2. What's included in the service call?\n3. Do you offer a warranty on repairs?\n\n**Cool Air HVAC** has the best availability - today at 4pm!",
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
  const dark = useDarkMode();
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
      <div className={`flex-1 h-full flex flex-col min-w-0 ${dark ? "bg-[#1a1a1a]" : "bg-white"}`}>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-start">
              <div className="max-w-[90%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <OpportunIQLogo className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className={`text-sm font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>OpportunIQ</span>
                </div>
                <div className="pl-10">
                  <p className={`text-[15px] leading-relaxed ${dark ? "text-gray-400" : "text-gray-700"}`}>
                    {welcomeText}
                    {isTypingWelcome && (
                      <span className="inline-block w-2 h-4 bg-blue-600 ml-0.5 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="shrink-0 p-4">
          <div className={`rounded-2xl border focus-within:border-blue-500/50 transition-colors ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}>
            <textarea
              placeholder="Describe your issue..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={3}
              className={`w-full px-4 py-3 bg-transparent text-[15px] focus:outline-none resize-none placeholder:text-gray-500 ${dark ? "text-gray-200" : "text-gray-900"}`}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
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
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
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
                      className="p-2.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
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
                      className="p-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-full transition-colors"
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
      <div className={`flex-1 h-full flex flex-col min-w-0 ${dark ? "bg-[#1a1a1a]" : "bg-white"}`}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <IoHammerOutline className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-gray-700" : "text-gray-300"}`} />
            <p className={`text-sm ${dark ? "text-gray-600" : "text-gray-500"}`}>Select an issue to view details</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = issue.icon;
  const iconBg = issue.status === "resolved"
    ? "bg-blue-50"
    : issue.iconColor.includes("blue") ? "bg-blue-50"
    : issue.iconColor.includes("cyan") ? "bg-cyan-50"
    : issue.iconColor.includes("amber") ? "bg-amber-50"
    : issue.iconColor.includes("yellow") ? "bg-yellow-50"
    : "bg-blue-50";

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

  const msgBubbleDark = dark ? "bg-[#252525] text-gray-200 border border-white/[0.06]" : "bg-white text-gray-900 border border-gray-200";

  return (
    <div className={`flex-1 h-full flex flex-col min-w-0 ${dark ? "bg-[#1a1a1a]" : "bg-white"}`}>
      {/* Issue Header */}
      <div className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-5 h-5 ${issue.status === "resolved" ? "text-blue-600" : issue.iconColor}`} />
          </div>
          <div>
            <h2 className={`text-base font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{issue.title}</h2>
            <div className={`flex items-center gap-2 text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>
              <span>{issue.date}</span>
              <span>·</span>
              <span className={
                issue.difficulty === "Easy" ? "text-blue-500" :
                issue.difficulty.includes("Professional") ? "text-red-500" :
                "text-amber-500"
              }>{issue.difficulty}</span>
              <span>·</span>
              <span>{issue.confidence}% confident</span>
            </div>
          </div>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
          issue.status === "resolved"
            ? dark ? "bg-white/10 text-gray-500" : "bg-gray-100 text-gray-500"
            : "bg-blue-100 text-blue-600"
        }`}>
          {issue.status === "resolved" ? "Resolved" : "Active"}
        </span>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 scrollbar-auto-hide p-5 space-y-4">
        {userMessage && (
          <div className="flex justify-end">
            <div className="max-w-[85%]">
              <div className="px-4 py-3 rounded-2xl bg-blue-600 text-white rounded-br-md">
                {userMessage.hasImage && (
                  <div className="flex items-center gap-2 text-xs opacity-80 mb-2 pb-2 border-b border-blue-500">
                    <IoCamera className="w-4 h-4" />
                    <span>Photo attached</span>
                  </div>
                )}
                {userMessage.hasVoice && (
                  <div className="flex items-center gap-2 text-xs opacity-80 mb-2 pb-2 border-b border-blue-500">
                    <IoMic className="w-4 h-4" />
                    <span>Voice note transcribed</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{userMessage.content}</p>
              </div>
            </div>
          </div>
        )}

        {showDiagnosis && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                  <OpportunIQLogo className="w-4 h-4 text-blue-600" />
                </div>
                <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>OpportunIQ</span>
              </div>
              <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${msgBubbleDark}`}>
                <p className="text-sm whitespace-pre-wrap">
                  {diagnosisToShow}
                  {showDiagnosisCursor && (
                    <span className="inline-block w-2 h-4 bg-blue-600 ml-0.5 animate-pulse" />
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {additionalMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%]">
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <OpportunIQLogo className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>OpportunIQ</span>
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : `${msgBubbleDark} rounded-bl-md`
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isStreamingResponse && streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                  <OpportunIQLogo className="w-4 h-4 text-blue-600" />
                </div>
                <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>OpportunIQ</span>
              </div>
              <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${msgBubbleDark}`}>
                <p className="text-sm whitespace-pre-wrap">
                  {streamingMessage}
                  <span className="inline-block w-2 h-4 bg-blue-600 ml-0.5 animate-pulse" />
                </p>
              </div>
            </div>
          </div>
        )}

        {demoFlow?.diagnosisComplete && issue && (() => {
          const toolCalls = [
            { icon: IoCash, label: "getCostEstimate", result: `$${issue.diyCost > 0 ? issue.diyCost.toFixed(0) : "N/A"} DIY · $${issue.proCost.toFixed(0)} pro`, done: true },
            { icon: IoSearch, label: "searchReddit", result: `${issue.research.filter(r => r.type === "reddit").length} threads found`, done: true },
            { icon: IoPerson, label: "searchContractors", result: `${issue.pros.length} rated pros near you`, done: true },
            { icon: IoShieldCheckmark, label: "checkRecalls", result: issue.difficulty.includes("Professional") ? "1 recall notice found" : "No recalls found", done: true },
          ];
          const visible = Math.min(demoFlow.visibleToolCalls, toolCalls.length);
          if (visible === 0) return null;
          return (
            <div className="space-y-1.5">
              {toolCalls.slice(0, visible).map((tc, idx) => {
                const Icon = tc.icon;
                const isLast = idx === visible - 1 && demoFlow.phase === "researching";
                return (
                  <div key={tc.label} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${dark ? "bg-white/[0.03] border-white/[0.06]" : "bg-gray-50 border-gray-100"}`}>
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? "text-gray-600" : "text-gray-400"}`} />
                    <span className={`text-[11px] font-mono flex-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>{tc.label}</span>
                    {isLast ? (
                      <div className="w-3 h-3 border-2 border-blue-400/50 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <span className={`text-[11px] flex-shrink-0 ${dark ? "text-gray-500" : "text-gray-500"}`}>{tc.result}</span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

        {demoFlow?.isComplete && issue && issue.research.filter(r => r.type === "reddit").length > 0 && additionalMessages.length === 0 && !isStreamingResponse && (
          <div className="space-y-1.5">
            <p className={`text-[11px] font-medium uppercase tracking-wide px-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>From the community</p>
            {issue.research.filter(r => r.type === "reddit").map((r, idx) => (
              <div key={idx} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border ${dark ? "bg-white/[0.03] border-white/[0.06]" : "bg-gray-50 border-gray-100"}`}>
                <IoLogoReddit className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className={`text-xs leading-snug truncate ${dark ? "text-gray-400" : "text-gray-700"}`}>{r.title}</p>
                  <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-600" : "text-gray-400"}`}>{r.meta}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {demoFlow?.diagnosisComplete && additionalMessages.length === 0 && !isStreamingResponse && (
          <div className={`border rounded-xl p-4 mt-4 ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <OpportunIQLogo className="w-4 h-4 text-blue-600" />
              <span className={`text-sm font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>Cost Comparison</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${hasDiyContent ? "bg-blue-50 border-blue-200" : dark ? "bg-white/[0.04] border-white/10" : "bg-white border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <IoHammerOutline className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600">DIY Cost</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {issue.diyCost > 0 ? `$${issue.diyCost.toFixed(2)}` : "N/A"}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <IoPeople className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600">Pro Cost</span>
                </div>
                <p className={`text-lg font-bold ${dark ? "text-gray-200" : "text-gray-900"}`}>${issue.proCost.toFixed(0)}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="shrink-0">
        <div className="p-4">
          {availableSuggestions.length > 0 && !isAnyStreaming && demoFlow?.diagnosisComplete && (
            <div className="flex flex-wrap gap-2 mb-2">
              {availableSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-3 py-1.5 text-xs rounded-full transition-colors border ${
                    dark
                      ? "text-gray-500 bg-transparent border-white/10 hover:border-blue-500/40 hover:text-blue-400"
                      : "text-gray-400 bg-white border-gray-200 hover:border-blue-200 hover:text-blue-600"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className={`rounded-2xl border focus-within:border-blue-500/50 transition-colors ${dark ? "bg-[#252525] border-white/10" : "bg-white border-gray-200"}`}>
            <textarea
              placeholder="Ask a follow-up question..."
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isAnyStreaming}
              rows={1}
              className={`w-full px-4 py-3 bg-transparent text-sm focus:outline-none resize-none disabled:opacity-50 placeholder:text-gray-500 ${dark ? "text-gray-200" : "text-gray-900"}`}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <IoCamera className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Take photo</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <IoVideocam className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Record video</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                      <IoMic className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Voice note</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
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
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
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
