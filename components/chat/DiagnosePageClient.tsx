"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChatHistorySidebar } from "./ChatHistorySidebar";
import { DiagnosisChat } from "./DiagnosisChat";
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
        <DiagnosisChat
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
      {mounted && createPortal(
        <button
          onClick={() => setChatSidebarCollapsed(!chatSidebarCollapsed)}
          className={cn(
            "hidden lg:flex fixed top-[60px] z-[60] h-[30px] w-[30px] rounded-md items-center justify-center text-[#888] hover:text-white hover:bg-[#1f1f1f] transition-all duration-300",
            chatSidebarCollapsed ? "right-4 cursor-w-resize" : "right-[272px] cursor-e-resize"
          )}
          title={chatSidebarCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {chatSidebarCollapsed ? (
            <TbLayoutSidebarRightExpand className="w-[18px] h-[18px]" />
          ) : (
            <TbLayoutSidebarRightCollapse className="w-[18px] h-[18px]" />
          )}
        </button>,
        document.body
      )}
      <div
        className={cn(
          "flex-shrink-0 transition-all duration-300 ease-out",
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
