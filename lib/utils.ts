import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WeatherData } from "./weather";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function calculatePowderScore(dailyData: WeatherData[]): number {
    let score = 0;

    // Sum total snowfall
    const totalSnowfall = dailyData.reduce((acc, curr) => acc + (curr.snowfall_sum || 0), 0);
    score += totalSnowfall * 2; // Base score weight

    // Penalties for visibility and wind on high snow days (snow > 5cm)
    dailyData.forEach(day => {
        if ((day.snowfall_sum || 0) > 5) {
            if (day.visibility_min < 200) {
                score -= 5;
            }
            if (day.wind_speed_10m_max > 30) {
                score -= 5;
            }
        }
    });

    return Math.round(score);
}
