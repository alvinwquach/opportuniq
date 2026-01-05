/**
 * Chat State Management Hook
 *
 * Manages all state for the DiagnosisChat component using useReducer.
 */

import { useReducer, useCallback } from "react";

// ============================================
// TYPES
// ============================================

export interface MessageAttachment {
  type: string;
  mediaType: string;
  url?: string;
  attachmentId?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: MessageAttachment[] | null;
  translatedContent?: string | null;
  isTranslated?: boolean;
}

export interface TranslationState {
  text: string;
  isTranslated: boolean;
}

export interface ChatState {
  messages: Message[];
  followUpInput: string;
  activeConversationId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  error: Error | null;
  decryptedUrls: Map<string, string>;
  detectedLanguage: string | null;
  translatedMessages: Map<string, TranslationState>;
}

type ChatAction =
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_FOLLOW_UP_INPUT"; payload: string }
  | { type: "SET_CONVERSATION_ID"; payload: string | null }
  | { type: "START_STREAMING" }
  | { type: "UPDATE_STREAMING_CONTENT"; payload: string }
  | { type: "FINISH_STREAMING"; payload: Message }
  | { type: "STOP_STREAMING" }
  | { type: "SET_ERROR"; payload: Error | null }
  | { type: "ADD_DECRYPTED_URL"; payload: { id: string; url: string } }
  | { type: "SET_DETECTED_LANGUAGE"; payload: string | null }
  | { type: "SET_TRANSLATION"; payload: { messageId: string; text: string; isTranslated: boolean } }
  | { type: "RESET_CONVERSATION" };

// ============================================
// REDUCER
// ============================================

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };

    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };

    case "SET_FOLLOW_UP_INPUT":
      return { ...state, followUpInput: action.payload };

    case "SET_CONVERSATION_ID":
      return { ...state, activeConversationId: action.payload };

    case "START_STREAMING":
      return { ...state, isStreaming: true, streamingContent: "", error: null };

    case "UPDATE_STREAMING_CONTENT":
      return { ...state, streamingContent: action.payload };

    case "FINISH_STREAMING":
      return {
        ...state,
        isStreaming: false,
        streamingContent: "",
        messages: [...state.messages, action.payload],
      };

    case "STOP_STREAMING":
      return { ...state, isStreaming: false, streamingContent: "" };

    case "SET_ERROR":
      return { ...state, error: action.payload, isStreaming: false };

    case "ADD_DECRYPTED_URL": {
      const newUrls = new Map(state.decryptedUrls);
      newUrls.set(action.payload.id, action.payload.url);
      return { ...state, decryptedUrls: newUrls };
    }

    case "SET_DETECTED_LANGUAGE":
      return { ...state, detectedLanguage: action.payload };

    case "SET_TRANSLATION": {
      const newTranslations = new Map(state.translatedMessages);
      newTranslations.set(action.payload.messageId, {
        text: action.payload.text,
        isTranslated: action.payload.isTranslated,
      });
      return { ...state, translatedMessages: newTranslations };
    }

    case "RESET_CONVERSATION":
      return {
        ...state,
        messages: [],
        streamingContent: "",
        error: null,
        translatedMessages: new Map(),
      };

    default:
      return state;
  }
}

function createInitialState(conversationId: string | null): ChatState {
  return {
    messages: [],
    followUpInput: "",
    activeConversationId: conversationId,
    isStreaming: false,
    streamingContent: "",
    error: null,
    decryptedUrls: new Map(),
    detectedLanguage: null,
    translatedMessages: new Map(),
  };
}

// ============================================
// HOOK
// ============================================

export interface UseChatStateResult {
  state: ChatState;
  // Message actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  // Input actions
  setFollowUpInput: (input: string) => void;
  // Conversation actions
  setConversationId: (id: string | null) => void;
  resetConversation: () => void;
  // Streaming actions
  startStreaming: () => void;
  updateStreamingContent: (content: string) => void;
  finishStreaming: (message: Message) => void;
  stopStreaming: () => void;
  // Error actions
  setError: (error: Error | null) => void;
  // Decryption actions
  addDecryptedUrl: (id: string, url: string) => void;
  // Language actions
  setDetectedLanguage: (language: string | null) => void;
  // Translation actions
  setTranslation: (messageId: string, text: string, isTranslated: boolean) => void;
}

export function useChatState(initialConversationId: string | null): UseChatStateResult {
  const [state, dispatch] = useReducer(
    chatReducer,
    initialConversationId,
    createInitialState
  );

  // Memoized action creators
  const setMessages = useCallback((messages: Message[]) => {
    dispatch({ type: "SET_MESSAGES", payload: messages });
  }, []);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: "ADD_MESSAGE", payload: message });
  }, []);

  const setFollowUpInput = useCallback((input: string) => {
    dispatch({ type: "SET_FOLLOW_UP_INPUT", payload: input });
  }, []);

  const setConversationId = useCallback((id: string | null) => {
    dispatch({ type: "SET_CONVERSATION_ID", payload: id });
  }, []);

  const resetConversation = useCallback(() => {
    dispatch({ type: "RESET_CONVERSATION" });
  }, []);

  const startStreaming = useCallback(() => {
    dispatch({ type: "START_STREAMING" });
  }, []);

  const updateStreamingContent = useCallback((content: string) => {
    dispatch({ type: "UPDATE_STREAMING_CONTENT", payload: content });
  }, []);

  const finishStreaming = useCallback((message: Message) => {
    dispatch({ type: "FINISH_STREAMING", payload: message });
  }, []);

  const stopStreaming = useCallback(() => {
    dispatch({ type: "STOP_STREAMING" });
  }, []);

  const setError = useCallback((error: Error | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const addDecryptedUrl = useCallback((id: string, url: string) => {
    dispatch({ type: "ADD_DECRYPTED_URL", payload: { id, url } });
  }, []);

  const setDetectedLanguage = useCallback((language: string | null) => {
    dispatch({ type: "SET_DETECTED_LANGUAGE", payload: language });
  }, []);

  const setTranslation = useCallback(
    (messageId: string, text: string, isTranslated: boolean) => {
      dispatch({
        type: "SET_TRANSLATION",
        payload: { messageId, text, isTranslated },
      });
    },
    []
  );

  return {
    state,
    setMessages,
    addMessage,
    setFollowUpInput,
    setConversationId,
    resetConversation,
    startStreaming,
    updateStreamingContent,
    finishStreaming,
    stopStreaming,
    setError,
    addDecryptedUrl,
    setDetectedLanguage,
    setTranslation,
  };
}
