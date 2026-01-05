"use client";

import { useState } from "react";
import { IoAdd, IoTrash, IoEllipsisVertical, IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";
import {
  useConversations,
  useDeleteConversation,
  type Conversation,
} from "@/hooks/useConversations";
import { trackDiagnosisConversationViewed } from "@/lib/analytics";

interface ChatHistorySidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string | null) => void;
  onNewChat: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete();
      setConfirmDelete(false);
      setShowMenu(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-[#5eead4]/10 text-white"
          : "text-[#888] hover:bg-[#1a1a1a] hover:text-white"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {conversation.title || "New Diagnosis"}
        </p>
        <p className="text-xs text-[#666] truncate">
          {formatRelativeDate(conversation.lastMessageAt)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
          setConfirmDelete(false);
        }}
        className={cn(
          "p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
          showMenu && "opacity-100",
          "hover:bg-[#2a2a2a]"
        )}
      >
        <IoEllipsisVertical className="w-4 h-4" />
      </button>
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              setConfirmDelete(false);
            }}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handleDelete}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors",
                confirmDelete
                  ? "bg-red-500/20 text-red-400"
                  : "text-[#888] hover:bg-[#2a2a2a] hover:text-red-400"
              )}
            >
              {confirmDelete ? (
                <>
                  <IoCheckmark className="w-4 h-4" />
                  Confirm delete
                </>
              ) : (
                <>
                  <IoTrash className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </>
      )}
      {conversation.severity && (
        <div
          className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            conversation.severity === "urgent" || conversation.severity === "emergency"
              ? "bg-red-500"
              : conversation.severity === "moderate"
              ? "bg-yellow-500"
              : "bg-green-500"
          )}
        />
      )}
    </div>
  );
}

export function ChatHistorySidebar({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
}: ChatHistorySidebarProps) {
  const { data, isLoading, error } = useConversations();
  const deleteConversation = useDeleteConversation();

  const handleDelete = async (conversationId: string) => {
    await deleteConversation.mutateAsync(conversationId);
    if (currentConversationId === conversationId) {
      onNewChat();
    }
  };

  return (
    <aside className="relative flex flex-col h-full bg-[#0c0c0c] border-l border-[#1f1f1f] overflow-hidden">
      <div className="p-3 border-b border-[#1f1f1f] flex-shrink-0">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-[#5eead4] text-black font-medium text-sm hover:bg-[#4fd1c5] transition-colors"
        >
          <IoAdd className="w-5 h-5" />
          New Diagnosis
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0 scrollbar-dark">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#5eead4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-[#888] text-sm text-center py-4">
            Failed to load conversations
          </p>
        ) : !data?.conversations.length ? (
          <p className="text-[#666] text-sm text-center py-8 px-4">
            No conversations yet. Start a new diagnosis!
          </p>
        ) : (
          data.conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === currentConversationId}
              onSelect={() => {
                trackDiagnosisConversationViewed({
                  conversationId: conversation.id,
                  messageCount: conversation.messageCount || 0,
                  category: conversation.category,
                  severity: conversation.severity,
                });
                onSelectConversation(conversation.id);
              }}
              onDelete={() => handleDelete(conversation.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
