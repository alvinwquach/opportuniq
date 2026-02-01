"use client";

import { LocationWeatherCard } from "./LocationWeatherCard";
import { ThisWeekCard } from "./ThisWeekCard";
import { RemindersCard } from "./RemindersCard";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: "contractor" | "diy" | "reminder";
  color?: string;
}

interface Reminder {
  id: string;
  issueId: string;
  title: string;
  groupName: string;
  date: Date;
}

interface PlanningTabProps {
  weather: {
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
  };
  location: {
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  calendarEvents: CalendarEvent[];
  reminders: Reminder[];
}

export function PlanningTab({ weather, location, calendarEvents, reminders }: PlanningTabProps) {
  return (
    <>
      {/* Weather & Outdoor Work Planning - Full width for visibility */}
      <LocationWeatherCard weather={weather} location={location} />

      {/* Calendar and Reminders side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ThisWeekCard events={calendarEvents} />
        <RemindersCard reminders={reminders} />
      </div>
    </>
  );
}
