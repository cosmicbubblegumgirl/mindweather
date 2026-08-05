import type { AppState, WeatherCheckin, WeatherId } from "@/lib/types";

export const weatherService = {
  checkIn(state: AppState, weather: WeatherId, values: Omit<WeatherCheckin, "id" | "weather" | "createdAt">): AppState {
    const checkin: WeatherCheckin = {
      id: crypto.randomUUID(),
      weather,
      ...values,
      createdAt: new Date().toISOString(),
    };
    return { ...state, currentWeather: weather, weatherCheckins: [checkin, ...state.weatherCheckins] };
  },
};
