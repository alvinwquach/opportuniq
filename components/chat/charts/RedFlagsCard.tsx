import { IoStopCircle, IoCall } from "react-icons/io5";

interface RedFlagsCardProps {
  flags: string[];
  stopAction?: string;
  className?: string;
}

export function RedFlagsCard({ flags, stopAction, className }: RedFlagsCardProps) {
  if (!flags || flags.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <IoStopCircle className="w-4 h-4 text-[#ef4444]" />
        <h4 className="text-sm font-medium text-white">Red Flags - Stop & Call a Pro</h4>
      </div>
      <div className="p-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20">
        <p className="text-xs text-[#ef4444] mb-3 font-medium">
          During inspection or repair, STOP immediately if you see:
        </p>
        <ul className="space-y-2">
          {flags.slice(0, 5).map((flag, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#ef4444] mt-0.5">•</span>
              <span className="text-xs text-[#cccccc]">{flag}</span>
            </li>
          ))}
        </ul>
        {stopAction && (
          <div className="mt-4 pt-3 border-t border-[#ef4444]/20">
            <div className="flex items-center gap-2">
              <IoCall className="w-3.5 h-3.5 text-[#ef4444]" />
              <span className="text-xs text-[#ef4444] font-medium">{stopAction}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
