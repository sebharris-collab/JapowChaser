export type WeatherData = {
    date: string;
    snowfall_sum: number;
    precipitation_probability_max: number;
    wind_speed_10m_max: number;
    wind_gusts_10m_max: number;
    visibility_min: number; // In meters
    temperature_2m_max: number;
    temperature_2m_min: number;
    historical_snowfall?: number;
};

export type ForecastResult = {
    resortId: string;
    daily: WeatherData[];
};

export async function fetchForecast(lat: number, lon: number, startDate: string, endDate: string) {
    try {
        const timezone = "Asia/Tokyo";
        
        /** * FIX: We request the JMA model for Japanese accuracy, 
         * and the standard 'best_match' (default) for long-range reliability.
         */
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=snowfall_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,visibility_min,temperature_2m_max,temperature_2m_min&timezone=${timezone}&start_date=${startDate}&end_date=${endDate}&models=jma_msm,best_match`;
        const res = await fetch(url);
        const data = await res.json();
        const d = data.daily;
        if (!d) return [];

        const historicalAverages = await fetchHistoricalAverage(lat, lon, startDate, endDate);

        return d.time.map((date: string, i: number) => {
            // Check JMA MSM first, then fallback to the 'best_match' (default) array
            const snowfall = d.snowfall_sum_jma_msm?.[i] ?? d.snowfall_sum_best_match?.[i] ?? 0;
            const maxTemp = d.temperature_2m_max_jma_msm?.[i] ?? d.temperature_2m_max_best_match?.[i] ?? 0;
            const minTemp = d.temperature_2m_min_jma_msm?.[i] ?? d.temperature_2m_min_best_match?.[i] ?? 0;
            const wind = d.wind_speed_10m_max_jma_msm?.[i] ?? d.wind_speed_10m_max_best_match?.[i] ?? 0;
            const wind_gust = d.wind_gusts_10m_max_jma_msm?.[i] ?? d.wind_gusts_10m_max_best_match?.[i] ?? 0;
            
            // Probability usually only exists in the global 'best_match'
            const prob = d.precipitation_probability_max_best_match?.[i] ?? d.precipitation_probability_max?.[i] ?? 0;

            return {
                date,
                snowfall_sum: Number(snowfall),
                precipitation_probability_max: Math.round(Number(prob)),
                wind_speed_10m_max: Number(wind),
                wind_gusts_10m_max: Number(wind_gust),
                visibility_min: d.visibility_min_best_match?.[i] ?? 10000,
                temperature_2m_max: Math.round(Number(maxTemp)),
                temperature_2m_min: Math.round(Number(minTemp)),
                historical_snowfall: historicalAverages[date] || 0,
            };
        });
    } catch (error) {
        console.error("Fetch error:", error);
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
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Define the decade range
        const startYear = start.getFullYear() - 10;
        const endYear = end.getFullYear() - 1;

        // Construct the strings for the API
        const histStart = `${startYear}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        const histEnd = `${endYear}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

        // We explicitly add &models=era5 (the most accurate historical model for Japan)
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${histStart}&end_date=${histEnd}&daily=snowfall_sum&timezone=Asia/Tokyo&models=era5`;

        const res = await fetch(url);
        if (!res.ok) return {};
        const data = await res.json();

        const dailyData = data.daily;
        if (!dailyData || !dailyData.time) return {};
        
        const statsMap: Record<string, { total: number, count: number }> = {};

        dailyData.time.forEach((dateStr: string, idx: number) => {
            // Using substring(5) to get "MM-DD"
            const mmDd = dateStr.substring(5); 
            const snowfall = dailyData.snowfall_sum[idx] || 0;

            if (!statsMap[mmDd]) {
                statsMap[mmDd] = { total: 0, count: 0 };
            }
            statsMap[mmDd].total += snowfall;
            statsMap[mmDd].count += 1;
        });

        const averages: Record<string, number> = {};
        let tempDate = new Date(start);
        
        // Use a loop that respects actual date objects to reconstruct the return map
        while (tempDate <= end) {
            // Reconstruct key: YYYY-MM-DD
            const year = tempDate.getFullYear();
            const month = String(tempDate.getMonth() + 1).padStart(2, '0');
            const day = String(tempDate.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;
            
            const mmDd = `${month}-${day}`;
            const stats = statsMap[mmDd];
            
            // Calculate average and round to 1 decimal place
            const avg = stats && stats.count > 0 ? stats.total / stats.count : 0;
            averages[dateKey] = Number(avg.toFixed(1));
            
            tempDate.setDate(tempDate.getDate() + 1);
        }

        return averages;
    } catch (e) {
        console.error("Historical fetch failed:", e);
        return {};
    }
}