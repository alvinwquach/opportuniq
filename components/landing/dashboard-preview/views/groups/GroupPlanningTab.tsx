"use client";

import { LocationWeatherCard } from "../dashboard";

interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    weatherDescription: string;
    isDay: boolean;
    uvIndex: number;
    precipitation: number;
    visibility: number;
  };
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitationProbability: number;
    weatherCode: number;
    weatherDescription: string;
    sunrise: string;
    sunset: string;
    windSpeedMax: number;
    uvIndexMax: number;
    hourly?: Array<{
      hour: number;
      time: string;
      temperature: number;
      weatherCode: number;
      isDay: boolean;
      precipProbability: number;
      windSpeed: number;
    }>;
  }>;
  airQuality: {
    aqi: number;
    pm25: number;
    pm10: number;
    description: string;
  };
}

interface LocationData {
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface GroupPlanningTabProps {
  weather: WeatherData;
  location: LocationData;
}

export function GroupPlanningTab({ weather, location }: GroupPlanningTabProps) {
  return (
    <>
      {/* Weather & Outdoor Work Planning */}
      <LocationWeatherCard weather={weather} location={location} />

      {/* Planning Tips */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 mt-5">
        <h3 className="text-sm font-medium text-white mb-3">Planning Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🌤</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Best days for outdoor work</p>
              <p className="text-xs text-[#666]">Thursday and Friday look ideal for exterior painting or yard work with low precipitation and moderate temperatures.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Rain expected Monday</p>
              <p className="text-xs text-[#666]">Plan indoor tasks or postpone exterior work. Good day for organizing the garage or indoor repairs.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">🛠</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Upcoming maintenance</p>
              <p className="text-xs text-[#666]">HVAC filter replacement due in 2 weeks. Consider scheduling during cooler morning hours.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
