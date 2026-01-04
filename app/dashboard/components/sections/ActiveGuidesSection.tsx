"use client";

import Link from "next/link";
import { IoBook } from "react-icons/io5";

interface GuideProgress {
  guide: {
    id: string;
    title: string;
  };
  progress: {
    completedStepIds: string[] | null;
  };
}

interface ActiveGuidesSectionProps {
  guides: GuideProgress[];
}

export function ActiveGuidesSection({ guides }: ActiveGuidesSectionProps) {
  if (guides.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center gap-2 mb-3">
        <IoBook className="w-4 h-4 text-[#00D4FF]" />
        <h3 className="text-sm font-medium text-white">Continue Learning</h3>
      </div>
      <div className="space-y-2">
        {guides.map(({ guide, progress }) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.id}`}
            className="block p-2.5 -mx-1 rounded-lg hover:bg-[#1f1f1f] transition-colors group"
          >
            <p className="text-xs text-white group-hover:text-[#00D4FF] transition-colors truncate">
              {guide.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 bg-[#1f1f1f] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00D4FF] rounded-full transition-all"
                  style={{
                    width: progress.completedStepIds?.length ? "50%" : "10%",
                  }}
                />
              </div>
              <span className="text-[10px] text-[#9a9a9a]">
                {progress.completedStepIds?.length || 0} completed
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
