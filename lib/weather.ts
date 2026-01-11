export type WeatherData = {
    date: string;
    snowfall_sum: number;
    precipitation_probability_max: number;
    wind_speed_10m_max: number;
    visibility_min: number; // In meters
    temperature_2m_max: number;
    temperature_2m_min: number;
    historical_snowfall?: number;
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

        // Fetch historical data in parallel
        const historicalAverages = await fetchHistoricalAverage(lat, lon, startDate, endDate);

        const result: WeatherData[] = daily.time.map((date: string, i: number) => ({
            date,
            snowfall_sum: daily.snowfall_sum[i],
            precipitation_probability_max: daily.precipitation_probability_max[i],
            wind_speed_10m_max: daily.wind_speed_10m_max[i],
            visibility_min: daily.visibility_min ? daily.visibility_min[i] : 10000, // Default to good visibility if null
            temperature_2m_max: daily.temperature_2m_max[i],
            temperature_2m_min: daily.temperature_2m_min[i],
            historical_snowfall: historicalAverages[date] || 0,
        }));

        return result;
    } catch (error) {
        console.error("Error fetching forecast:", error);
        return [];
    }
}

async function fetchHistoricalAverage(
    lat: number,
    lon: number,
    startDate: string,
    endDate: string
): Promise<Record<string, number>> {
    try {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 10 }, (_, i) => currentYear - 1 - i); // Last 10 years
        // We need to map requested dates (e.g. 2025-01-10) to historical dates (2024-01-10)
        // Limitation: leap years might shift things by a day, but for snowfall trends it's acceptable.

        // Helper to adjust year
        const adjustYear = (dateStr: string, year: number) => {
            const d = new Date(dateStr);
            d.setFullYear(year);
            return d.toISOString().split('T')[0];
        };

        const startDates = years.map(y => adjustYear(startDate, y));
        const endDates = years.map(y => adjustYear(endDate, y));

        // Fetch parallel
        const promises = years.map(async (year, idx) => {
            const s = startDates[idx];
            const e = endDates[idx];
            const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${s}&end_date=${e}&daily=snowfall_sum&timezone=Asia/Tokyo`;
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json();
        });

        const results = await Promise.all(promises);

        // Aggregation: Map keys are NOT the historical dates, but the "MM-DD" part to match current year
        // Actually, simpler: map by index since all requests are clearly bounded by start/end with same duration
        // Assuming the API returns the same number of days for each request.

        const averages: Record<string, number> = {};

        // We need to know the target dates to map back to
        const targetStart = new Date(startDate);
        const targetEnd = new Date(endDate);
        const daysDiff = Math.floor((targetEnd.getTime() - targetStart.getTime()) / (1000 * 3600 * 24)) + 1;

        for (let i = 0; i < daysDiff; i++) {
            let sum = 0;
            let count = 0;

            results.forEach(r => {
                if (r && r.daily && r.daily.snowfall_sum && r.daily.snowfall_sum[i] !== undefined) {
                    sum += r.daily.snowfall_sum[i] || 0;
                    count++;
                }
            });

            const avg = count > 0 ? sum / count : 0;

            // reconstruct the target date key
            const d = new Date(targetStart);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().split('T')[0];
            averages[key] = avg;
        }

        return averages;

    } catch (e) {
        console.error("Historical fetch failed", e);
        return {};
    }
}
