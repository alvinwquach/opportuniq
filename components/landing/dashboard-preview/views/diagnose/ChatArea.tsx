"use client";

import { useState, useEffect } from "react";
import {
  IoCamera,
  IoMic,
  IoAttach,
  IoSend,
  IoVideocam,
  IoPeople,
} from "react-icons/io5";
import { IoHammerOutline } from "react-icons/io5";
import { OpportunIQLogo } from "../../../OpportunIQLogo";
import type { IssueData } from "./types";

const WELCOME_MESSAGE = "Hey! I'm here to help you diagnose issues, plan DIY projects, or find the right professional for the job. Describe what you're working on, share a photo, or use voice in any language.";

interface ChatAreaProps {
  issue: IssueData | null;
  isCreatingNewIssue: boolean;
}

export function ChatArea({ issue, isCreatingNewIssue }: ChatAreaProps) {
  const [messageInput, setMessageInput] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const [isTypingWelcome, setIsTypingWelcome] = useState(false);

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

  if (isCreatingNewIssue) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
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
        <div className="p-4 border-t border-white/[0.06]">
          <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] focus-within:border-emerald-500/50 transition-colors">
            <input
              type="text"
              placeholder="Describe your issue..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="w-full px-4 py-3 bg-transparent text-[15px] text-white placeholder:text-[#555] focus:outline-none"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <button
                type="button"
                className="p-2 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors"
                title="Attach photo or video"
              >
                <IoAttach className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2.5 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors"
                  title="Voice message"
                >
                  <IoMic className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full transition-colors"
                >
                  <IoSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Issue Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
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
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {issue.chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%]">
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
                {msg.hasImage && (
                  <div className="flex items-center gap-2 text-xs opacity-80 mb-2 pb-2 border-b border-white/20">
                    <IoCamera className="w-4 h-4" />
                    <span>Photo attached</span>
                  </div>
                )}
                {msg.hasVoice && (
                  <div className="flex items-center gap-2 text-xs opacity-80 mb-2 pb-2 border-b border-white/20">
                    <IoMic className="w-4 h-4" />
                    <span>Voice note transcribed</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Diagnosis Summary Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <OpportunIQLogo className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Diagnosis Summary</span>
          </div>
          <p className="text-sm text-[#ccc] mb-4">{issue.diagnosis}</p>

          {/* Cost Comparison */}
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
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="Take photo">
            <IoCamera className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="Record video">
            <IoVideocam className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="Voice note">
            <IoMic className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors" title="Attach file">
            <IoAttach className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Ask a follow-up question..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-emerald-500/50"
          />
          <button className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors">
            <IoSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
