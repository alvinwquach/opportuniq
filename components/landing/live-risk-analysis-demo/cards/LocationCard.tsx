import { IoLocation, IoThermometer, IoWater, IoLeaf } from "react-icons/io5";
import type { DemoScenario } from "../types";

interface LocationCardProps {
  scenario: DemoScenario;
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function LocationCard({ scenario, mapContainerRef }: LocationCardProps) {
  return (
    <div className="ml-11 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-neutral-300 overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-neutral-300 flex items-center gap-2">
          <IoLocation className="w-4 h-4 text-teal-700" />
          <span className="text-sm font-semibold text-neutral-900">Location & Conditions</span>
        </div>
        <div className="grid md:grid-cols-5 gap-0">
          <div className="md:col-span-2">
            <div ref={mapContainerRef} className="h-48 md:h-full w-full min-h-45" />
          </div>
          <div className="md:col-span-3 p-4 border-t md:border-t-0 md:border-l border-neutral-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold text-neutral-900">{scenario.location.name}</p>
                <p className="text-xs text-neutral-500">{scenario.weather.condition}</p>
              </div>
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" title="Task Location" />
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Nearby Stores" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <IoThermometer className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-neutral-900">{scenario.weather.temp}°F</p>
                <p className="text-xs text-neutral-500">Temp</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <IoWater className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-neutral-900">{scenario.weather.humidity}%</p>
                <p className="text-xs text-neutral-500">Humidity</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <IoLeaf className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-lg font-semibold text-neutral-900">{scenario.weather.wind}</p>
                <p className="text-xs text-neutral-500">Wind mph</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
