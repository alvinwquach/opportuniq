import Link from "next/link";
import { IoArrowBack, IoSearchOutline } from "react-icons/io5";

export default function ConversationNotFound() {
  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <IoSearchOutline className="w-8 h-8 text-[#666]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Conversation Not Found
        </h1>
        <p className="text-[#888] mb-8">
          This conversation doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/dashboard/diagnose"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5eead4] text-black font-medium hover:bg-[#4fd1c5] transition-colors"
        >
          <IoArrowBack className="w-5 h-5" />
          Start New Diagnosis
        </Link>
      </div>
    </div>
  );
}
