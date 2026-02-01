"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { IoAdd, IoConstruct, IoHammerOutline, IoPeople } from "react-icons/io5";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import {
  DiagnoseSkeleton,
  IssuesSidebar,
  WelcomeMessage,
  ChatInput,
  ChatMessages,
  HistoricalChatMessages,
  ResourcePanel,
  IssueIcon,
  getIconBgColor,
} from "./components";
import { useDiagnosePageData } from "@/lib/graphql/hooks/diagnose";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/graphql/keys";
import { useChatState, type Message } from "@/hooks/useChatState";
import { useChatStream } from "@/hooks/useChatStream";

export function DiagnoseClient() {
  const { data, isLoading, error } = useDiagnosePageData();
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if we should start in new issue mode (from topbar button)
  const shouldStartNewIssue = searchParams.get("new") === "true";

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isCreatingNewIssue, setIsCreatingNewIssue] = useState(shouldStartNewIssue);

  // Clear the query param once we've read it
  useEffect(() => {
    if (shouldStartNewIssue) {
      router.replace("/dashboard/diagnose", { scroll: false });
    }
  }, [shouldStartNewIssue, router]);

  // Chat state
  const chatState = useChatState(null);
  const {
    state: { messages, followUpInput, activeConversationId, isStreaming, streamingContent },
    setFollowUpInput,
    addMessage,
    startStreaming,
    updateStreamingContent,
    finishStreaming,
    stopStreaming,
    setError,
    setConversationId,
  } = chatState;

  const { streamResponse, stop } = useChatStream({
    activeConversationId,
    onConversationCreated: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.diagnose.all() });
    },
    addMessage,
    startStreaming,
    updateStreamingContent,
    finishStreaming,
    stopStreaming,
    setError,
    setConversationId,
    clearMedia: () => {},
  });

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Get data
  const issues = data?.issues ?? [];
  const currentIssue = selectedIssueId
    ? data?.currentIssue?.id === selectedIssueId
      ? data.currentIssue
      : null
    : data?.currentIssue ?? null;

  // Handlers
  const handleSelectIssue = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setIsCreatingNewIssue(false);
  }, []);

  const handleCreateNewIssue = useCallback(() => {
    setIsCreatingNewIssue(true);
    setSelectedIssueId(null);
  }, []);

  const handleSendMessage = useCallback(
    async (message: string, attachments: File[]) => {
      const attachmentLabels = attachments.map((file) =>
        file.type.startsWith("image/") ? "Photo attached" : "Video attached"
      );
      const messageContent =
        attachmentLabels.length > 0
          ? `${attachmentLabels.join(", ")}${message.trim() ? `\n\n${message}` : ""}`
          : message;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: messageContent,
      };

      const attachmentData = await Promise.all(
        attachments.map(async (file) => {
          return new Promise<{ type: string; name: string; data: string }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                type: file.type,
                name: file.name,
                data: reader.result as string,
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      const requestBody = {
        type: "structured" as const,
        diagnosis: {
          issue: {
            category: "other",
            description: message || "Please analyze the attached media",
            location: "",
            symptomsObserved: [],
          },
          property: {
            type: "house",
            yearBuilt: 2000,
            postalCode: "",
          },
          preferences: {
            diySkillLevel: "intermediate",
            urgency: "flexible",
            budgetRange: "unsure",
            hasBasicTools: true,
            prefersDIY: true,
          },
          attachments: attachmentData,
        },
        conversationId: activeConversationId,
      };

      await streamResponse(requestBody, userMessage);
    },
    [activeConversationId, streamResponse]
  );

  const handleFollowUp = useCallback(
    async (message: string) => {
      if (!message.trim() || !activeConversationId) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      };

      const requestBody = {
        type: "followup" as const,
        conversationId: activeConversationId,
        message,
      };

      setFollowUpInput("");
      await streamResponse(requestBody, userMessage);
    },
    [activeConversationId, streamResponse, setFollowUpInput]
  );

  if (isLoading) {
    return <DiagnoseSkeleton />;
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-48px)] bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load diagnose data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 right-0 bottom-0 top-0 lg:top-[48px] lg:left-[56px] bg-[#0f0f0f] flex overflow-hidden z-20 border-t border-white/[0.06]">
      {/* Left Column - Issue History */}
      <IssuesSidebar
        issues={issues}
        currentIssueId={currentIssue?.id ?? null}
        isCreatingNewIssue={isCreatingNewIssue}
        onSelectIssue={handleSelectIssue}
        onCreateNewIssue={handleCreateNewIssue}
      />

      {/* Center Column - Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {isCreatingNewIssue ? (
          <>
            {/* Chat Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-4">
                <WelcomeMessage shouldAnimate={messages.length === 0} />
                <ChatMessages
                  messages={messages}
                  streamingContent={streamingContent}
                  isStreaming={isStreaming}
                />
              </div>
            </div>

            <ChatInput
              onSend={handleSendMessage}
              isStreaming={isStreaming}
              onStop={stop}
            />
          </>
        ) : currentIssue ? (
          <>
            {/* Issue Header */}
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    currentIssue.isResolved ? "bg-emerald-500/20" : getIconBgColor(currentIssue.icon)
                  }`}
                >
                  <IssueIcon
                    iconName={currentIssue.icon}
                    className={`w-5 h-5 ${
                      currentIssue.isResolved ? "text-emerald-400" : currentIssue.iconColor
                    }`}
                  />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{currentIssue.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-[#888]">
                    <span>{new Date(currentIssue.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span
                      className={
                        currentIssue.difficulty === "Easy"
                          ? "text-emerald-400"
                          : currentIssue.difficulty.includes("Professional")
                          ? "text-red-400"
                          : "text-amber-400"
                      }
                    >
                      {currentIssue.difficulty}
                    </span>
                    <span>·</span>
                    <span>{currentIssue.confidence}% confident</span>
                  </div>
                </div>
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  currentIssue.isResolved
                    ? "bg-[#2a2a2a] text-[#888]"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {currentIssue.isResolved ? "Resolved" : "Active"}
              </span>
            </div>

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              <HistoricalChatMessages messages={currentIssue.chatMessages} />
              <ChatMessages
                messages={messages}
                streamingContent={streamingContent}
                isStreaming={isStreaming}
              />

              {/* Diagnosis Summary */}
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <OpportunIQLogo className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">Diagnosis Summary</span>
                </div>
                <p className="text-sm text-[#ccc] mb-4">
                  {currentIssue.diagnosis ?? "Analyzing issue..."}
                </p>

                {/* Cost Comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-lg border ${
                      (currentIssue.parts?.length ?? 0) > 0
                        ? "bg-emerald-500/10 border-emerald-500/20"
                        : "bg-[#0f0f0f] border-[#2a2a2a]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IoHammerOutline className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400">DIY Cost</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">
                      {currentIssue.diyCost ? `$${currentIssue.diyCost.toFixed(2)}` : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <IoPeople className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-blue-400">Pro Cost</span>
                    </div>
                    <p className="text-lg font-bold text-white">
                      {currentIssue.proCost ? `$${currentIssue.proCost.toFixed(0)}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-up Input */}
            <ChatInput
              onSend={(msg) => handleFollowUp(msg)}
              isStreaming={isStreaming}
              onStop={stop}
              placeholder="Ask a follow-up question..."
            />
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <IoConstruct className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No Issues Yet</h2>
              <p className="text-[#888] mb-6">
                Start by reporting a home maintenance issue. We&apos;ll help diagnose the problem
                and find the best solution.
              </p>
              <button
                onClick={handleCreateNewIssue}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors mx-auto"
              >
                <IoAdd className="w-5 h-5" />
                Report New Issue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Resources */}
      <ResourcePanel issue={currentIssue} />
    </div>
  );
}
