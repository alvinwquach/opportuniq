"use client";

import { useState } from "react";
import Image from "next/image";
import { IoClose, IoPlay, IoTime, IoVolumeHigh, IoVolumeMute } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface VideoPreviewProps {
  thumbnailSrc: string; // Base64 or URL
  videoSrc?: string; // Optional video source for playback
  duration: number; // Duration in seconds
  hasAudio: boolean;
  onRemove?: () => void;
  className?: string;
  isProcessing?: boolean;
}

export function VideoPreview({
  thumbnailSrc,
  videoSrc,
  duration,
  hasAudio,
  onRemove,
  className,
  isProcessing = false,
}: VideoPreviewProps) {
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  // Format duration as mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = () => {
    if (videoSrc && !isProcessing) {
      setShowVideoDialog(true);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative overflow-hidden rounded-lg border bg-muted",
          isProcessing && "opacity-60",
          videoSrc && !isProcessing && "cursor-pointer",
          className
        )}
        onClick={handleClick}
      >
        <div className="relative aspect-video w-full">
          <Image
            src={
              thumbnailSrc.startsWith("data:")
                ? thumbnailSrc
                : `data:image/jpeg;base64,${thumbnailSrc}`
            }
            alt="Video thumbnail"
            fill
            className="object-cover"
            unoptimized
          />
          {videoSrc && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <IoPlay className="h-6 w-6 text-black" />
              </div>
            </div>
          )}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-2">
          <div className="flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
            <IoTime className="h-3 w-3" />
            <span>{formatDuration(duration)}</span>
          </div>
          <div className="flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5">
            {hasAudio ? (
              <IoVolumeHigh className="h-3 w-3 text-white" />
            ) : (
              <IoVolumeMute className="h-3 w-3 text-white/60" />
            )}
          </div>
        </div>
        {onRemove && !isProcessing && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <IoClose className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-3xl p-0">
          <VisuallyHidden>
            <DialogTitle>Video Preview</DialogTitle>
            <DialogDescription>
              Preview of the uploaded video
            </DialogDescription>
          </VisuallyHidden>
          {videoSrc && (
            <video
              src={videoSrc}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function VideoPreviewCompact({
  thumbnailSrc,
  duration,
  hasAudio,
  onClick,
  className,
}: {
  thumbnailSrc: string;
  duration: number;
  hasAudio: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg",
        className
      )}
      onClick={onClick}
    >
      <div className="relative h-20 w-32">
        <Image
          src={
            thumbnailSrc.startsWith("data:")
              ? thumbnailSrc
              : `data:image/jpeg;base64,${thumbnailSrc}`
          }
          alt="Video thumbnail"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
          <IoPlay className="h-6 w-6 text-white" />
        </div>
        <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">
          {hasAudio ? (
            <IoVolumeHigh className="h-2.5 w-2.5" />
          ) : (
            <IoVolumeMute className="h-2.5 w-2.5 opacity-60" />
          )}
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}
