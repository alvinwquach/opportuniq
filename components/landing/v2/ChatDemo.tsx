"use client";

import { IoSearch, IoLocation, IoMail } from "react-icons/io5";

interface ChatMessage {
  type: "user" | "ai" | "tool" | "tool-result";
  content: string;
  icon?: React.ReactNode;
}

const chatSequence: ChatMessage[] = [
  {
    type: "user",
    content: "My ceiling has water stains and it's getting bigger",
  },
  {
    type: "ai",
    content:
      "Based on the spreading pattern, this indicates an active leak above the drywall. Brown rings suggest ongoing moisture — address within 2 weeks to prevent mold.",
  },
  {
    type: "tool",
    content: "Checking cost data...",
    icon: <IoSearch className="w-3 h-3" />,
  },
  {
    type: "tool-result",
    content: "Professional: $350–$800 · DIY: $80–$150",
  },
  {
    type: "tool",
    content: "Finding contractors near 94102...",
    icon: <IoLocation className="w-3 h-3" />,
  },
  {
    type: "tool-result",
    content: "3 plumbers found · Avg 4.6★",
  },
  {
    type: "tool",
    content: "Drafting quote request...",
    icon: <IoMail className="w-3 h-3" />,
  },
  {
    type: "tool-result",
    content: "Email ready — send via Gmail",
  },
];

export function ChatDemo() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Chat window */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60 overflow-hidden">
        {/* Window header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          </div>
          <span className="text-xs text-gray-400 ml-2 font-medium">
            OpportunIQ — Diagnose
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-emerald-500 font-medium">Live</span>
          </div>
        </div>

        {/* Chat body */}
        <div className="p-4 space-y-3 min-h-[340px] max-h-[380px] overflow-hidden bg-white">
          {chatSequence.map((msg, i) => (
            <div key={i}>
              {msg.type === "user" && (
                <div className="flex justify-end">
                  <div className="bg-blue-600 rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[85%]">
                    <p className="text-sm text-white">{msg.content}</p>
                  </div>
                </div>
              )}

              {msg.type === "ai" && (
                <div className="flex justify-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[8px] text-white font-bold">AI</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[88%]">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              )}

              {msg.type === "tool" && (
                <div className="flex justify-start pl-8">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="text-gray-400">{msg.icon}</span>
                    <span className="text-xs text-gray-500 font-mono">{msg.content}</span>
                  </div>
                </div>
              )}

              {msg.type === "tool-result" && (
                <div className="flex justify-start pl-8">
                  <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-700 font-medium">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-400 flex-1">Describe your issue or upload a photo...</span>
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle shadow glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/40 via-transparent to-teal-100/40 rounded-3xl blur-2xl -z-10" />
    </div>
  );
}
