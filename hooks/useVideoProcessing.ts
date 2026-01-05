"use client";

import { useState, useCallback } from "react";
import { processVideo, type VideoProcessingResult, type VideoProcessingProgress } from "@/lib/video/processor";
import { type ProcessingStage } from "@/lib/video/constants";

interface UseVideoProcessingReturn {
  processVideoFile: (file: File) => Promise<VideoProcessingResult | null>;
  videoProcessingStage: ProcessingStage;
  videoProcessingProgress: number;
  videoProcessingResult: VideoProcessingResult | null;
  isProcessingVideo: boolean;
  resetVideoState: () => void;
}

export function useVideoProcessing(): UseVideoProcessingReturn {
  const [videoProcessingStage, setVideoProcessingStage] = useState<ProcessingStage>("idle");
  const [videoProcessingProgress, setVideoProcessingProgress] = useState(0);
  const [videoProcessingResult, setVideoProcessingResult] = useState<VideoProcessingResult | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  const processVideoFile = useCallback(
    async (file: File): Promise<VideoProcessingResult | null> => {
      setIsProcessingVideo(true);
      setVideoProcessingStage("validating");
      setVideoProcessingProgress(0);

      try {
        const result = await processVideo(file, (progress: VideoProcessingProgress) => {
          setVideoProcessingStage(progress.stage);
          setVideoProcessingProgress(progress.progress);
        });
        setVideoProcessingResult(result);
        setVideoProcessingStage("complete");
        return result;
      } catch (error) {
        console.error("[useVideoProcessing] Video processing failed:", error);
        setVideoProcessingStage("error");
        return null;
      } finally {
        setIsProcessingVideo(false);
      }
    },
    []
  );

  const resetVideoState = useCallback(() => {
    setVideoProcessingStage("idle");
    setVideoProcessingProgress(0);
    setVideoProcessingResult(null);
    setIsProcessingVideo(false);
  }, []);

  return {
    processVideoFile,
    videoProcessingStage,
    videoProcessingProgress,
    videoProcessingResult,
    isProcessingVideo,
    resetVideoState,
  };
}
