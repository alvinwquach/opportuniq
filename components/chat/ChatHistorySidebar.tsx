"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoAdd, IoTrash, IoEllipsisVertical, IoCheckmark, IoChevronForward } from "react-icons/io5";
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
  onDelete,
}: {
  conversation: Conversation;
  isActive: boolean;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
    <Link
      href={`/dashboard/projects/${conversation.id}`}
      onClick={() => {
        trackDiagnosisConversationViewed({
          conversationId: conversation.id,
          messageCount: conversation.messageCount || 0,
          category: conversation.category,
          severity: conversation.severity,
        });
      }}
      className={cn(
        "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
        isActive
          ? "bg-[#5eead4]/10 text-gray-900"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {conversation.title || "New Diagnosis"}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {formatRelativeDate(conversation.lastMessageAt)}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowMenu(!showMenu);
          setConfirmDelete(false);
        }}
        className={cn(
          "p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
          showMenu && "opacity-100",
          "hover:bg-gray-100"
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
              e.preventDefault();
              setShowMenu(false);
              setConfirmDelete(false);
            }}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={handleDelete}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors",
                confirmDelete
                  ? "bg-red-500/20 text-red-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-red-600"
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
    </Link>
  );
}

export function ChatHistorySidebar({
  currentConversationId,
  onSelectConversation,
  onNewChat,
  isCollapsed,
  onToggleCollapse,
}: ChatHistorySidebarProps) {
  const router = useRouter();
  const { data, isLoading, error } = useConversations();
  const deleteConversation = useDeleteConversation();

  const handleDelete = async (conversationId: string) => {
    await deleteConversation.mutateAsync(conversationId);
    if (currentConversationId === conversationId) {
      // Navigate to new diagnosis page after deleting current conversation
      router.push("/dashboard/projects");
    }
  };

  return (
    <aside className="relative flex flex-col h-full bg-gray-50 border-l border-gray-200 overflow-hidden">
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            title="Hide history"
          >
            <IoChevronForward className="w-4 h-4" />
          </button>
          <Link
            href="/dashboard/projects"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#5eead4] text-black font-medium text-sm hover:bg-[#4fd1c5] transition-colors"
          >
            <IoAdd className="w-5 h-5" />
            New Diagnosis
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0 scrollbar-dark">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#5eead4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Failed to load conversations
          </p>
        ) : !data?.conversations.length ? (
          <p className="text-gray-400 text-sm text-center py-8 px-4">
            No conversations yet. Start a new diagnosis!
          </p>
        ) : (
          data.conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === currentConversationId}
              onDelete={() => handleDelete(conversation.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
