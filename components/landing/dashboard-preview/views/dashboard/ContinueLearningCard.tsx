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
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <IoBook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
        <h3 className="text-xs sm:text-sm font-medium text-gray-900">Continue Learning</h3>
      </div>
      <div className="space-y-2">
        {guides.map((guide) => (
          <div key={guide.id} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <p className="text-[10px] sm:text-xs text-gray-700 truncate">{guide.title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${guide.progress}%` }} />
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-500">{guide.completedSteps}/{guide.totalSteps}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
