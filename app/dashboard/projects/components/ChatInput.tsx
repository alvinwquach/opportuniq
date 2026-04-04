"use client";

import { useState, useRef, useCallback } from "react";
import {
  IoAttach,
  IoMic,
  IoSend,
  IoClose,
  IoVideocam,
  IoStopCircle,
} from "react-icons/io5";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface ChatInputProps {
  onSend: (message: string, attachments: File[]) => void;
  isStreaming: boolean;
  onStop: () => void;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isStreaming,
  onStop,
  placeholder = "Describe your issue...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).filter((file) => {
        return file.type.startsWith("image/") || file.type.startsWith("video/");
      });
      setAttachments((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    onSend(input, attachments);
    setInput("");
    setAttachments([]);
  };

  return (
    <div className="p-4 border-t border-gray-200">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative group">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                  <IoVideocam className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-400 text-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IoClose className="w-3 h-3" />
              </button>
              <p className="absolute bottom-0 left-0 right-0 text-[8px] text-center text-gray-900 bg-black/40 rounded-b-lg py-0.5 truncate px-1">
                {file.type.startsWith("video/") ? "Video" : "Photo"}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-100 rounded-2xl border border-gray-200 focus-within:border-blue-500/50 transition-colors">
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="w-full px-4 py-3 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleAttachmentClick}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <IoAttach className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach photo or video</TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-1">
              {isStreaming ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onStop}
                      className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-colors"
                    >
                      <IoStopCircle className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Stop generating</TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="p-2.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                      >
                        <IoMic className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Voice message</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="submit"
                        disabled={!input.trim() && attachments.length === 0}
                        className="p-2.5 bg-blue-500 hover:bg-blue-400 text-gray-900 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <IoSend className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Send message</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
