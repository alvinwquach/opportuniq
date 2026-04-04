// Tell React and Next.js to run this component in the browser (client-side).
// Without this, hooks like useState/useEffect/useRef/useCallback wouldn't work.
"use client";

// useState    = track pieces of UI state (selected issue ID, whether we're in "new issue" mode).
// useRef      = get a direct reference to the chat scroll container DOM element so we can
//               scroll it to the bottom programmatically.
// useEffect   = run side-effects after render (clearing the URL query param; auto-scrolling).
// useCallback = memoize event handler functions so they don't get recreated on every render,
//               which is important because they're passed as props to child components.
import { useState, useRef, useEffect, useCallback } from "react";

// useSearchParams = read URL query parameters (e.g. ?new=true) from the current URL.
// useRouter       = programmatically navigate / update the URL without a full page reload.
import { useSearchParams, useRouter } from "next/navigation";

// Icon components from react-icons Ionicons 5 set.
// IoAdd          = "+" icon on the "Report New Issue" button in the empty state.
// IoConstruct    = wrench/build icon used in the empty state and issue header.
// IoHammerOutline = hammer icon on the "DIY Cost" panel in the diagnosis summary.
// IoPeople       = people icon on the "Pro Cost" panel in the diagnosis summary.
import { IoAdd, IoConstruct, IoHammerOutline, IoPeople } from "react-icons/io5";

// The OpportunIQ logo shown as a small icon in the "Diagnosis Summary" section header.
import { OpportunIQLogo } from "@/components/landing/OpportunIQLogo";

// Import every sub-component used in the diagnose page layout.
// DiagnoseSkeleton      = loading placeholder shown while data is fetching.
// IssuesSidebar         = left panel listing all past issues with a "New Issue" button.
// WelcomeMessage        = animated welcome/intro text shown at the top of a new chat.
// ChatInput             = the text/media input bar at the bottom of the center column.
// ChatMessages          = renders the list of AI and user messages for the current session.
// HistoricalChatMessages = renders the saved chat messages from a previously completed issue.
// ResourcePanel         = right panel showing guides, parts, and professional recommendations.
// IssueIcon             = dynamically renders the correct icon for an issue's category.
// getIconBgColor        = helper that returns the correct background color class for an icon.
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

// useDiagnosePageData = TanStack Query hook that fetches the issues list and the
// currently selected issue's full detail. Returns { data, isLoading, error }.
import { useDiagnosePageData } from "@/lib/hooks/diagnose";

// useQueryClient = gives access to the TanStack Query cache so we can manually
// invalidate (expire) cached data after the AI creates a new issue.
import { useQueryClient } from "@tanstack/react-query";

// queryKeys = centralized registry of query cache keys to avoid typos and keep
// invalidation calls consistent.
import { queryKeys } from "@/lib/hooks/keys";

// useChatState = custom hook that manages the full state of the AI chat:
//   messages, streaming content, conversation ID, follow-up input, etc.
// Message     = TypeScript type for a single chat message (id, role, content).
import { useChatState, type Message } from "@/hooks/useChatState";

// useChatStream = custom hook that handles the streaming AI response: opens a
// server-sent event connection, feeds chunks to updateStreamingContent, and
// calls finishStreaming when the AI is done writing.
import { useChatStream } from "@/hooks/useChatStream";

