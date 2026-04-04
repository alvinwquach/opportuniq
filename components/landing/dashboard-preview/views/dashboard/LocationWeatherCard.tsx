"use client";

import { useState } from "react";
import {
  IoLocationOutline,
  IoSunny,
  IoPartlySunny,
  IoCloudy,
  IoRainy,
  IoThunderstorm,
  IoSnow,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import {
  WiDaySunny,
  WiNightClear,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiStrongWind,
  WiRaindrop,
  WiThermometer,
  WiSunrise,
  WiSunset,
} from "react-icons/wi";
import { cn } from "@/lib/utils";

interface CurrentWeather {
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
}

interface HourlyForecast {
  hour: number;
  time: string;
  temperature: number;
  weatherCode: number;
  isDay: boolean;
  precipProbability: number;
  windSpeed: number;
}

interface DailyForecast {
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
  hourly?: HourlyForecast[];
}

interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  description: string;
}

/** Compatible with v2 WeatherData (current/daily/airQuality nullable) and UserLocation (fields nullable). */
interface LocationWeatherCardProps {
  weather: {
    current: CurrentWeather | null;
    daily: DailyForecast[] | null;
    airQuality: AirQuality | null;
  };
  location: {
    postalCode: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

function getWeatherIcon(code: number, isDay: boolean = true, className: string = "w-6 h-6") {
  if (code === 0 || code === 1) {
    return isDay ? <WiDaySunny className={`${className} text-yellow-400`} /> : <WiNightClear className={`${className} text-slate-300`} />;
  }
  if (code === 2 || code === 3) {
    return <WiCloudy className={`${className} text-gray-400`} />;
  }
  if (code === 45 || code === 48) {
    return <WiFog className={`${className} text-gray-400`} />;
  }
  if (code >= 51 && code <= 67) {
    return <WiRain className={`${className} text-blue-600`} />;
  }
  if (code >= 71 && code <= 77) {
    return <WiSnow className={`${className} text-blue-200`} />;
  }
  if (code >= 80 && code <= 82) {
    return <WiRain className={`${className} text-blue-600`} />;
  }
  if (code >= 85 && code <= 86) {
    return <WiSnow className={`${className} text-blue-200`} />;
  }
  if (code >= 95) {
    return <WiThunderstorm className={`${className} text-yellow-400`} />;
  }
  return <WiCloudy className={`${className} text-gray-400`} />;
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tmrw";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "text-green-400" };
  if (uv <= 5) return { label: "Mod", color: "text-yellow-400" };
  if (uv <= 7) return { label: "High", color: "text-orange-400" };
  if (uv <= 10) return { label: "V.High", color: "text-red-600" };
  return { label: "Extreme", color: "text-blue-600" };
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "text-green-400";
  if (aqi <= 100) return "text-yellow-400";
  if (aqi <= 150) return "text-orange-400";
  if (aqi <= 200) return "text-red-600";
  return "text-blue-600";
}

function isGoodForOutdoorWork(day: DailyForecast): boolean {
  const badWeatherCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
  return (
    !badWeatherCodes.includes(day.weatherCode) &&
    day.precipitationProbability < 40 &&
    day.temperatureMax < 95 &&
    day.temperatureMin > 32 &&
    day.windSpeedMax < 25
  );
}

const DEFAULT_AIR_QUALITY: AirQuality = { aqi: 0, pm25: 0, pm10: 0, description: "Unknown" };

export function LocationWeatherCard({ weather, location }: LocationWeatherCardProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!weather?.current || !weather?.daily?.length) return null;

  const current = weather.current;
  const daily = weather.daily;
  const airQuality = weather.airQuality ?? DEFAULT_AIR_QUALITY;

  const bestDays = daily.filter(isGoodForOutdoorWork).slice(0, 3);
  const todayForecast = daily[0];

  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <IoLocationOutline className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Your Area</h3>
            <p className="text-[10px] text-gray-500">{[location.city, location.postalCode].filter(Boolean).join(", ") || "Your area"}</p>
          </div>
        </div>
      </div>

      {/* Current Weather */}
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              {getWeatherIcon(current.weatherCode, current.isDay)}
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {Math.round(current.temperature)}°
                </span>
                <span className="text-xs text-gray-500">F</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600">{current.weatherDescription}</p>
            </div>
          </div>
          <div className="text-right space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-end gap-1 text-[10px] sm:text-xs text-gray-500">
              <WiThermometer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Feels {Math.round(current.feelsLike)}°</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[10px] sm:text-xs text-gray-500">
              <WiStrongWind className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{Math.round(current.windSpeed)} mph</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[10px] sm:text-xs text-gray-500">
              <WiRaindrop className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{current.humidity}%</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <div className="flex-1 p-1.5 sm:p-2 rounded-lg bg-white">
            <p className="text-[8px] sm:text-[10px] text-gray-500 mb-0.5 sm:mb-1">UV Index</p>
            <div className="flex items-center gap-1">
              <WiDaySunny className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              <span className={cn("text-xs sm:text-sm font-medium", getUVLevel(current.uvIndex).color)}>
                {current.uvIndex}
              </span>
              <span className={cn("text-[8px] sm:text-[10px] hidden sm:inline", getUVLevel(current.uvIndex).color)}>
                {getUVLevel(current.uvIndex).label}
              </span>
            </div>
          </div>
          <div className="flex-1 p-1.5 sm:p-2 rounded-lg bg-white">
            <p className="text-[8px] sm:text-[10px] text-gray-500 mb-0.5 sm:mb-1">Air Quality</p>
            <div className="flex items-center gap-1">
              <span className={cn("text-xs sm:text-sm font-medium", getAQIColor(airQuality.aqi))}>
                {airQuality.aqi}
              </span>
              <span className={cn("text-[8px] sm:text-[10px]", getAQIColor(airQuality.aqi))}>
                {airQuality.description}
              </span>
            </div>
          </div>
          {todayForecast && (
            <div className="flex-1 p-1.5 sm:p-2 rounded-lg bg-white">
              <p className="text-[8px] sm:text-[10px] text-gray-500 mb-0.5 sm:mb-1">Sun</p>
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
                <div className="flex items-center gap-0.5">
                  <WiSunrise className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  <span className="text-gray-600 hidden sm:inline">{todayForecast.sunrise}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <WiSunset className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                  <span className="text-gray-600 hidden sm:inline">{todayForecast.sunset}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Best Days for Outdoor Work */}
        {bestDays.length > 0 && (
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 mb-1">
              <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-400" />
              <p className="text-[10px] font-medium text-green-400">Best for outdoor work</p>
            </div>
            <p className="text-xs text-green-200/80">
              {bestDays.map((d) => getDayName(d.date)).join(", ")}
            </p>
          </div>
        )}

        {/* 7-Day Forecast */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-3">
          {daily.slice(0, 7).map((day, index) => {
            const isGood = isGoodForOutdoorWork(day);
            const isSelected = selectedDayIndex === index;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(index)}
                className={cn(
                  "p-1 sm:p-1.5 rounded-lg text-center transition-all",
                  isSelected
                    ? "bg-blue-100 border border-blue-200"
                    : isGood
                    ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/20"
                    : "bg-white hover:bg-gray-100 border border-transparent"
                )}
              >
                <p className={cn(
                  "text-[8px] sm:text-[10px] mb-0.5",
                  isSelected ? "text-blue-600" : "text-gray-500"
                )}>
                  {getDayName(day.date)}
                </p>
                <div className="flex justify-center mb-0.5">
                  {getWeatherIcon(day.weatherCode, true, "w-4 h-4 sm:w-5 sm:h-5")}
                </div>
                <p className={cn(
                  "text-[10px] sm:text-xs font-medium",
                  isSelected ? "text-gray-900" : "text-gray-600"
                )}>
                  {Math.round(day.temperatureMax)}°
                </p>
                <p className="text-[8px] sm:text-[10px] text-gray-500">
                  {Math.round(day.temperatureMin)}°
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Day Detail */}
        {daily[selectedDayIndex] && (
          <div className="p-3 rounded-lg bg-white border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getWeatherIcon(daily[selectedDayIndex].weatherCode, true, "w-8 h-8")}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getDayName(daily[selectedDayIndex].date) === "Today" || getDayName(daily[selectedDayIndex].date) === "Tmrw"
                      ? getDayName(daily[selectedDayIndex].date)
                      : new Date(daily[selectedDayIndex].date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                  <p className="text-xs text-gray-500">{daily[selectedDayIndex].weatherDescription}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {Math.round(daily[selectedDayIndex].temperatureMax)}°
                  <span className="text-gray-500 text-sm ml-1">/ {Math.round(daily[selectedDayIndex].temperatureMin)}°</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              <div className="p-2 rounded bg-white">
                <WiRaindrop className="w-5 h-5 text-blue-600 mx-auto mb-0.5" />
                <p className="text-[10px] text-gray-500">Precip</p>
                <p className="text-xs font-medium text-gray-900">{daily[selectedDayIndex].precipitationProbability}%</p>
              </div>
              <div className="p-2 rounded bg-white">
                <WiStrongWind className="w-5 h-5 text-slate-400 mx-auto mb-0.5" />
                <p className="text-[10px] text-gray-500">Wind</p>
                <p className="text-xs font-medium text-gray-900">{daily[selectedDayIndex].windSpeedMax} mph</p>
              </div>
              <div className="p-2 rounded bg-white">
                <WiSunrise className="w-5 h-5 text-amber-600 mx-auto mb-0.5" />
                <p className="text-[10px] text-gray-500">Sunrise</p>
                <p className="text-xs font-medium text-gray-900">{daily[selectedDayIndex].sunrise}</p>
              </div>
              <div className="p-2 rounded bg-white">
                <WiSunset className="w-5 h-5 text-rose-400 mx-auto mb-0.5" />
                <p className="text-[10px] text-gray-500">Sunset</p>
                <p className="text-xs font-medium text-gray-900">{daily[selectedDayIndex].sunset}</p>
              </div>
            </div>

            {/* 24-Hour Forecast */}
            {daily[selectedDayIndex].hourly && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-[10px] font-medium text-gray-500 mb-2">24-HOUR FORECAST</p>
                <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {daily[selectedDayIndex].hourly.map((hour) => (
                    <div
                      key={hour.hour}
                      className={cn(
                        "flex-shrink-0 w-12 p-1.5 rounded-lg text-center",
                        hour.isDay ? "bg-white" : "bg-gray-50"
                      )}
                    >
                      <p className="text-[9px] text-gray-500 mb-1">{hour.time}</p>
                      <div className="flex justify-center mb-1">
                        {getWeatherIcon(hour.weatherCode, hour.isDay, "w-4 h-4")}
                      </div>
                      <p className="text-[11px] font-medium text-gray-900">{hour.temperature}°</p>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        <WiRaindrop className="w-3 h-3 text-blue-600/60" />
                        <span className="text-[8px] text-gray-500">{hour.precipProbability}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isGoodForOutdoorWork(daily[selectedDayIndex]) && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400">
                <IoCheckmarkCircle className="w-4 h-4" />
                <span>Good conditions for outdoor work</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compact Map Placeholder */}
      <div className="relative h-20 sm:h-24 bg-white overflow-hidden">
        {/* Fake map tiles */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
        {/* Streets */}
        <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gray-300" />
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300" />

        {/* Center pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>

        {/* Map attribution */}
        <div className="absolute bottom-1 right-2 text-[8px] text-gray-500">
          Demo Map
        </div>
      </div>
    </div>
  );
}
