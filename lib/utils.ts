import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WeatherData } from "./weather";
import { differenceInDays, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Preferences Interface
export interface UserPreferences {
    snowWeight: number; // 0-10, default 5
    tempWeight: number; // 0-10, default 5
    windWeight: number; // 0-10, default 5
    bluebirdWeight: number; // 0-10, default 5
}

export const DEFAULT_PREFERENCES: UserPreferences = {
    snowWeight: 5,
    tempWeight: 5,
    windWeight: 5,
    bluebirdWeight: 5
};

export interface ResortScore {
    resortId: string;
    rawScore: number;
    rank: number;       // 1 to N (1 is best)
    tags: string[];     // e.g., "Wind Hold Risk", "Bluebird"
}

/**
 * PHASE 1: Complex Reasoning with User Preferences
 */
export function calculateRawScore(dailyData: WeatherData[], prefs: UserPreferences = DEFAULT_PREFERENCES): { score: number; tags: string[] } {
    let totalScore = 0;
    const tags: Set<string> = new Set();

    // Normalize weights to a multiplier (0.5 to 1.5 range centered on 5)
    // 0 -> 0.5x, 5 -> 1.0x, 10 -> 1.5x
    const getWeightMult = (val: number) => 0.5 + (val / 10);

    const wSnow = getWeightMult(prefs.snowWeight);
    const wTemp = getWeightMult(prefs.tempWeight);
    const wWind = getWeightMult(prefs.windWeight); // Higher weight = more penalty sensitivy? Or just more importance on wind? 
    // Interpretation: "Focus on X". 
    // Focus on Wind = Avoid Wind. So if Wind Weight is high, penalties should be harsher.
    // Focus on Snow = Want Snow. Multiplier on snow amount.

    // We weight immediate days higher than days 5-7 days out
    const freshnessWeights = [1.0, 1.0, 0.9, 0.8, 0.6, 0.5, 0.4];

    dailyData.forEach((day, index) => {
        let dayScore = 0;
        const freshness = freshnessWeights[index] || 0.3;

        // --- 1. Snow Quality Logic (Temp) ---
        let qualityMultiplier = 1.0;
        // If user cares about temp/quality (wTemp high), we punish slush more and reward cold more.
        if (day.temperature_2m_max > 2) {
            qualityMultiplier = 0.3 / wTemp; // Harsh penalty if we care about quality
        } else if (day.temperature_2m_max < -4) {
            qualityMultiplier = 1.2 * wTemp; // Bonus scales with preference
        }

        // Base Score: Snowfall * Quality * SnowPreference
        dayScore += (day.snowfall_sum || 0) * 3 * qualityMultiplier * wSnow;

        // --- 2. Visibility Context (Bluebird) ---
        if (day.visibility_min > 5000) {
            if (index > 0) {
                const prevDay = dailyData[index - 1];
                if ((prevDay.snowfall_sum || 0) > 10) {
                    // Bonus scales with Bluebird Preference
                    const bonus = 1.5 * getWeightMult(prefs.bluebirdWeight);
                    dayScore *= bonus;
                    tags.add("Bluebird Potential");
                }
            }
        } else if (day.visibility_min < 500) {
            const isStorming = (day.snowfall_sum || 0) > 10;
            if (!isStorming) {
                dayScore -= 10;
            } else {
                dayScore *= 0.9;
            }
        }

        // --- 3. The "Kill Switch" (Wind) ---
        // If user cares about wind (wWind high), we kill score earlier or harder.
        // Base threshold 30. If highly sensitive, maybe 25?
        const windThreshold = 30;
        const windKill = 60;

        if (day.wind_speed_10m_max > windThreshold) {
            if (day.wind_speed_10m_max > windKill) {
                dayScore = 0;
                totalScore -= (20 * wWind);
                tags.add("Wind Hold Risk");
            } else {
                // Linear decay
                const windPenaltyFactor = 1 - ((day.wind_speed_10m_max - windThreshold) / (windKill - windThreshold));
                // Apply weight: if wWind is high (1.5), we want the penalty to be worse?
                // Actually, simply reducing result score is effective.
                dayScore *= Math.max(0, windPenaltyFactor / wWind); // Divide by weight? No.
                // If wWind is 1.5 (High focus), we want wind to hurt MORE.
                // e.g. factor is 0.5 (half score). If wWind is 1.5, we want it to be 0.33?
                // Math.pow(factor, wWind) works well for 0-1 range.
                dayScore *= Math.pow(Math.max(0, windPenaltyFactor), wWind);
            }
        }

        // Add weighted day score to total
        totalScore += (dayScore * freshness);
    });

    return {
        score: Math.max(0, Math.round(totalScore)),
        tags: Array.from(tags)
    };
}

/**
 * PHASE 2: The Ranked System
 * Sorts resorts based on score and assigns ordinal rank.
 */
export function rankResorts(
    resorts: { id: string; data: WeatherData[] }[],
    prefs: UserPreferences = DEFAULT_PREFERENCES
): ResortScore[] {

    // 1. Calculate Raw Scores for everyone
    const scoredResorts = resorts.map(resort => {
        const { score, tags } = calculateRawScore(resort.data, prefs);
        return { resortId: resort.id, rawScore: score, tags };
    });

    // 2. Sort Descending
    const sorted = scoredResorts.sort((a, b) => b.rawScore - a.rawScore);

    // 3. Assign Ranks (1-based)
    return sorted.map((resort, index) => ({
        ...resort,
        rank: index + 1 // 1st, 2nd, 3rd...
    }));
}

// Deprecated wrapper to maintain compatibility during refactor
export function calculatePowderScore(dailyData: WeatherData[]): number {
    return calculateRawScore(dailyData).score;
}
