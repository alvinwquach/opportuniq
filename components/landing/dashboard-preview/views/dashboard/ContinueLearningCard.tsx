import { IoBook } from "react-icons/io5";

interface ActiveGuide {
  id: string;
  title: string;
  progress: number;
  completedSteps: number;
  totalSteps: number;
}

interface ContinueLearningCardProps {
  guides: ActiveGuide[];
}

export function ContinueLearningCard({ guides }: ContinueLearningCardProps) {
  if (guides.length === 0) return null;

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <IoBook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
        <h3 className="text-xs sm:text-sm font-medium text-white">Continue Learning</h3>
      </div>
      <div className="space-y-2">
        {guides.map((guide) => (
          <div key={guide.id} className="p-2 rounded-lg hover:bg-[#252525] transition-colors cursor-pointer">
            <p className="text-[10px] sm:text-xs text-[#ccc] truncate">{guide.title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${guide.progress}%` }} />
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#888]">{guide.completedSteps}/{guide.totalSteps}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
