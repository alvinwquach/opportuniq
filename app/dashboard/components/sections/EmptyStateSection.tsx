"use client";

import Link from "next/link";
import { IoCamera, IoMic, IoVideocam, IoCloudUpload } from "react-icons/io5";

export function EmptyStateSection() {
  return (
    <section className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <h3 className="text-sm font-medium text-white mb-3">New Issue</h3>

      {/* Input method buttons - like the marketing preview */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Link
          href="/issues/new?mode=photo"
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-transparent hover:border-[#00D4FF]/30 transition-all group"
        >
          <IoCamera className="w-5 h-5 text-[#888] group-hover:text-[#00D4FF] transition-colors" />
          <span className="text-xs text-[#888] group-hover:text-white transition-colors">Photo</span>
        </Link>
        <Link
          href="/issues/new?mode=video"
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-transparent hover:border-[#00D4FF]/30 transition-all group"
        >
          <IoVideocam className="w-5 h-5 text-[#888] group-hover:text-[#00D4FF] transition-colors" />
          <span className="text-xs text-[#888] group-hover:text-white transition-colors">Video</span>
        </Link>
        <Link
          href="/issues/new?mode=voice"
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-transparent hover:border-[#00D4FF]/30 transition-all group"
        >
          <IoMic className="w-5 h-5 text-[#888] group-hover:text-[#00D4FF] transition-colors" />
          <span className="text-xs text-[#888] group-hover:text-white transition-colors">Voice</span>
        </Link>
      </div>

      {/* Text input option */}
      <Link
        href="/issues/new"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#333] transition-all group"
      >
        <span className="text-sm text-[#666] group-hover:text-[#888] transition-colors">
          Or type what's wrong...
        </span>
      </Link>
    </section>
  );
}
