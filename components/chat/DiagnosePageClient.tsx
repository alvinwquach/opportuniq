"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { IssueChat } from "./IssueChat";
import { useOptimisticConversation } from "@/hooks/useConversations";
import { useSidebar } from "@/app/dashboard/components/SidebarContext";
import { IoMenu, IoClose } from "react-icons/io5";
import { TbLayoutSidebarRightCollapse, TbLayoutSidebarRightExpand } from "react-icons/tb";
import { cn } from "@/lib/utils";

interface DiagnosePageClientProps {
  userId: string;
  userName?: string | null;
  userPostalCode?: string | null;
}

export function DiagnosePageClient({ userId, userName, userPostalCode }: DiagnosePageClientProps) {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatSidebarCollapsed, setChatSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { invalidateConversations, updateConversationTitle } = useOptimisticConversation();
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewChat = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  const handleSelectConversation = useCallback((conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  }, []);

  // Called when a new conversation is created
  const handleConversationCreated = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
    // Invalidate to refetch the conversations list
    invalidateConversations();
  }, [invalidateConversations]);

  // Called when conversation title is updated (after AI response)
  const handleTitleUpdated = useCallback((conversationId: string, title: string) => {
    updateConversationTitle(conversationId, title);
  }, [updateConversationTitle]);

  return (
    <div
      className={cn(
        "fixed inset-0 flex overflow-hidden bg-[#0c0c0c] transition-[left] duration-200 ease-out",
        "lg:top-12",
        isCollapsed ? "lg:left-17" : "lg:left-56"
      )}
    >
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 right-4 z-50 p-2 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] text-white"
      >
        {sidebarOpen ? <IoClose className="w-5 h-5" /> : <IoMenu className="w-5 h-5" />}
      </button>
      <div className={cn(
        "flex-1 min-w-0 h-full overflow-hidden transition-all duration-300",
        chatSidebarCollapsed ? "lg:mr-0" : "lg:mr-64"
      )}>
        <IssueChat
          key={currentConversationId || "new"}
          userId={userId}
          userName={userName}
          userPostalCode={userPostalCode}
          conversationId={currentConversationId}
          onConversationCreated={handleConversationCreated}
          onTitleUpdated={handleTitleUpdated}
        />
      </div>
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
{}
      {chatSidebarCollapsed && (
        <button
          onClick={() => setChatSidebarCollapsed(false)}
          className="fixed top-1/2 -translate-y-1/2 right-0 z-[100] py-4 px-1 rounded-l-lg bg-[#1a1a1a] border border-r-0 border-[#2a2a2a] text-[#888] hover:text-[#5eead4] hover:bg-[#2a2a2a] transition-colors"
          title="Show history"
        >
          <TbLayoutSidebarRightExpand className="w-4 h-4" />
        </button>
      )}

      <div
        className={cn(
          "shrink-0 transition-all duration-300 ease-out",
          "fixed top-0 bottom-0 right-0 z-40",
          "lg:top-12 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
          chatSidebarCollapsed ? "lg:w-0 w-64" : "w-64"
        )}
      >
        <div className={cn(
          "h-full w-64 transition-all duration-300",
          chatSidebarCollapsed ? "lg:opacity-0 lg:pointer-events-none lg:translate-x-full" : "opacity-100 translate-x-0"
        )}>
          <ChatHistorySidebar
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
            isCollapsed={chatSidebarCollapsed}
            onToggleCollapse={() => setChatSidebarCollapsed(!chatSidebarCollapsed)}
          />
        </div>
      </div>
    </div>
  );
}
