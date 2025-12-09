export type WeatherData = {
    date: string;
    snowfall_sum: number;
    precipitation_probability_max: number;
    wind_speed_10m_max: number;
    visibility_min: number; // In meters
    temperature_2m_max: number;
    temperature_2m_min: number;
};

export type ForecastResult = {
    resortId: string;
    daily: WeatherData[];
};

export async function fetchForecast(
    lat: number,
    lon: number,
    startDate: string, // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
): Promise<WeatherData[]> {
    try {
        const timezone = "Asia/Tokyo";
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum,precipitation_probability_max,wind_speed_10m_max,visibility_min,temperature_2m_max,temperature_2m_min&timezone=${timezone}&start_date=${startDate}&end_date=${endDate}`;

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Failed to fetch weather data");
        }
        const data = await res.json();

        const daily = data.daily;
        const result: WeatherData[] = daily.time.map((date: string, i: number) => ({
            date,
            snowfall_sum: daily.snowfall_sum[i],
            precipitation_probability_max: daily.precipitation_probability_max[i],
            wind_speed_10m_max: daily.wind_speed_10m_max[i],
            visibility_min: daily.visibility_min ? daily.visibility_min[i] : 10000, // Default to good visibility if null
            temperature_2m_max: daily.temperature_2m_max[i],
            temperature_2m_min: daily.temperature_2m_min[i],
        }));

        return result;
    } catch (error) {
        console.error("Error fetching forecast:", error);
        return [];
    }
}
