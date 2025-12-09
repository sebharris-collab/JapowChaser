"use client";

import { ForecastResult, WeatherData } from "@/lib/weather";
import { JAPANESE_RESORTS } from "@/lib/constants";
import { calculatePowderScore, cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wind, Thermometer, Eye } from "lucide-react";

interface ForecastMatrixProps {
    forecasts: ForecastResult[];
    loading: boolean;
}

export function ForecastMatrix({ forecasts, loading }: ForecastMatrixProps) {
    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-muted-foreground animate-pulse bg-muted/20 rounded-lg">
                Loading matrix data...
            </div>
        );
    }

    if (forecasts.length === 0) {
        return (
            <div className="text-center p-12 border-2 border-dashed rounded-xl text-muted-foreground">
                No resorts selected.
            </div>
        );
    }

    // Sort by score
    const sortedForecasts = [...forecasts].sort((a, b) => {
        const scoreA = calculatePowderScore(a.daily);
        const scoreB = calculatePowderScore(b.daily);
        return scoreB - scoreA;
    });

    // Get date headers from the first forecast (assuming all cover same range)
    // We skip the first 2 days (history) for the forecast view usually?
    // User wants "future" comparison mostly, but history is nice.
    // Let's mimic ResortCard: History (Past 24h) is separate, Matrix usually shows FUTURE.
    // However, showing the flow from yesterday -> next week is powerful.
    // Let's show: Past 24h | Today | +1 | +2 ...

    // Actually, ResortCard shows Past 24h/48h as stats, then Daily List starts from TODAY.
    // Let's stick to that for consistency. Matrix starts from "Today".

    const firstResort = sortedForecasts[0];
    const daysToShow = firstResort.daily.slice(2); // Skip past 2 days

    const getSnowColor = (cm: number) => {
        if (cm === 0) return "bg-transparent text-muted-foreground";
        if (cm < 5) return "bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200";
        if (cm < 15) return "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100";
        if (cm < 30) return "bg-blue-400 text-white dark:bg-blue-700 dark:text-white";
        if (cm < 50) return "bg-indigo-500 text-white font-bold";
        return "bg-purple-600 text-white font-bold animate-pulse";
    };

    return (
        <div className="overflow-x-auto rounded-lg border bg-card text-card-foreground shadow-sm">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground font-medium">
                    <tr>
                        <th className="px-4 py-3 min-w-[150px] sticky left-0 bg-background/95 backdrop-blur z-10 border-b">
                            Resort
                        </th>
                        <th className="px-2 py-3 text-center border-b w-[80px]">
                            Score
                        </th>
                        {daysToShow.map((day) => (
                            <th key={day.date} className="px-2 py-3 text-center min-w-[60px] border-b">
                                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {sortedForecasts.map((forecast) => {
                        const resort = JAPANESE_RESORTS.find(r => r.id === forecast.resortId);
                        const score = calculatePowderScore(forecast.daily);
                        const displayDays = forecast.daily.slice(2);

                        return (
                            <tr key={forecast.resortId} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-medium sticky left-0 bg-background/95 backdrop-blur z-10 border-r">
                                    <div className="flex flex-col">
                                        <span>{resort?.name || forecast.resortId}</span>
                                        <span className="text-xs text-muted-foreground font-normal">{resort?.region}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-center font-bold text-primary border-r bg-muted/10">
                                    {score}
                                </td>
                                {displayDays.map((day) => (
                                    <td key={day.date} className="p-0 text-center border-r last:border-0 h-full">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className={cn(
                                                        "h-full w-full flex items-center justify-center py-4 cursor-help transition-colors",
                                                        getSnowColor(day.snowfall_sum)
                                                    )}>
                                                        {day.snowfall_sum > 0 ? day.snowfall_sum.toFixed(0) : "-"}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs p-2">
                                                    <div className="font-bold mb-1">{new Date(day.date).toLocaleDateString()}</div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Thermometer className="w-3 h-3" />
                                                            {day.temperature_2m_min?.toFixed(0)}° / {day.temperature_2m_max?.toFixed(0)}°
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Wind className="w-3 h-3" />
                                                            {day.wind_speed_10m_max.toFixed(0)} km/h
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="w-3 h-3" />
                                                            {(day.visibility_min / 1000).toFixed(1)} km
                                                        </div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
