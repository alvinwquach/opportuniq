import { IoWallet } from "react-icons/io5";

interface TotalSavedCardProps {
  totalSavings: number;
  projectCount?: number;
}

export function TotalSavedCard({ totalSavings, projectCount = 12 }: TotalSavedCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-[#1a1a1a] rounded-lg border border-emerald-500/20 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <IoWallet className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-emerald-400">Total Saved</p>
          <p className="text-xl font-bold text-emerald-400">${totalSavings.toLocaleString()}</p>
          <p className="text-[10px] text-[#888]">{projectCount} DIY projects</p>
        </div>
      </div>
    </div>
  );
}
