"use client";

import { useState } from "react";
import { IoCopy, IoCheckmark } from "react-icons/io5";

export function CopyButton({ text, title = "Copy invite link" }: { text: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded transition-colors ${
        copied
          ? "text-emerald-400 bg-emerald-500/10"
          : "text-[#555] hover:text-white hover:bg-[#1f1f1f]"
      }`}
      title={title}
    >
      {copied ? (
        <IoCheckmark className="h-3.5 w-3.5" />
      ) : (
        <IoCopy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
