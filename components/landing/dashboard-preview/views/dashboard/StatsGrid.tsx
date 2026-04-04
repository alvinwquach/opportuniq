import { IoTrendingUp, IoTrendingDown } from "react-icons/io5";

interface Stat {
  label: string;
  value: string | number;
  trend: string;
  up: boolean;
  prefix?: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border border-gray-200 p-2.5 sm:p-3"
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] sm:text-xs text-gray-500">{stat.label}</p>
            <span
              className={`text-[9px] sm:text-[10px] font-medium flex items-center gap-0.5 ${
                stat.up ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {stat.up ? (
                <IoTrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : (
                <IoTrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              {stat.trend}
            </span>
          </div>
          <p className="text-lg sm:text-xl font-semibold text-gray-900">
            {stat.prefix}
            {typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