// DiagnoseClient is the page-level shell for the AI diagnosis feature.
// It manages: data fetching, chat state, streaming, issue selection, and
// passes everything down to the three-column layout (sidebar | chat | resources).
export function DiagnoseClient() {
  // Fetch all issues + the first/current issue's full details from the server.
  // isLoading = true while fetching; error = set if it fails; data = result on success.
  const { data, isLoading, error } = useDiagnosePageData();

  // Access the TanStack Query cache client for manual invalidation after mutations.
  const queryClient = useQueryClient();

  // A ref to the chat scroll container div. We use this to programmatically scroll
  // to the bottom whenever new messages arrive or the AI streams new content.
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Read the current URL's query parameters (e.g. ?new=true).
  const searchParams = useSearchParams();

  // Router for updating the URL without triggering a full page navigation.
  const router = useRouter();

  // Check if the user arrived with ?new=true in the URL, which means they clicked
  // "New Issue" from the top navigation bar and want to start a fresh diagnosis.
  const shouldStartNewIssue = searchParams.get("new") === "true";

  // The ID of the issue the user has selected from the sidebar, or null if none.
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Whether we're in "new issue" mode (showing the AI chat input for a fresh diagnosis)
  // vs. "view issue" mode (showing a past issue's history).
  // Initialized from the URL query param so the new-issue flow starts immediately.
  const [isCreatingNewIssue, setIsCreatingNewIssue] = useState(shouldStartNewIssue);

  // Side-effect: once we've read the ?new=true param and stored it in state,
  // remove it from the URL so refreshing the page doesn't re-trigger new-issue mode.
  useEffect(() => {
    if (shouldStartNewIssue) {
      // Replace the current history entry with the clean URL (no query params).
      // scroll: false prevents the page from jumping to the top.
      router.replace("/dashboard/diagnose", { scroll: false });
    }
  }, [shouldStartNewIssue, router]);

  // Initialize the chat state manager. Passing null means no active conversation yet.
  // The hook returns both the state object and all the action dispatchers.
  const chatState = useChatState(null);
  const {
    state: {
      messages,              // Array of Message objects shown in the chat area.
      followUpInput,         // The text in the follow-up input field.
      activeConversationId,  // The server-assigned ID for the current conversation thread.
      isStreaming,           // true while the AI is actively writing a response.
      streamingContent,      // The partial text the AI has streamed so far.
    },
    setFollowUpInput,        // Update the follow-up input field value.
    addMessage,              // Append a new Message to the messages array.
    startStreaming,          // Signal that streaming has begun (sets isStreaming = true).
    updateStreamingContent,  // Append a new chunk to streamingContent as it arrives.
    finishStreaming,          // Signal streaming is done; convert streamingContent to a message.
    stopStreaming,            // Abort the stream early (user clicked "Stop").
    setError,                // Store an error message in chat state.
    setConversationId,       // Store the server-returned conversation ID.
  } = chatState;

  // Set up the streaming hook that manages the actual HTTP/SSE connection to the AI API.
  // It receives all the chat state setters so it can drive the UI as chunks arrive.
  const { streamResponse, stop } = useChatStream({
    activeConversationId,
    // When the AI creates a new issue (conversation), invalidate the issues list cache
    // so the sidebar immediately shows the new issue without a page refresh.
    onConversationCreated: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.diagnose.all });
    },
    addMessage,
    startStreaming,
    updateStreamingContent,
    finishStreaming,
    stopStreaming,
    setError,
    setConversationId,
    // No media cleanup needed in this component (media is handled inside ChatInput).
    clearMedia: () => {},
  });

  // Side-effect: whenever messages or streamingContent changes (new message or new chunk),
  // scroll the chat container to the very bottom so the latest content is always visible.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // The list of past issues shown in the left sidebar.
  // Falls back to an empty array while loading so the sidebar renders safely.
  const issues = data?.issues ?? [];

  // The currently "active" issue for the detail/chat view.
  // If the user clicked a specific issue in the sidebar, try to use its data
  // from the pre-loaded currentIssue (which only holds the first/most-recent issue detail).
  // If the selected issue isn't the pre-loaded one, fall back to null (would need a separate fetch).
  const currentIssue = selectedIssueId
    ? data?.currentIssue?.id === selectedIssueId
      ? data.currentIssue
      : null
    : data?.currentIssue ?? null;

  // When the user clicks an issue in the sidebar: set the selected issue ID and
  // exit "new issue" mode to show the historical view instead.
  const handleSelectIssue = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setIsCreatingNewIssue(false);
  }, []);

  // When the user clicks "New Issue": enter "new issue" mode and deselect any current issue.
  const handleCreateNewIssue = useCallback(() => {
    setIsCreatingNewIssue(true);
    setSelectedIssueId(null);
  }, []);

  // Handle the user sending a new message (text + optional image/video attachments).
  // Builds the request body and kicks off the streaming AI call.
  const handleSendMessage = useCallback(
    async (message: string, attachments: File[]) => {
      // Build descriptive labels for any attached files ("Photo attached", "Video attached").
      const attachmentLabels = attachments.map((file) =>
        file.type.startsWith("image/") ? "Photo attached" : "Video attached"
      );
      // Combine attachment labels with the user's text into one display string.
      const messageContent =
        attachmentLabels.length > 0
          ? `${attachmentLabels.join(", ")}${message.trim() ? `\n\n${message}` : ""}`
          : message;

      // Create the user's chat bubble immediately (optimistic UI — don't wait for the server).
      const userMessage: Message = {
        id: `user-${Date.now()}`,  // Temporary client-side ID; server assigns a real one.
        role: "user",
        content: messageContent,
      };

      // Read each attachment file as a base64 data URL so it can be sent in the JSON body.
      const attachmentData = await Promise.all(
        attachments.map(async (file) => {
          return new Promise<{ type: string; name: string; data: string }>((resolve) => {
            const reader = new FileReader();
            // When reading is complete, resolve the promise with the base64 string.
            reader.onloadend = () => {
              resolve({
                type: file.type,
                name: file.name,
                data: reader.result as string,
              });
            };
            // Trigger the read; onloadend fires when done.
            reader.readAsDataURL(file);
          });
        })
      );

      // Build the structured request body for the AI diagnosis endpoint.
      const requestBody = {
        type: "structured" as const,  // Tells the API this is an initial structured diagnosis request.
        diagnosis: {
          issue: {
            category: "other",  // Category will be inferred by the AI from the description.
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
          // The base64 attachment data to be analyzed by the AI's vision model.
          attachments: attachmentData,
        },
        // Pass the current conversation ID so the AI can continue an existing thread.
        conversationId: activeConversationId,
      };

      // Send the message to the AI and begin streaming the response.
      await streamResponse(requestBody, userMessage);
    },
    [activeConversationId, streamResponse]
  );

  // Handle the user sending a follow-up question in an existing conversation.
  // Simpler than handleSendMessage: no file attachments, just text.
  const handleFollowUp = useCallback(
    async (message: string) => {
      // Guard: don't send empty messages or follow-ups without an active conversation.
      if (!message.trim() || !activeConversationId) return;

      // Create the user's chat bubble immediately.
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      };

      // Build a simpler "followup" request body (no structured diagnosis fields needed).
      const requestBody = {
        type: "followup" as const,
        conversationId: activeConversationId,
        message,
      };

      // Clear the follow-up input field immediately (before waiting for the response).
      setFollowUpInput("");
      await streamResponse(requestBody, userMessage);
    },
    [activeConversationId, streamResponse, setFollowUpInput]
  );

  // Guard: while the server request is in flight, show the skeleton placeholder.
  if (isLoading) {
    return <DiagnoseSkeleton />;
  }

  // Guard: if the server request failed, show a centered error message.
  if (error) {
    return (
      <div className="h-[calc(100vh-48px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load diagnose data. Please try again.</p>
        </div>
      </div>
    );
  }

  // Happy path: render the full three-column diagnose layout.
  return (
    // fixed + full viewport ensures the diagnose page fills the entire screen
    // and doesn't scroll with the page. The top/left offsets account for the
    // navigation bar (48px) and the collapsed icon sidebar (56px) on large screens.
    <div className="fixed left-0 right-0 bottom-0 top-0 lg:top-[48px] lg:left-[56px] bg-gray-50 flex overflow-hidden z-20 border-t border-gray-200">
      {/* ─── LEFT COLUMN: ISSUE HISTORY SIDEBAR ─────────────── */}
      {/* Shows a list of past issues so the user can switch between them,
          plus a "New Issue" button at the top. */}
      <IssuesSidebar
        issues={issues}
        // Pass the current issue's ID so the sidebar can highlight the active row.
        currentIssueId={currentIssue?.id ?? null}
        isCreatingNewIssue={isCreatingNewIssue}
        onSelectIssue={handleSelectIssue}
        onCreateNewIssue={handleCreateNewIssue}
      />

      {/* ─── CENTER COLUMN: CHAT AREA ────────────────────────── */}
      {/* flex-1 makes this column fill the space between the two sidebars. */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Branch 1: New issue mode — show the AI chat input for a fresh diagnosis. */}
        {isCreatingNewIssue ? (
          <>
            {/* Scrollable chat message area.
                ref is used by the auto-scroll useEffect to keep the view at the bottom. */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Animated welcome message; only animates when the chat is empty (fresh start). */}
                <WelcomeMessage shouldAnimate={messages.length === 0} />
                {/* The current session's messages and any streaming AI content. */}
                <ChatMessages
                  messages={messages}
                  streamingContent={streamingContent}
                  isStreaming={isStreaming}
                />
              </div>
            </div>

            {/* The text + file input bar at the bottom.
                onSend = sends a new initial diagnosis message.
                isStreaming = disables input while the AI is writing.
                onStop = aborts the stream if the user clicks "Stop". */}
            <ChatInput
              onSend={handleSendMessage}
              isStreaming={isStreaming}
              onStop={stop}
            />
          </>
        ) : currentIssue ? (
          // Branch 2: An existing issue is selected — show its history and allow follow-ups.
          <>
            {/* Issue header: icon, title, difficulty, confidence, and resolved/active badge. */}
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Icon box: emerald when resolved, type-specific color when active. */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    currentIssue.isResolved ? "bg-blue-100" : getIconBgColor(currentIssue.icon)
                  }`}
                >
                  {/* The IssueIcon component renders the correct SVG based on the icon name. */}
                  <IssueIcon
                    iconName={currentIssue.icon}
                    className={`w-5 h-5 ${
                      currentIssue.isResolved ? "text-blue-600" : currentIssue.iconColor
                    }`}
                  />
                </div>
                <div>
                  {/* Issue title */}
                  <h2 className="text-base font-semibold text-white">{currentIssue.title}</h2>
                  {/* Metadata row: creation date, difficulty level (color-coded), and AI confidence. */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{new Date(currentIssue.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    {/* Difficulty color: green = Easy, red = Professional Required, amber = Medium. */}
                    <span
                      className={
                        currentIssue.difficulty === "Easy"
                          ? "text-blue-600"
                          : currentIssue.difficulty.includes("Professional")
                          ? "text-red-400"
                          : "text-amber-400"
                      }
                    >
                      {currentIssue.difficulty}
                    </span>
                    <span>·</span>
                    {/* AI's confidence percentage in the diagnosis. */}
                    <span>{currentIssue.confidence}% confident</span>
                  </div>
                </div>
              </div>
              {/* Status badge: grey "Resolved" or emerald "Active". */}
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                  currentIssue.isResolved
                    ? "bg-gray-200 text-gray-500"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {currentIssue.isResolved ? "Resolved" : "Active"}
              </span>
            </div>

            {/* Scrollable chat history + follow-up messages area. */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Render the saved chat history from when this issue was originally diagnosed. */}
              <HistoricalChatMessages messages={currentIssue.chatMessages} />
              {/* Render any new messages sent during this session (follow-up questions). */}
              <ChatMessages
                messages={messages}
                streamingContent={streamingContent}
                isStreaming={isStreaming}
              />

              {/* Diagnosis Summary card: shows the AI's written diagnosis and cost comparison. */}
              <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  {/* Small OpportunIQ logo icon to brand the AI output. */}
                  <OpportunIQLogo className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-white">Diagnosis Summary</span>
                </div>
                {/* The AI's written summary of what's wrong. Falls back to a loading message. */}
                <p className="text-sm text-[#ccc] mb-4">
                  {currentIssue.diagnosis ?? "Analyzing issue..."}
                </p>

                {/* Cost comparison: DIY cost (left) vs Professional cost (right). */}
                <div className="grid grid-cols-2 gap-3">
                  {/* DIY cost panel: emerald border when parts are listed (i.e. DIY is viable). */}
                  <div
                    className={`p-3 rounded-lg border ${
                      (currentIssue.parts?.length ?? 0) > 0
                        ? "bg-blue-50 border-blue-500/20"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IoHammerOutline className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600">DIY Cost</span>
                    </div>
                    {/* Show the DIY cost formatted to 2 decimal places, or "N/A" if unavailable. */}
                    <p className="text-lg font-bold text-blue-600">
                      {currentIssue.diyCost ? `$${currentIssue.diyCost.toFixed(2)}` : "N/A"}
                    </p>
                  </div>
                  {/* Professional cost panel: always blue regardless of available data. */}
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <IoPeople className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-600">Pro Cost</span>
                    </div>
                    {/* Show the professional cost to 0 decimal places (whole dollars only), or "N/A". */}
                    <p className="text-lg font-bold text-white">
                      {currentIssue.proCost ? `$${currentIssue.proCost.toFixed(0)}` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-up input bar for asking the AI additional questions about this issue. */}
            <ChatInput
              onSend={(msg) => handleFollowUp(msg)}
              isStreaming={isStreaming}
              onStop={stop}
              placeholder="Ask a follow-up question..."
            />
          </>
        ) : (
          // Branch 3: No issue selected and not in new-issue mode — show the empty state.
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              {/* Large icon box to visually represent the empty state. */}
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <IoConstruct className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Issues Yet</h2>
              <p className="text-gray-500 mb-6">
                Start by reporting a home maintenance issue. We&apos;ll help diagnose the problem
                and find the best solution.
              </p>
              {/* CTA button: calls handleCreateNewIssue to enter new-issue mode. */}
              <button
                onClick={handleCreateNewIssue}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-gray-900 font-medium rounded-xl transition-colors mx-auto"
              >
                <IoAdd className="w-5 h-5" />
                Report New Issue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── RIGHT COLUMN: RESOURCE PANEL ───────────────────── */}
      {/* Shows guides, parts lists, and professional recommendations related to the current issue.
          Receives null when no issue is selected; the panel handles its own empty state. */}
      <ResourcePanel issue={currentIssue} />
    </div>
  );
}
