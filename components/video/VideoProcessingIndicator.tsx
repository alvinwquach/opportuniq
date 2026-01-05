"use client";

import { type ProcessingStage } from "@/lib/video/constants";
import { type IconType } from "react-icons";
import {
  IoCheckmarkCircle,
  IoAlertCircle,
  IoVideocam,
  IoFlash,
  IoImage,
  IoVolumeHigh,
  IoLockClosed,
  IoCloudUpload,
  IoSparkles
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import { cn } from "@/lib/utils";

interface VideoProcessingIndicatorProps {
  stage: ProcessingStage;
  progress: number;
  message?: string;
  className?: string;
}

const STAGE_CONFIG: Record<
  ProcessingStage,
  {
    icon: IconType;
    label: string;
    color: string;
  }
> = {
  idle: { icon: IoVideocam, label: "Ready", color: "text-muted-foreground" },
  validating: { icon: IoVideocam, label: "Validating", color: "text-blue-500" },
  "loading-ffmpeg": { icon: IoFlash, label: "Loading processor", color: "text-yellow-500" },
  compressing: { icon: IoVideocam, label: "Compressing", color: "text-orange-500" },
  "extracting-thumbnail": { icon: IoImage, label: "Creating preview", color: "text-purple-500" },
  "extracting-frames": { icon: IoImage, label: "Extracting frames", color: "text-purple-500" },
  "extracting-audio": { icon: IoVolumeHigh, label: "Extracting audio", color: "text-cyan-500" },
  transcribing: { icon: IoSparkles, label: "Transcribing", color: "text-pink-500" },
  encrypting: { icon: IoLockClosed, label: "Encrypting", color: "text-green-500" },
  uploading: { icon: IoCloudUpload, label: "Uploading", color: "text-blue-500" },
  complete: { icon: IoCheckmarkCircle, label: "Complete", color: "text-green-500" },
  error: { icon: IoAlertCircle, label: "Error", color: "text-red-500" },
};

// Define stage order for progress calculation
const STAGE_ORDER: ProcessingStage[] = [
  "validating",
  "loading-ffmpeg",
  "compressing",
  "extracting-thumbnail",
  "extracting-frames",
  "extracting-audio",
  "transcribing",
  "encrypting",
  "uploading",
  "complete",
];

export function VideoProcessingIndicator({
  stage,
  progress,
  message,
  className,
}: VideoProcessingIndicatorProps) {
  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;
  const isComplete = stage === "complete";
  const isError = stage === "error";
  const isIdle = stage === "idle";

  // Calculate overall progress based on stage
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const overallProgress = isComplete
    ? 100
    : isError || isIdle
      ? 0
      : Math.round(((stageIndex + progress / 100) / STAGE_ORDER.length) * 100);

  if (isIdle) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-3",
        isError && "border-red-500/50 bg-red-50 dark:bg-red-950/20",
        isComplete && "border-green-500/50 bg-green-50 dark:bg-green-950/20",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isComplete || isError ? (
          <Icon className={cn("h-5 w-5", config.color)} />
        ) : (
          <ImSpinner8 className={cn("h-5 w-5 animate-spin", config.color)} />
        )}
        <span className={cn("text-sm font-medium", config.color)}>
          {message || config.label}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {overallProgress}%
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            isError ? "bg-red-500" : isComplete ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      <div className="flex justify-between">
        {STAGE_ORDER.slice(0, -1).map((s, index) => {
          const isCurrentOrPast = stageIndex >= index;
          const isCurrent = stage === s;
          return (
            <div
              key={s}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                isCurrentOrPast
                  ? isCurrent
                    ? "bg-primary"
                    : "bg-primary/50"
                  : "bg-secondary-foreground/20"
              )}
              title={STAGE_CONFIG[s].label}
            />
          );
        })}
      </div>
    </div>
  );
}

export function VideoProcessingIndicatorCompact({
  stage,
  progress,
  className,
}: Omit<VideoProcessingIndicatorProps, "message">) {
  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;
  const isComplete = stage === "complete";
  const isError = stage === "error";
  const isIdle = stage === "idle";

  if (isIdle) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {isComplete || isError ? (
        <Icon className={cn("h-4 w-4", config.color)} />
      ) : (
        <ImSpinner8 className={cn("h-4 w-4 animate-spin", config.color)} />
      )}
      <span className={cn("text-xs", config.color)}>{config.label}</span>
      {!isComplete && !isError && (
        <span className="text-xs text-muted-foreground">{progress}%</span>
      )}
    </div>
  );
}
