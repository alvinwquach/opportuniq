"use server";

import { getWeatherForecast, getAirQuality } from "@/lib/integrations/weather";

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

export interface LocationWeatherData {
  weather: WeatherData | null;
  airQuality: AirQuality | null;
}

export async function getLocationWeatherData(
  latitude: number | null,
  longitude: number | null
): Promise<LocationWeatherData> {
  if (!latitude || !longitude) {
    return { weather: null, airQuality: null };
  }

  try {
    const [weatherData, aqiData] = await Promise.all([
      getWeatherForecast(latitude, longitude, 7),
      getAirQuality(latitude, longitude).catch(() => null),
    ]);

    return {
      weather: weatherData,
      airQuality: aqiData,
    };
  } catch (error) {
    return { weather: null, airQuality: null };
  }
}
