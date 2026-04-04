import { IoShield, IoWarning } from "react-icons/io5";

interface SafetyAlert {
  id: string;
  title: string;
  severity: string;
  groupName: string;
  emergencyInstructions?: string | null;
}

interface SafetyAlertsCardProps {
  alerts: SafetyAlert[];
}

export function SafetyAlertsCard({ alerts }: SafetyAlertsCardProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-50 rounded-lg border border-red-200 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-100 flex items-center justify-center">
          <IoShield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-red-600">Safety Alerts</h3>
          <p className="text-[10px] sm:text-xs text-red-600/70">{alerts.length} issue requiring attention</p>
        </div>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-2.5 sm:p-3 rounded-lg bg-white border border-red-200">
            <div className="flex items-start gap-2">
              <IoWarning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">{alert.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 uppercase">
                    {alert.severity}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-gray-500">{alert.groupName}</span>
                </div>
                {alert.emergencyInstructions && (
                  <p className="text-[10px] sm:text-xs text-red-600/70 mt-1.5">{alert.emergencyInstructions}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
