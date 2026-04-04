import { IoWallet } from "react-icons/io5";

interface TotalSavedCardProps {
  totalSavings: number;
  projectCount?: number;
}

export function TotalSavedCard({ totalSavings, projectCount = 12 }: TotalSavedCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <IoWallet className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-green-600">Total Saved</p>
          <p className="text-xl font-bold text-green-600">${totalSavings.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500">{projectCount} DIY projects</p>
        </div>
      </div>
    </div>
  );
}
