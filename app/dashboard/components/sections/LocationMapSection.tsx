"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { LocationMap } from "../LocationMap";
import { LocationSetupDialog } from "./LocationSetupDialog";
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
import {
  IoShieldCheckmark,
  IoCheckmarkCircle,
  IoWarning,
  IoTime,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import { cn } from "@/lib/utils";
import type { LocationWeatherData } from "../../weather-actions";

interface UserProfile {
  id: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
}

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

interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number;
  precipitationSum: number;
  weatherCode: number;
  weatherDescription: string;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
  uvIndexMax: number;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
}

interface AirQuality {
  aqi: number;
  pm25: number;
  pm10: number;
  description: string;
}

interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

interface LocationMapSectionProps {
  userProfile: UserProfile;
  weatherData: LocationWeatherData;
}

function getWeatherIcon(code: number, isDay: boolean = true) {
  if (code === 0 || code === 1) {
    return isDay ? <WiDaySunny className="w-6 h-6 text-yellow-400" /> : <WiNightClear className="w-6 h-6 text-slate-300" />;
  }
  if (code === 2 || code === 3) {
    return <WiCloudy className="w-6 h-6 text-gray-400" />;
  }
  if (code === 45 || code === 48) {
    return <WiFog className="w-6 h-6 text-gray-400" />;
  }
  if (code >= 51 && code <= 67) {
    return <WiRain className="w-6 h-6 text-blue-400" />;
  }
  if (code >= 71 && code <= 77) {
    return <WiSnow className="w-6 h-6 text-blue-200" />;
  }
  if (code >= 80 && code <= 82) {
    return <WiRain className="w-6 h-6 text-blue-400" />;
  }
  if (code >= 85 && code <= 86) {
    return <WiSnow className="w-6 h-6 text-blue-200" />;
  }
  if (code >= 95) {
    return <WiThunderstorm className="w-6 h-6 text-yellow-400" />;
  }
  return <WiCloudy className="w-6 h-6 text-gray-400" />;
}

function getDayName(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function getUVLevel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: "Low", color: "text-green-400" };
  if (uv <= 5) return { label: "Moderate", color: "text-yellow-400" };
  if (uv <= 7) return { label: "High", color: "text-orange-400" };
  if (uv <= 10) return { label: "Very High", color: "text-red-400" };
  return { label: "Extreme", color: "text-purple-400" };
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "text-green-400";
  if (aqi <= 100) return "text-yellow-400";
  if (aqi <= 150) return "text-orange-400";
  if (aqi <= 200) return "text-red-400";
  if (aqi <= 300) return "text-purple-400";
  return "text-rose-600";
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

function isNowHour(isoString: string): boolean {
  const hourDate = new Date(isoString);
  const now = new Date();
  return hourDate.getHours() === now.getHours() &&
         hourDate.getDate() === now.getDate() &&
         hourDate.getMonth() === now.getMonth();
}

function getHourlyForDay(hourly: HourlyForecast[], dayIndex: number): HourlyForecast[] {
  const now = new Date();

  if (dayIndex === 0) {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const currentHour = new Date(now);
    currentHour.setMinutes(0, 0, 0);

    const endTime = new Date(currentHour);
    endTime.setHours(endTime.getHours() + 24);

    return hourly.filter((h) => {
      const hourDate = new Date(h.time);
      return hourDate >= startOfToday && hourDate <= endTime;
    });
  } else {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + dayIndex);
    targetDate.setHours(0, 0, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(0, 0, 0, 0);

    return hourly.filter((h) => {
      const hourDate = new Date(h.time);
      return hourDate >= targetDate && hourDate < endTime;
    });
  }
}

function getWeatherAlerts(current: CurrentWeather, daily: DailyForecast[]): string[] {
  const alerts: string[] = [];

  if (current.uvIndex >= 8) {
    alerts.push(`Very high UV index (${current.uvIndex}) - limit sun exposure`);
  }
  if (current.windSpeed >= 25) {
    alerts.push(`High winds (${Math.round(current.windSpeed)} mph) - secure loose items`);
  }
  if (current.visibility < 1000) {
    alerts.push("Low visibility - drive carefully");
  }

  const severeWeatherCodes = [65, 66, 67, 75, 82, 86, 95, 96, 99];
  if (severeWeatherCodes.includes(current.weatherCode)) {
    alerts.push(`Severe weather: ${current.weatherDescription}`);
  }

  const tomorrow = daily[1];
  if (tomorrow) {
    if (tomorrow.precipitationProbability >= 70) {
      alerts.push(`${Math.round(tomorrow.precipitationProbability)}% chance of rain tomorrow`);
    }
    if (severeWeatherCodes.includes(tomorrow.weatherCode)) {
      alerts.push(`Severe weather expected tomorrow: ${tomorrow.weatherDescription}`);
    }
  }

  return alerts;
}

