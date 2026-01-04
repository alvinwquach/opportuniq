"use client";

import { useState } from "react";
import { IoCopy, IoCheckmarkCircle } from "react-icons/io5";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#5eead4] hover:bg-[#5eead4]/10 transition-colors"
    >
      {copied ? (
        <>
          <IoCheckmarkCircle className="h-3 w-3" />
          Copied
        </>
      ) : (
        <>
          <IoCopy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  );
}
