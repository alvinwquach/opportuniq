"use client";

import { IoCamera, IoMic } from "react-icons/io5";
import { SiOpenai } from "react-icons/si";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import type { Message } from "@/hooks/useChatState";

interface ChatMessagesProps {
  messages: Message[];
  streamingContent: string;
  isStreaming: boolean;
}

function formatMessageContent(content: string) {
  return content.split(/(\*\*.*?\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function ChatMessages({ messages, streamingContent, isStreaming }: ChatMessagesProps) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className="max-w-[85%]">
            {message.role === "assistant" && (
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <OpportunIQLogo className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">OpportunIQ</span>
              </div>
            )}
            <div
              className={`px-4 py-3 rounded-2xl ${
                message.role === "user"
                  ? "bg-blue-600 text-gray-900 rounded-br-md"
                  : "bg-gray-100 text-gray-700 border border-gray-200 rounded-bl-md"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">
                {formatMessageContent(message.content)}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Streaming response */}
      {isStreaming && (
        <div className="flex justify-start">
          <div className="max-w-[85%]">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <OpportunIQLogo className="w-4 h-4 text-blue-600 animate-pulse" />
              </div>
              <span className="text-xs text-gray-500">OpportunIQ</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-700 border border-gray-200 rounded-bl-md">
              {streamingContent ? (
                <p className="text-sm whitespace-pre-wrap">
                  {formatMessageContent(streamingContent)}
                  <span className="inline-block w-2 h-4 bg-blue-400 ml-0.5 animate-pulse" />
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// For historical chat messages that have additional metadata
interface HistoricalMessage {
  id: string;
  role: string;
  content: string;
  hasImage: boolean;
  hasVoice: boolean;
  visionAnalysis: boolean;
}

interface HistoricalChatMessagesProps {
  messages: HistoricalMessage[];
}

export function HistoricalChatMessages({ messages }: HistoricalChatMessagesProps) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div className="max-w-[75%]">
            {message.role === "assistant" && (
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <OpportunIQLogo className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">OpportunIQ</span>
              </div>
            )}
            <div
              className={`px-4 py-3 rounded-2xl ${
                message.role === "user"
                  ? "bg-blue-600 text-gray-900 rounded-br-md"
                  : "bg-gray-100 text-gray-700 border border-gray-200 rounded-bl-md"
              }`}
            >
              {message.hasImage && (
                <div className="flex items-center gap-2 text-xs opacity-80 mb-2 pb-2 border-b border-white/20">
                  <IoCamera className="w-4 h-4" />
                  <span>Photo attached</span>
                </div>
              )}
              {message.hasVoice && (
                <div className="flex items-center gap-2 text-xs opacity-80 mb-2 pb-2 border-b border-white/20">
                  <IoMic className="w-4 h-4" />
                  <span>Voice note transcribed</span>
                </div>
              )}
              {message.visionAnalysis && (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full w-fit">
                  <SiOpenai className="w-3.5 h-3.5" />
                  <span>Vision Analysis</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">
                {formatMessageContent(message.content)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
