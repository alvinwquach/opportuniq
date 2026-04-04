"use client";

import { useState, useEffect, useRef } from "react";
import { IoChatbubble, IoSend, IoChevronBack, IoChevronForward, IoLogOut } from "react-icons/io5";
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ChatSession {
  sessionId: string;
  userId: string;
  userName: string | null;
  userEmail: string;
  userAvatarUrl: string | null;
  lastMessageAt: Date;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string | null;
  content: string;
  isFromSupport: boolean;
  supportName: string | null;
  createdAt: Date;
  readAt: string | null;
}

interface OnlineAdmin {
  name: "Alvin" | "Kevin";
  email: string;
}

interface SupportChatRoomProps {
  initialSessions: ChatSession[];
  initialUnreadCount: number;
  onlineAdmins?: OnlineAdmin[];
  currentAdmin?: "Alvin" | "Kevin";
}

export function SupportChatRoom({
  initialSessions,
  initialUnreadCount,
  onlineAdmins = [],
  currentAdmin,
}: SupportChatRoomProps) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    initialSessions[0]?.userId || null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [onlineAdminsState, setOnlineAdminsState] = useState<OnlineAdmin[]>(onlineAdmins || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when user is selected
  useEffect(() => {
    if (!selectedUserId) return;

    loadMessages(selectedUserId);

    // Subscribe to new messages for this user
    const channel = supabase
      .channel(`support:${selectedUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `sender_id=eq.${selectedUserId} OR recipient_id=eq.${selectedUserId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Update unread count if message is from user
          if (!newMessage.isFromSupport && selectedUserId === newMessage.senderId) {
            setSessions((prev) =>
              prev.map((s) =>
                s.userId === selectedUserId
                  ? { ...s, unreadCount: 0, lastMessageAt: new Date(newMessage.createdAt) }
                  : s
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId]);

  // Subscribe to new sessions and message updates
  useEffect(() => {
    const channel = supabase
      .channel("support:updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_sessions",
        },
        async () => {
          // Reload sessions when new session created
          const response = await fetch("/api/admin/support/sessions");
          if (response.ok) {
            const data = await response.json();
            setSessions(data.sessions || []);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: "is_from_support=false",
        },
        async () => {
          // Reload sessions to update unread counts
          const response = await fetch("/api/admin/support/sessions");
          if (response.ok) {
            const data = await response.json();
            setSessions(data.sessions || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async (userId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/admin/support/messages?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedUserId || isSending) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch("/api/admin/support/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUserId: selectedUserId,
          content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to send message");
        setInputValue(content);
      }
    } catch (error) {
      alert("Failed to send message. Please try again.");
      setInputValue(content);
    } finally {
      setIsSending(false);
    }
  };

  const selectedSession = sessions.find((s) => s.userId === selectedUserId);
  const totalUnread = sessions.reduce((sum, s) => sum + s.unreadCount, 0);

  return (
    <div className="flex h-screen bg-[#0c0c0c]">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r border-[#1f1f1f] bg-[#0c0c0c] transition-all duration-200 flex flex-col",
          sidebarCollapsed ? "w-16" : "w-80"
        )}
      >
        {/* Header */}
        <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#1f1f1f] flex items-center justify-center">
                <OpportunIQLogo className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-[13px] font-semibold text-white">Support</h1>
                <p className="text-[10px] text-[#666]">
                  {totalUnread > 0 ? `${totalUnread} unread` : "All caught up"}
                </p>
                {onlineAdminsState.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-400">
                      {onlineAdminsState.map(a => a.name).join(", ")} online
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {!sidebarCollapsed && (
              <Link
                href="/auth/logout"
                className="p-1.5 rounded-md text-[#666] hover:text-white hover:bg-[#1f1f1f] transition-colors"
                title="Sign out"
              >
                <IoLogOut className="h-4 w-4" />
              </Link>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md text-[#666] hover:text-white hover:bg-[#1f1f1f] transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <IoChevronForward className="h-4 w-4" />
              ) : (
                <IoChevronBack className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-center">
              <IoChatbubble className="w-8 h-8 text-[#666] mx-auto mb-2" />
              <p className="text-[13px] text-[#666]">No active chats</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.userId}
                  onClick={() => setSelectedUserId(session.userId)}
                  className={cn(
                    "w-full p-3 rounded-lg transition-colors text-left",
                    selectedUserId === session.userId
                      ? "bg-[#1f1f1f]"
                      : "hover:bg-[#161616]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {session.userAvatarUrl ? (
                      <Image
                        src={session.userAvatarUrl}
                        alt={session.userName || session.userEmail}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[13px] font-medium text-[#888] flex-shrink-0">
                        {(session.userName || session.userEmail).charAt(0).toUpperCase()}
                      </div>
                    )}
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[13px] font-medium text-white truncate">
                            {session.userName || "No name"}
                          </p>
                          {session.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#00F0FF] text-black text-[10px] font-bold min-w-[18px] text-center">
                              {session.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#666] truncate">
                          {session.userEmail}
                        </p>
                        <p className="text-[10px] text-[#555] mt-1">
                          {new Date(session.lastMessageAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId && selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-6 bg-[#0c0c0c]">
              <div className="flex items-center gap-3">
                {selectedSession.userAvatarUrl ? (
                  <Image
                    src={selectedSession.userAvatarUrl}
                    alt={selectedSession.userName || selectedSession.userEmail}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[11px] font-medium text-[#888]">
                    {(selectedSession.userName || selectedSession.userEmail)
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-white">
                    {selectedSession.userName || "No name"}
                  </p>
                  <p className="text-[11px] text-[#666]">{selectedSession.userEmail}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0c0c0c]">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-[#666] text-[13px]">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <IoChatbubble className="w-12 h-12 text-[#666] mb-3" />
                  <p className="text-[13px] text-[#666] mb-1">No messages yet</p>
                  <p className="text-[11px] text-[#555]">
                    Start the conversation with {selectedSession.userName || "this user"}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.isFromSupport ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg p-4",
                        message.isFromSupport
                          ? "bg-[#00F0FF] text-black"
                          : "bg-[#1f1f1f] text-white"
                      )}
                    >
                      {message.isFromSupport && message.supportName && (
                        <p className="text-[10px] font-medium mb-1 opacity-70">
                          {message.supportName}
                        </p>
                      )}
                      <p className="text-[13px] whitespace-pre-wrap">{message.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="h-20 border-t border-[#1f1f1f] p-4 bg-[#0c0c0c]"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isSending}
                  className="flex-1 h-12 px-4 rounded-lg bg-[#161616] border border-[#1f1f1f] text-[13px] text-white placeholder:text-[#555] focus:outline-none focus:border-white/[0.1] transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className="h-12 w-12 rounded-lg bg-[#00F0FF] text-black hover:bg-[#00D4E5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <IoSend className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <IoChatbubble className="w-16 h-16 text-[#666] mx-auto mb-4" />
              <p className="text-[15px] text-[#666]">Select a chat to start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

