/**
 * Hook for managing media upload state in chat components.
 *
 * Currently supports: images (photos)
 * Future: audio (voice), video (frames extraction)
 *
 * Uses useReducer for clean state management.
 */

import { useReducer, useCallback, useRef, RefObject } from "react";
import { trackPhotoUploaded } from "@/lib/analytics";

// ============================================
// TYPES
// ============================================

export type MediaType = "image" | "audio" | "video";

export interface MediaItem {
  id: string;
  type: MediaType;
  file: File;
  preview: string; // base64 or blob URL
  mimeType: string;
  fileName: string;
  fileSize: number;
}

export interface MediaUploadState {
  items: MediaItem[];
  isDragging: boolean;
  uploadProgress: number;
  isProcessing: boolean;
  isEncrypting: boolean;
  processingStatus: string;
  error: string | null;
}

type MediaUploadAction =
  | { type: "START_PROCESSING"; status?: string }
  | { type: "SET_PROGRESS"; progress: number }
  | { type: "SET_STATUS"; status: string }
  | { type: "ADD_ITEM"; item: MediaItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "PROCESSING_COMPLETE" }
  | { type: "PROCESSING_ERROR"; error: string }
  | { type: "START_ENCRYPTING" }
  | { type: "FINISH_ENCRYPTING" }
  | { type: "CLEAR_ALL" }
  | { type: "SET_DRAGGING"; isDragging: boolean };

// ============================================
// REDUCER
// ============================================

const initialState: MediaUploadState = {
  items: [],
  isDragging: false,
  uploadProgress: 0,
  isProcessing: false,
  isEncrypting: false,
  processingStatus: "",
  error: null,
};

function mediaUploadReducer(state: MediaUploadState, action: MediaUploadAction): MediaUploadState {
  switch (action.type) {
    case "START_PROCESSING":
      return {
        ...state,
        isProcessing: true,
        uploadProgress: 0,
        processingStatus: action.status || "Processing...",
        error: null,
      };

    case "SET_PROGRESS":
      return { ...state, uploadProgress: action.progress };

    case "SET_STATUS":
      return { ...state, processingStatus: action.status };

    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.item], uploadProgress: 100 };

    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };

    case "PROCESSING_COMPLETE":
      return { ...state, isProcessing: false, processingStatus: "" };

    case "PROCESSING_ERROR":
      return { ...state, isProcessing: false, processingStatus: "", error: action.error };

    case "START_ENCRYPTING":
      return { ...state, isEncrypting: true, processingStatus: "Encrypting..." };

    case "FINISH_ENCRYPTING":
      return { ...state, isEncrypting: false, processingStatus: "" };

    case "CLEAR_ALL":
      return initialState;

    case "SET_DRAGGING":
      return { ...state, isDragging: action.isDragging };

    default:
      return state;
  }
}

// ============================================
// UTILITIES
// ============================================

function generateId(): string {
  return `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "image";
}

function readFileAsDataURL(file: File, onProgress?: (progress: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// ============================================
// HOOK
// ============================================

interface UseMediaUploadOptions {
  conversationId?: string | null;
  maxSizeBytes?: number;
  maxItems?: number;
  acceptedTypes?: MediaType[];
}

export interface UseMediaUploadResult {
  state: MediaUploadState;
  fileInputRef: RefObject<HTMLInputElement | null>;
  processFile: (file: File, uploadMethod?: "click" | "drag_drop") => Promise<void>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent, dropZoneRef: RefObject<HTMLElement | null>) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  startEncrypting: () => void;
  finishEncrypting: () => void;
}

export function useMediaUpload({
  conversationId,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB for images
  maxItems = 1, // Single image for now
  acceptedTypes = ["image"],
}: UseMediaUploadOptions = {}): UseMediaUploadResult {
  const [state, dispatch] = useReducer(mediaUploadReducer, initialState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File, uploadMethod: "click" | "drag_drop" = "click") => {
      const mediaType = getMediaType(file.type);

      if (!acceptedTypes.includes(mediaType)) {
        alert(`Please select a valid file type: ${acceptedTypes.join(", ")}`);
        return;
      }

      if (file.size > maxSizeBytes) {
        alert(`File must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
        return;
      }

      if (state.items.length >= maxItems) {
        // Replace existing item for single-item mode
        dispatch({ type: "CLEAR_ALL" });
      }

      if (mediaType === "image") {
        trackPhotoUploaded({
          conversationId,
          photoCount: 1,
          uploadMethod,
          fileSizeBytes: file.size,
        });
      }

      dispatch({ type: "START_PROCESSING", status: "Reading file..." });

      try {
        const preview = await readFileAsDataURL(file, (progress) => {
          dispatch({ type: "SET_PROGRESS", progress });
        });

        const item: MediaItem = {
          id: generateId(),
          type: mediaType,
          file,
          preview,
          mimeType: file.type,
          fileName: file.name,
          fileSize: file.size,
        };

        dispatch({ type: "ADD_ITEM", item });
        dispatch({ type: "PROCESSING_COMPLETE" });
      } catch (error) {
        console.error("[useMediaUpload] Processing error:", error);
        dispatch({
          type: "PROCESSING_ERROR",
          error: error instanceof Error ? error.message : "Failed to process file",
        });
        alert("Failed to process file");
      }
    },
    [conversationId, maxSizeBytes, maxItems, acceptedTypes, state.items.length]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file, "click");
    },
    [processFile]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      dispatch({ type: "SET_DRAGGING", isDragging: true });
    }
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent, dropZoneRef: RefObject<HTMLElement | null>) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
        dispatch({ type: "SET_DRAGGING", isDragging: false });
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!state.isDragging && e.dataTransfer.types.includes("Files")) {
        dispatch({ type: "SET_DRAGGING", isDragging: true });
      }
    },
    [state.isDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({ type: "SET_DRAGGING", isDragging: false });

      const files = e.dataTransfer.files;
      if (files?.[0]) {
        const mediaType = getMediaType(files[0].type);
        if (acceptedTypes.includes(mediaType)) {
          processFile(files[0], "drag_drop");
        } else {
          alert(`Please drop a valid file type: ${acceptedTypes.join(", ")}`);
        }
      }
    },
    [processFile, acceptedTypes]
  );

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const startEncrypting = useCallback(() => {
    dispatch({ type: "START_ENCRYPTING" });
  }, []);

  const finishEncrypting = useCallback(() => {
    dispatch({ type: "FINISH_ENCRYPTING" });
  }, []);

  return {
    state,
    fileInputRef,
    processFile,
    handleFileSelect,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    removeItem,
    clearAll,
    startEncrypting,
    finishEncrypting,
  };
}
