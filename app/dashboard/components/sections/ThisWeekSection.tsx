"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  IoCalendar,
  IoConstruct,
  IoCall,
  IoNotifications,
  IoSunny,
  IoCloud,
  IoRainy,
  IoSnow,
  IoThunderstorm,
  IoWater,
  IoHome
} from "react-icons/io5";
import { WiFog } from "react-icons/wi";

interface CalendarEvent {
  id: string;
  issueId?: string;
  title: string;
  date: Date | string;
  time?: string | null;
  type: "diy" | "contractor" | "reminder" | "wfh" | "away";
  groupName?: string;
}

interface DayForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  precipitationProbability: number;
}

interface ThisWeekSectionProps {
  events: CalendarEvent[];
  postalCode?: string | null;
}

// Weather code to icon mapping
function getWeatherIcon(code: number, className: string = "w-3.5 h-3.5") {
  // Clear
  if (code === 0 || code === 1) return <IoSunny className={`${className} text-amber-400`} />;
  // Partly cloudy
  if (code === 2 || code === 3) return <IoCloud className={`${className} text-slate-400`} />;
  // Fog
  if (code >= 45 && code <= 48) return <WiFog className={`${className} text-slate-400`} />;
  // Drizzle/Rain
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
    return <IoRainy className={`${className} text-blue-600`} />;
  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return <IoSnow className={`${className} text-blue-200`} />;
  // Thunderstorm
  if (code >= 95) return <IoThunderstorm className={`${className} text-purple-400`} />;
  // Default
  return <IoCloud className={`${className} text-slate-400`} />;
}

export function ThisWeekSection({ events, postalCode }: ThisWeekSectionProps) {
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(false);

  // Get current week's days
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  // Fetch weather forecast
  useEffect(() => {
    async function fetchWeather() {
      if (!postalCode) return;

      setLoading(true);
      try {
        // Use geocoding to get coordinates from postal code
        const geocodeRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(postalCode)}.json?country=US&types=postcode&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
        );
        const geocodeData = await geocodeRes.json();

        if (geocodeData.features?.[0]?.center) {
          const [lng, lat] = geocodeData.features[0].center;

          // Fetch weather from Open-Meteo
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=7`
          );
          const weatherData = await weatherRes.json();

          if (weatherData.daily) {
            const forecasts: DayForecast[] = weatherData.daily.time.map((date: string, i: number) => ({
              date,
              temperatureMax: weatherData.daily.temperature_2m_max[i],
              temperatureMin: weatherData.daily.temperature_2m_min[i],
              weatherCode: weatherData.daily.weather_code[i],
              precipitationProbability: weatherData.daily.precipitation_probability_max[i],
            }));
            setForecast(forecasts);
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [postalCode]);

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // Get forecast for a specific day
  const getForecastForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return forecast.find((f) => f.date === dateStr);
  };

  const formatDayName = (date: Date, index: number) => {
    // Always use the weekday letter for the compact calendar view
    const weekdayLetter = date.toLocaleDateString(undefined, { weekday: "short" }).charAt(0);
    return weekdayLetter;
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "diy":
        return <IoConstruct className="w-3 h-3 text-blue-600" />;
      case "contractor":
        return <IoCall className="w-3 h-3 text-purple-400" />;
      case "wfh":
        return <IoHome className="w-3 h-3 text-blue-600" />;
      default:
        return <IoNotifications className="w-3 h-3 text-amber-400" />;
    }
  };

  return (
    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <IoCalendar className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">This Week</h3>
            <p className="text-[10px] text-gray-400">
              {events.length} event{events.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-blue-600 hover:text-blue-600/80 transition-colors"
        >
          Full Calendar
        </Link>
      </div>

      {/* Week View with Weather */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const dayForecast = getForecastForDay(date);
          const isToday = index === 0;
          const hasRain = dayForecast && dayForecast.precipitationProbability > 50;

          return (
            <div
              key={index}
              className={`flex flex-col items-center p-1.5 rounded-lg ${
                isToday
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-100"
              } transition-colors`}
            >
              <span className={`text-[10px] ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                {formatDayName(date, index)}
              </span>
              <span className={`text-xs font-medium ${isToday ? "text-gray-900" : "text-[#a3a3a3]"}`}>
                {date.getDate()}
              </span>

              {/* Weather Icon */}
              {dayForecast && (
                <div className="mt-1">
                  {getWeatherIcon(dayForecast.weatherCode, "w-3 h-3")}
                </div>
              )}

              {/* Temperature */}
              {dayForecast && (
                <span className="text-[9px] text-gray-400">
                  {Math.round(dayForecast.temperatureMax)}°
                </span>
              )}

              {/* Event Indicators */}
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayEvents.slice(0, 2).map((event, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        event.type === "diy"
                          ? "bg-blue-600"
                          : event.type === "contractor"
                          ? "bg-purple-400"
                          : event.type === "wfh"
                          ? "bg-blue-400"
                          : "bg-amber-400"
                      }`}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-[8px] text-gray-400">+{dayEvents.length - 2}</span>
                  )}
                </div>
              )}

              {/* Rain Warning */}
              {hasRain && (
                <div className="mt-0.5">
                  <IoWater className="w-2.5 h-2.5 text-blue-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Events List */}
      {events.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          {events.slice(0, 4).map((event) => {
            const eventDate = new Date(event.date);
            const dayForecast = getForecastForDay(eventDate);

            return (
              <Link
                key={event.id}
                href={event.issueId ? `/dashboard/projects/${event.issueId}` : "/calendar"}
                className="flex items-center gap-2 p-2 -mx-1 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    event.type === "diy"
                      ? "bg-blue-50"
                      : event.type === "contractor"
                      ? "bg-purple-500/10"
                      : event.type === "wfh"
                      ? "bg-blue-50"
                      : "bg-amber-500/10"
                  }`}
                >
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span>
                      {eventDate.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {event.time && (
                      <>
                        <span className="text-[#333]">·</span>
                        <span>{event.time}</span>
                      </>
                    )}
                    {event.groupName && (
                      <>
                        <span className="text-[#333]">·</span>
                        <span className="text-purple-400">{event.groupName}</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Weather indicator for event day */}
                {dayForecast && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    {getWeatherIcon(dayForecast.weatherCode, "w-3 h-3")}
                    <span>{Math.round(dayForecast.temperatureMax)}°</span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-3 border-t border-gray-200">
          <p className="text-xs text-gray-400">No events this week</p>
          <Link
            href="/dashboard/projects"
            className="text-[10px] text-blue-600 hover:text-blue-600/80 mt-1 inline-block"
          >
            Schedule a DIY project →
          </Link>
        </div>
      )}
    </div>
  );
}
