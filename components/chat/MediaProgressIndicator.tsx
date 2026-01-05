"use client";

import Image from "next/image";
import { IoImage, IoCheckmarkCircle, IoLockClosed } from "react-icons/io5";
import { Progress } from "@/components/ui/progress";
import { VideoProcessingIndicator } from "@/components/video/VideoProcessingIndicator";
import { type ProcessingStage } from "@/lib/video/constants";

interface MediaProgressIndicatorProps {
  isProcessingVideo: boolean;
  videoProcessingStage: ProcessingStage;
  videoProcessingProgress: number;
  isEncrypting: boolean;
  isUploading: boolean;
  uploadProgress: number;
  selectedImage: string | null;
}

export function MediaProgressIndicator({
  isProcessingVideo,
  videoProcessingStage,
  videoProcessingProgress,
  isEncrypting,
  isUploading,
  uploadProgress,
  selectedImage,
}: MediaProgressIndicatorProps) {
  const showProgress = isProcessingVideo || isEncrypting || isUploading;

  if (!showProgress) {
    return null;
  }

  return (
    <div className="px-4 pb-2">
      {isProcessingVideo && (
        <VideoProcessingIndicator
          stage={videoProcessingStage}
          progress={videoProcessingProgress}
          className="mb-2"
        />
      )}
      {!isProcessingVideo && (isEncrypting || isUploading) && (
        <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt="Uploading"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover opacity-50"
                  unoptimized
                />
              ) : (
                <IoImage className="w-6 h-6 text-[#5eead4]" />
              )}
            </div>
            {uploadProgress === 100 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#5eead4] rounded-full flex items-center justify-center">
                <IoCheckmarkCircle className="w-4 h-4 text-black" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white truncate flex items-center gap-1.5">
                <IoLockClosed className="w-3.5 h-3.5 text-[#5eead4]" />
                Encrypting...
              </span>
              <span className="text-xs text-[#888888] ml-2">
                {uploadProgress}%
              </span>
            </div>
            <Progress
              value={uploadProgress}
              className="h-1.5 bg-[#2a2a2a]"
              indicatorClassName="bg-[#5eead4]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
