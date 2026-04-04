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
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <IoBook className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium text-white">Continue Learning</h3>
      </div>
      <div className="space-y-2">
        {guides.map(({ guide, progress }) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.id}`}
            className="block p-2.5 -mx-1 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <p className="text-xs text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {guide.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width: progress.completedStepIds?.length ? "50%" : "10%",
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-400">
                {progress.completedStepIds?.length || 0} completed
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
