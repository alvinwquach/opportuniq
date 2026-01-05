"use client";

import { RefObject } from "react";
import { DiagnosisForm } from "./DiagnosisForm";
import { EmptyStateHeader } from "./EmptyStateHeader";
import { isVideoFeatureEnabled } from "@/lib/video/constants";
import type { ProcessingStage } from "@/lib/video/constants";
import type { MediaItem } from "@/hooks/useMediaUpload";
import type { DiagnosisRequest } from "@/lib/schemas/diagnosis";

interface InitialFormViewProps {
  userId: string;
  userPostalCode?: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (diagnosis: DiagnosisRequest, language?: string) => Promise<void>;
  isLoading: boolean;
  selectedImage: string | null;
  imageFile: File | null;
  selectedVideo: MediaItem | null;
  onMediaRemove: () => void;
  isEncrypting: boolean;
  isProcessingVideo: boolean;
  videoProcessingStage: ProcessingStage;
  videoProcessingProgress: number;
  uploadProgress: number;
  detectedLanguage: string | null;
  onLanguageDetected: (lang: string | null) => void;
}

export function InitialFormView({
  userId,
  userPostalCode,
  fileInputRef,
  onFileSelect,
  onSubmit,
  isLoading,
  selectedImage,
  imageFile,
  selectedVideo,
  onMediaRemove,
  isEncrypting,
  isProcessingVideo,
  videoProcessingStage,
  videoProcessingProgress,
  uploadProgress,
  detectedLanguage,
  onLanguageDetected,
}: InitialFormViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 py-8">
      <div className="w-full max-w-lg">
        <EmptyStateHeader />
        <input
          ref={fileInputRef}
          type="file"
          accept={isVideoFeatureEnabled() ? "image/*,video/*" : "image/*"}
          onChange={onFileSelect}
          className="hidden"
        />
        <DiagnosisForm
          userId={userId}
          userPostalCode={userPostalCode}
          onSubmit={onSubmit}
          isSubmitting={isLoading}
          selectedImage={selectedImage}
          imageFile={imageFile}
          selectedVideo={selectedVideo}
          onMediaSelect={() => fileInputRef.current?.click()}
          onMediaRemove={onMediaRemove}
          isEncrypting={isEncrypting}
          isProcessingVideo={isProcessingVideo}
          videoProcessingStage={videoProcessingStage}
          videoProcessingProgress={videoProcessingProgress}
          uploadProgress={uploadProgress}
          detectedLanguage={detectedLanguage}
          onLanguageDetected={onLanguageDetected}
        />
      </div>
    </div>
  );
}
