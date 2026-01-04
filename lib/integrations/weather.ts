/**
 * Open-Meteo Weather API Integration
 *
 * Free tier: 10,000 calls/day (non-commercial)
 * Documentation: https://open-meteo.com/en/docs
 *
 * No API key required!
 *
 * Usage: Weather forecasts for scheduling decisions, outdoor work planning
 */

interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
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

interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs
const weatherCodeDescriptions: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function getWeatherDescription(code: number): string {
  return weatherCodeDescriptions[code] || "Unknown";
}

/**
 * Get weather forecast for a location
 *
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param days - Number of forecast days (1-16, default: 7)
 * @param timezone - Timezone (default: "auto")
 */
export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  days: number = 7,
  timezone: string = "auto"
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone,
    forecast_days: Math.min(days, 16).toString(),
    // Current weather
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "weather_code",
      "is_day",
      "precipitation",
      "cloud_cover",
      "visibility",
      "uv_index",
    ].join(","),
    // Daily forecast
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "weather_code",
      "sunrise",
      "sunset",
      "wind_speed_10m_max",
      "uv_index_max",
    ].join(","),
    // Hourly forecast (next 24 hours)
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "visibility",
      "uv_index",
    ].join(","),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Transform the response into a cleaner format
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    current: {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      weatherDescription: getWeatherDescription(data.current.weather_code),
      isDay: data.current.is_day === 1,
      precipitation: data.current.precipitation,
      cloudCover: data.current.cloud_cover,
      visibility: data.current.visibility,
      uvIndex: data.current.uv_index,
    },
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      temperatureMax: data.daily.temperature_2m_max[i],
      temperatureMin: data.daily.temperature_2m_min[i],
      precipitationProbability: data.daily.precipitation_probability_max[i],
      precipitationSum: data.daily.precipitation_sum[i],
      weatherCode: data.daily.weather_code[i],
      weatherDescription: getWeatherDescription(data.daily.weather_code[i]),
      sunrise: data.daily.sunrise[i],
      sunset: data.daily.sunset[i],
      windSpeedMax: data.daily.wind_speed_10m_max[i],
      uvIndexMax: data.daily.uv_index_max[i],
    })),
    // Return all hourly data for the requested days (24 hours * days)
    hourly: data.hourly.time.map((time: string, i: number) => ({
      time,
      temperature: data.hourly.temperature_2m[i],
      feelsLike: data.hourly.apparent_temperature[i],
      humidity: data.hourly.relative_humidity_2m[i],
      precipitationProbability: data.hourly.precipitation_probability[i],
      precipitation: data.hourly.precipitation[i],
      weatherCode: data.hourly.weather_code[i],
      weatherDescription: getWeatherDescription(data.hourly.weather_code[i]),
      windSpeed: data.hourly.wind_speed_10m[i],
      visibility: data.hourly.visibility[i],
      uvIndex: data.hourly.uv_index[i],
    })),
  };
}

/**
 * Get weather forecast by ZIP code
 * Requires geocoding the ZIP first (uses Mapbox)
 */
export async function getWeatherByZipCode(
  zipCode: string,
  days: number = 7
): Promise<WeatherResponse | null> {
  // Import geocoding function
  const { geocodePostalCode } = await import("@/lib/geocoding");

  const location = await geocodePostalCode(zipCode);

  if (!location) {
    console.error(`Could not geocode ZIP code: ${zipCode}`);
    return null;
  }

  return getWeatherForecast(location.latitude, location.longitude, days);
}

/**
 * Check if weather is suitable for outdoor work
 */
export function isGoodWeatherForOutdoorWork(current: CurrentWeather): {
  suitable: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Check precipitation
  if (current.precipitation > 0) {
    reasons.push(`Currently precipitating (${current.precipitation}" rain)`);
  }

  // Check temperature
  if (current.temperature < 32) {
    reasons.push(`Too cold (${current.temperature}°F)`);
  } else if (current.temperature > 95) {
    reasons.push(`Too hot (${current.temperature}°F)`);
  }

  // Check wind
  if (current.windSpeed > 25) {
    reasons.push(`High winds (${current.windSpeed} mph)`);
  }

  // Check visibility
  if (current.visibility < 1000) {
    reasons.push(`Low visibility (${(current.visibility / 1000).toFixed(1)} km)`);
  }

  // Check for severe weather codes
  const severeWeatherCodes = [65, 66, 67, 75, 82, 86, 95, 96, 99];
  if (severeWeatherCodes.includes(current.weatherCode)) {
    reasons.push(`Severe weather: ${current.weatherDescription}`);
  }

  return {
    suitable: reasons.length === 0,
    reasons,
  };
}

/**
 * Find the best days for outdoor work in the forecast
 */
export function findBestDaysForOutdoorWork(
  daily: DailyForecast[],
  maxDays: number = 3
): DailyForecast[] {
  return daily
    .filter((day) => {
      // Filter out bad weather days
      const badWeatherCodes = [
        51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85,
        86, 95, 96, 99,
      ];
      return (
        !badWeatherCodes.includes(day.weatherCode) &&
        day.precipitationProbability < 40 &&
        day.temperatureMax < 95 &&
        day.temperatureMin > 32 &&
        day.windSpeedMax < 25
      );
    })
    .slice(0, maxDays);
}

/**
 * Get air quality data (also free from Open-Meteo)
 */
export async function getAirQuality(
  latitude: number,
  longitude: number
): Promise<{
  aqi: number;
  pm25: number;
  pm10: number;
  description: string;
}> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: ["us_aqi", "pm2_5", "pm10"].join(","),
  });

  const response = await fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`
  );

  if (!response.ok) {
    throw new Error(`Open-Meteo Air Quality API error: ${response.statusText}`);
  }

  const data = await response.json();

  const aqi = data.current.us_aqi;
  let description = "Unknown";

  if (aqi <= 50) description = "Good";
  else if (aqi <= 100) description = "Moderate";
  else if (aqi <= 150) description = "Unhealthy for Sensitive Groups";
  else if (aqi <= 200) description = "Unhealthy";
  else if (aqi <= 300) description = "Very Unhealthy";
  else description = "Hazardous";

  return {
    aqi,
    pm25: data.current.pm2_5,
    pm10: data.current.pm10,
    description,
  };
}
