"use client";

import Link from "next/link";
import { IoCamera, IoMic, IoVideocam, IoCloudUpload } from "react-icons/io5";

export function EmptyStateSection() {
  return (
    <section className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">New Issue</h3>

      {/* Input method buttons - like the marketing preview */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Link
          href="/issues/new?mode=photo"
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-blue-500/30 transition-all group"
        >
          <IoCamera className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
          <span className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors">Photo</span>
        </Link>
        <Link
          href="/issues/new?mode=video"
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-blue-500/30 transition-all group"
        >
          <IoVideocam className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
          <span className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors">Video</span>
        </Link>
        <Link
          href="/issues/new?mode=voice"
          className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-blue-500/30 transition-all group"
        >
          <IoMic className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
          <span className="text-xs text-gray-500 group-hover:text-gray-900 transition-colors">Voice</span>
        </Link>
      </div>

      {/* Text input option */}
      <Link
        href="/issues/new"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 hover:border-[#333] transition-all group"
      >
        <span className="text-sm text-gray-500 group-hover:text-gray-500 transition-colors">
          Or type what&apos;s wrong...
        </span>
      </Link>
    </section>
  );
}