export function LocationMapSection({ userProfile, weatherData }: LocationMapSectionProps) {
  const { weather, airQuality } = weatherData;
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const updateScrollButtons = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  }, []);

  const checkVisibleDay = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !weather) return;

    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;

    const hourCards = container.querySelectorAll('[data-hour-time]');
    let visibleHourTime: string | null = null;

    for (const card of hourCards) {
      const cardRect = card.getBoundingClientRect();
      if (cardRect.left <= centerX && cardRect.right >= centerX) {
        visibleHourTime = card.getAttribute('data-hour-time');
        break;
      }
    }

    if (visibleHourTime) {
      const visibleDate = new Date(visibleHourTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((visibleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const newDayIndex = Math.max(0, Math.min(diffDays, 6));

      if (newDayIndex !== selectedDayIndex) {
        isScrollingRef.current = true;
        setSelectedDayIndex(newDayIndex);
      }
    }
  }, [weather, selectedDayIndex]);

  const scrollHourly = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    if (!isScrollingRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    isScrollingRef.current = false;

    const timer = setTimeout(updateScrollButtons, 100);
    return () => clearTimeout(timer);
  }, [selectedDayIndex, weather, updateScrollButtons]);

  const weatherAlerts = weather ? getWeatherAlerts(weather.current, weather.daily) : [];
  const bestDays = weather?.daily.filter(isGoodForOutdoorWork).slice(0, 3) || [];
  const todayForecast = weather?.daily[0];

  if (!userProfile.postalCode) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white">Your Area</h2>
        </div>
        <LocationSetupDialog userId={userProfile.id} />
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-white">Your Area</h2>
        <span className="text-xs text-[#9a9a9a]">{userProfile.postalCode}</span>
      </div>
      <div className="rounded-xl bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        {weatherAlerts.length > 0 && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20">
            <div className="flex items-start gap-2">
              <IoWarning className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {weatherAlerts.map((alert, i) => (
                  <p key={i} className="text-xs text-amber-200">{alert}</p>
                ))}
              </div>
            </div>
          </div>
        )}
        {weather && (
          <div className="p-4 border-b border-[#1f1f1f]">
            {/* Current Weather */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#1f1f1f] flex items-center justify-center">
                  {getWeatherIcon(weather.current.weatherCode, weather.current.isDay)}
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-white">
                      {Math.round(weather.current.temperature)}°
                    </span>
                    <span className="text-xs text-[#9a9a9a]">F</span>
                  </div>
                  <p className="text-xs text-[#a3a3a3]">{weather.current.weatherDescription}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center justify-end gap-1 text-xs text-[#9a9a9a]">
                  <WiThermometer className="w-4 h-4" />
                  <span>Feels {Math.round(weather.current.feelsLike)}°</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-xs text-[#9a9a9a]">
                  <WiStrongWind className="w-4 h-4" />
                  <span>{Math.round(weather.current.windSpeed)} mph</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-xs text-[#9a9a9a]">
                  <WiRaindrop className="w-4 h-4" />
                  <span>{weather.current.humidity}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="flex-1 p-2 rounded-lg bg-[#1a1a1a]">
                <p className="text-[10px] text-[#9a9a9a] mb-1">UV Index</p>
                <div className="flex items-center gap-1">
                  <WiDaySunny className="w-4 h-4 text-yellow-400" />
                  <span className={cn("text-sm font-medium", getUVLevel(weather.current.uvIndex).color)}>
                    {weather.current.uvIndex}
                  </span>
                  <span className={cn("text-[10px]", getUVLevel(weather.current.uvIndex).color)}>
                    {getUVLevel(weather.current.uvIndex).label}
                  </span>
                </div>
              </div>
              {airQuality && (
                <div className="flex-1 p-2 rounded-lg bg-[#1a1a1a]">
                  <p className="text-[10px] text-[#9a9a9a] mb-1">Air Quality</p>
                  <div className="flex items-center gap-1">
                    <IoShieldCheckmark className="w-3.5 h-3.5 text-[#9a9a9a]" />
                    <span className={cn("text-sm font-medium", getAQIColor(airQuality.aqi))}>
                      {airQuality.aqi}
                    </span>
                    <span className={cn("text-[10px]", getAQIColor(airQuality.aqi))}>
                      {airQuality.description}
                    </span>
                  </div>
                </div>
              )}
              {todayForecast && (
                <div className="flex-1 p-2 rounded-lg bg-[#1a1a1a]">
                  <p className="text-[10px] text-[#9a9a9a] mb-1">Sun</p>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-0.5">
                      <WiSunrise className="w-5 h-5 text-amber-400" />
                      <span className="text-[#a3a3a3]">{formatTime(todayForecast.sunrise)}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <WiSunset className="w-5 h-5 text-rose-500" />
                      <span className="text-[#a3a3a3]">{formatTime(todayForecast.sunset)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {bestDays.length > 0 && (
              <div className="mb-4 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <IoCheckmarkCircle className="w-3.5 h-3.5 text-green-400" />
                  <p className="text-[10px] font-medium text-green-400">Best for outdoor work</p>
                </div>
                <p className="text-xs text-green-200/80">
                  {bestDays.map((d) => getDayName(d.date)).join(", ")}
                </p>
              </div>
            )}

            {/* 7-Day Forecast - Clickable tabs */}
            <div className="grid grid-cols-7 gap-1 mb-3">
              {weather.daily.slice(0, 7).map((day, index) => {
                const isGood = isGoodForOutdoorWork(day);
                const isSelected = selectedDayIndex === index;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDayIndex(index)}
                    className={cn(
                      "p-1.5 rounded-lg text-center transition-all",
                      isSelected
                        ? "bg-[#00D4FF]/20 border border-[#00D4FF]/40"
                        : isGood
                        ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/20"
                        : "bg-[#1a1a1a] hover:bg-[#222] border border-transparent"
                    )}
                  >
                    <p className={cn(
                      "text-[10px] mb-0.5",
                      isSelected ? "text-[#00D4FF]" : "text-[#9a9a9a]"
                    )}>
                      {getDayName(day.date)}
                    </p>
                    <div className="flex justify-center mb-0.5">
                      {getWeatherIcon(day.weatherCode)}
                    </div>
                    <p className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-white" : "text-[#a3a3a3]"
                    )}>
                      {Math.round(day.temperatureMax)}°
                    </p>
                    <p className="text-[10px] text-[#9a9a9a]">
                      {Math.round(day.temperatureMin)}°
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="pt-3 border-t border-[#1f1f1f] overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <IoTime className="w-3 h-3 text-[#9a9a9a]" />
                  <p className="text-[10px] text-[#9a9a9a]">
                    Hourly forecast · {selectedDayIndex === 0 ? "Today" : getDayName(weather.daily[selectedDayIndex]?.date || "")}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollHourly("left")}
                    disabled={!canScrollLeft}
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      canScrollLeft
                        ? "bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#a3a3a3]"
                        : "text-[#4a4a4a] cursor-not-allowed"
                    )}
                    aria-label="Scroll left"
                  >
                    <IoChevronBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollHourly("right")}
                    disabled={!canScrollRight}
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      canScrollRight
                        ? "bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#a3a3a3]"
                        : "text-[#4a4a4a] cursor-not-allowed"
                    )}
                    aria-label="Scroll right"
                  >
                    <IoChevronForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Horizontal scrollable hourly forecast */}
              <div
                ref={scrollContainerRef}
                onScroll={() => {
                  updateScrollButtons();
                  checkVisibleDay();
                }}
                className="overflow-x-auto overflow-y-hidden scrollbar-hide"
              >
                <div className="flex gap-2" style={{ width: "max-content" }}>
                  {getHourlyForDay(weather.hourly, selectedDayIndex).map((hour, index, arr) => {
                    const isCurrentHour = selectedDayIndex === 0 && isNowHour(hour.time);
                    const hourDate = new Date(hour.time);
                    const prevHourDate = index > 0 ? new Date(arr[index - 1].time) : null;
                    const isNewDay = prevHourDate && hourDate.getDate() !== prevHourDate.getDate();
                    const isMidnight = hourDate.getHours() === 0;

                    return (
                      <div key={hour.time} className="flex gap-2" data-hour-time={hour.time}>
                        {isNewDay && (
                          <div className="flex-shrink-0 w-px bg-[#333] mx-1 relative">
                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-[#666] whitespace-nowrap bg-[#161616] px-1">
                              {getDayName(hour.time.split("T")[0])}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn(
                            "flex-shrink-0 w-14 py-2 px-1 rounded-xl text-center",
                            isCurrentHour
                              ? "bg-[#00D4FF]/20 border border-[#00D4FF]/40"
                              : isMidnight && !isCurrentHour
                              ? "bg-[#1f1f1f] border border-[#333]"
                              : "bg-[#1a1a1a]"
                          )}
                        >
                          <p className={cn(
                            "text-[10px] mb-1",
                            isCurrentHour ? "text-[#00D4FF] font-medium" : "text-[#9a9a9a]"
                          )}>
                            {isCurrentHour ? "Now" : formatTime(hour.time)}
                          </p>
                          <div className="flex justify-center mb-1">
                            {getWeatherIcon(hour.weatherCode)}
                          </div>
                          <p className="text-sm font-medium text-white">{Math.round(hour.temperature)}°</p>
                          {hour.precipitationProbability > 20 && (
                            <div className="flex items-center justify-center gap-0.5 mt-0.5">
                              <WiRaindrop className="w-3.5 h-3.5 text-blue-400" />
                              <span className="text-[10px] text-blue-400">
                                {hour.precipitationProbability}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        <LocationMap
          latitude={userProfile.latitude}
          longitude={userProfile.longitude}
          postalCode={userProfile.postalCode}
          country={userProfile.country || "US"}
          userId={userProfile.id}
          className="h-[250px]"
          zoom={14}
        />
      </div>
    </section>
  );
}
