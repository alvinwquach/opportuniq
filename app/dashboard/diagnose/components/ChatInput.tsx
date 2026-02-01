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
    <div className="p-4 border-t border-white/[0.06]">
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
                  className="w-16 h-16 object-cover rounded-lg border border-[#2a2a2a]"
                />
              ) : (
                <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] flex items-center justify-center">
                  <IoVideocam className="w-6 h-6 text-[#666]" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IoClose className="w-3 h-3" />
              </button>
              <p className="absolute bottom-0 left-0 right-0 text-[8px] text-center text-white bg-black/60 rounded-b-lg py-0.5 truncate px-1">
                {file.type.startsWith("video/") ? "Video" : "Photo"}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] focus-within:border-emerald-500/50 transition-colors">
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="w-full px-4 py-3 bg-transparent text-[15px] text-white placeholder:text-[#555] focus:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors"
              title="Attach photo or video"
            >
              <IoAttach className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-colors"
                  title="Stop generating"
                >
                  <IoStopCircle className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="p-2.5 text-[#555] hover:text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-colors"
                    title="Voice message"
                  >
                    <IoMic className="w-5 h-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() && attachments.length === 0}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <IoSend className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
