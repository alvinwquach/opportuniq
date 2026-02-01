// Generate hourly forecast for a day
function generateHourlyForecast(baseTemp: number, tempMin: number, tempMax: number, weatherCode: number, sunrise: string, sunset: string) {
  const hours = [];
  const sunriseHour = parseInt(sunrise.split(':')[0]) + (sunrise.includes('PM') && !sunrise.startsWith('12') ? 12 : 0);
  const sunsetHour = parseInt(sunset.split(':')[0]) + (sunset.includes('PM') && !sunset.startsWith('12') ? 12 : 0);

  for (let hour = 0; hour < 24; hour++) {
    const isDay = hour >= sunriseHour && hour < sunsetHour;
    // Temperature curve: coldest at 5am, warmest at 3pm
    const tempProgress = Math.sin(((hour - 5) / 24) * Math.PI);
    const temp = Math.round(tempMin + (tempMax - tempMin) * Math.max(0, tempProgress));

    hours.push({
      hour,
      time: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
      temperature: temp,
      weatherCode: weatherCode,
      isDay,
      precipProbability: Math.round(Math.random() * 30),
      windSpeed: Math.round(8 + Math.random() * 10),
    });
  }
  return hours;
}

// Mock weather data for Columbus, Ohio
export const mockWeatherData = {
  current: {
    temperature: 28,
    feelsLike: 22,
    humidity: 65,
    windSpeed: 12,
    weatherCode: 3,
    weatherDescription: 'Overcast',
    isDay: true,
    uvIndex: 2,
    precipitation: 0,
    visibility: 10000,
  },
  daily: [
    {
      date: new Date().toISOString().split('T')[0],
      temperatureMax: 34,
      temperatureMin: 22,
      precipitationProbability: 20,
      weatherCode: 3,
      weatherDescription: 'Overcast',
      sunrise: '7:38 AM',
      sunset: '5:52 PM',
      windSpeedMax: 15,
      uvIndexMax: 2,
      hourly: generateHourlyForecast(28, 22, 34, 3, '7:38 AM', '5:52 PM'),
    },
    {
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperatureMax: 38,
      temperatureMin: 26,
      precipitationProbability: 45,
      weatherCode: 71,
      weatherDescription: 'Light Snow',
      sunrise: '7:37 AM',
      sunset: '5:53 PM',
      windSpeedMax: 18,
      uvIndexMax: 2,
      hourly: generateHourlyForecast(32, 26, 38, 71, '7:37 AM', '5:53 PM'),
    },
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperatureMax: 32,
      temperatureMin: 20,
      precipitationProbability: 60,
      weatherCode: 73,
      weatherDescription: 'Snow',
      sunrise: '7:36 AM',
      sunset: '5:54 PM',
      windSpeedMax: 22,
      uvIndexMax: 1,
      hourly: generateHourlyForecast(26, 20, 32, 73, '7:36 AM', '5:54 PM'),
    },
    {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperatureMax: 28,
      temperatureMin: 18,
      precipitationProbability: 30,
      weatherCode: 2,
      weatherDescription: 'Partly Cloudy',
      sunrise: '7:35 AM',
      sunset: '5:56 PM',
      windSpeedMax: 14,
      uvIndexMax: 2,
      hourly: generateHourlyForecast(23, 18, 28, 2, '7:35 AM', '5:56 PM'),
    },
    {
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperatureMax: 35,
      temperatureMin: 24,
      precipitationProbability: 10,
      weatherCode: 1,
      weatherDescription: 'Mostly Clear',
      sunrise: '7:34 AM',
      sunset: '5:57 PM',
      windSpeedMax: 10,
      uvIndexMax: 3,
      hourly: generateHourlyForecast(30, 24, 35, 1, '7:34 AM', '5:57 PM'),
    },
    {
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperatureMax: 42,
      temperatureMin: 28,
      precipitationProbability: 15,
      weatherCode: 2,
      weatherDescription: 'Partly Cloudy',
      sunrise: '7:32 AM',
      sunset: '5:58 PM',
      windSpeedMax: 12,
      uvIndexMax: 3,
      hourly: generateHourlyForecast(35, 28, 42, 2, '7:32 AM', '5:58 PM'),
    },
    {
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperatureMax: 45,
      temperatureMin: 32,
      precipitationProbability: 25,
      weatherCode: 61,
      weatherDescription: 'Light Rain',
      sunrise: '7:31 AM',
      sunset: '6:00 PM',
      windSpeedMax: 14,
      uvIndexMax: 2,
      hourly: generateHourlyForecast(38, 32, 45, 61, '7:31 AM', '6:00 PM'),
    },
  ],
  airQuality: {
    aqi: 38,
    pm25: 7.1,
    pm10: 12.8,
    description: 'Good',
  },
};

export const mockUserLocation = {
  postalCode: '43215',
  city: 'Columbus',
  state: 'OH',
  latitude: 39.9612,
  longitude: -82.9988,
};
