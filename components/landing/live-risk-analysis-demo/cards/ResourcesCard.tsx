import { IoStorefront, IoConstruct } from "react-icons/io5";
import type { DemoScenario } from "../types";

interface ResourcesCardProps {
  scenario: DemoScenario;
}

export function ResourcesCard({ scenario }: ResourcesCardProps) {
  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-300 flex items-center gap-2">
          <IoStorefront className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-neutral-900">Nearby Resources</span>
        </div>
        <div className="p-4 space-y-3">
          {scenario.toolsNearby.map((store) => (
            <div key={store.storeName} className="p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-neutral-900">{store.storeName}</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-medium">
                  {store.distance} mi away
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {store.tools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-neutral-200 text-xs text-neutral-700"
                  >
                    <IoConstruct className="w-3 h-3 text-neutral-500" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-neutral-500 text-center pt-2">
            Store inventory based on typical stock. Call ahead to confirm availability.
          </p>
        </div>
      </div>
    </div>
  );
}
