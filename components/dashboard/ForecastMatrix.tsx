"use client";

import { ForecastResult, WeatherData } from "@/lib/weather";
import { JAPANESE_RESORTS } from "@/lib/constants";
import { calculatePowderScore, rankResorts, UserPreferences, cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wind, Thermometer, Eye, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ForecastMatrixProps {
    forecasts: ForecastResult[];
    loading: boolean;
    userPrefs: UserPreferences;
}

export function ForecastMatrix({ forecasts, loading, userPrefs }: ForecastMatrixProps) {
    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center text-muted-foreground animate-pulse bg-muted/20 rounded-lg border border-border">
                Loading matrix data...
            </div>
        );
    }

    if (forecasts.length === 0) {
        return (
            <div className="text-center p-12 border border-dashed border-border rounded-xl text-muted-foreground bg-card/50">
                No resorts selected.
            </div>
        );
    }

    // Sort by Ranked Score using User Prefs
    const scoredResorts = rankResorts(
        forecasts.map(f => ({ id: f.resortId, data: f.daily })),
        userPrefs
    );

    const firstResortId = scoredResorts[0]?.resortId;
    const firstForecast = forecasts.find(f => f.resortId === firstResortId);

    // Safety check if no data
    if (!firstForecast) return null;

    const daysToShow = firstForecast.daily.slice(2); // Skip past 2 days

    const getSnowStyle = (cm: number) => {
        if (cm === 0) return "bg-transparent text-muted-foreground";
        // Gradient scale needs to look good in both modes. 
        // Using consistent indigo for high snow, but adjusting low snow transparency.
        // Dark mode: bg-indigo-950/30 | Light mode: bg-indigo-50 text-indigo-900
        if (cm < 5) return "bg-indigo-100/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-200/70";
        if (cm < 15) return "bg-indigo-200/50 dark:bg-indigo-900/40 text-indigo-900 dark:text-indigo-100";
        if (cm < 30) return "bg-indigo-500/80 dark:bg-indigo-600/60 text-white font-medium";
        if (cm < 50) return "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20";
        return "bg-purple-600 text-white font-bold animate-pulse shadow-lg shadow-purple-500/20";
    };

    const getHistoricalComparison = (current: number, historical?: number) => {
        if (historical === undefined || historical === 0) return null;
        const diff = current - historical;
        const percentDiff = diff / historical;

        // If very small snow amounts, don't overreact
        if (historical < 2 && Math.abs(diff) < 2) return null;

        if (current > historical * 1.25) return { type: "above", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/20", label: "Above Avg" };
        if (current < historical * 0.75) return { type: "below", icon: TrendingDown, color: "text-amber-400", bg: "bg-amber-400/20", label: "Below Avg" };
        return { type: "avg", icon: Minus, color: "text-muted-foreground", bg: "bg-muted/10", label: "Average" };
    };

    return (

        <div className="overflow-x-auto rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-2xl">
            <TooltipProvider delayDuration={0}>
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-card/90 text-[10px] uppercase text-muted-foreground font-semibold tracking-wider backdrop-blur-md border-b border-primary/20">
                        <tr>
                            <th className="px-6 py-4 min-w-[180px] sticky left-0 bg-card z-20 border-r border-border">
                                Resort
                            </th>
                            <th className="px-4 py-4 text-center border-b border-r border-border w-[80px] bg-muted/30">
                                Rank
                            </th>
                            {daysToShow.map((day) => (
                                <th key={day.date} className="px-2 py-4 text-center min-w-[80px] border-b border-border text-foreground">
                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {scoredResorts.map((scoreData) => {
                            const forecast = forecasts.find(f => f.resortId === scoreData.resortId);
                            if (!forecast) return null;

                            const resort = JAPANESE_RESORTS.find(r => r.id === scoreData.resortId);
                            const displayDays = forecast.daily.slice(2);

                            return (
                                <tr key={scoreData.resortId} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-medium sticky left-0 bg-card z-10 border-r border-border group-hover:bg-card transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-foreground font-semibold tracking-tight text-base">{resort?.name || scoreData.resortId}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{resort?.region}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-bold text-lg text-primary border-r border-border bg-muted/10">
                                        <span className="text-sm align-top mr-0.5 opacity-50">#</span>{scoreData.rank}
                                    </td>
                                    {displayDays.map((day) => (
                                        <td key={day.date} className="p-1 text-center border-r border-border/50 last:border-0 h-full align-middle">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "h-12 w-full flex items-center justify-center rounded-md cursor-help transition-all duration-300 mx-auto relative overflow-hidden border-0 p-0 focus:outline-none focus:ring-2 focus:ring-primary/50",
                                                            getSnowStyle(day.snowfall_sum)
                                                        )}
                                                    >
                                                        {day.snowfall_sum > 0 ? day.snowfall_sum.toFixed(0) : <span className="text-muted-foreground/50">-</span>}

                                                        {/* Comparison Indicator Dot */}
                                                        {(() => {
                                                            const comp = getHistoricalComparison(day.snowfall_sum, day.historical_snowfall);
                                                            if (!comp || comp.type === 'avg') return null;
                                                            return (
                                                                <div className={cn(
                                                                    "absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-black/20",
                                                                    comp.type === 'above' ? "bg-emerald-300" : "bg-amber-300"
                                                                )} />
                                                            );
                                                        })()}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent collisionPadding={10} className="text-xs p-3 bg-popover border-border text-popover-foreground shadow-xl">
                                                    <div className="font-bold mb-2 text-primary">{new Date(day.date).toLocaleDateString('en-GB')}</div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <Thermometer className="w-3 h-3 text-muted-foreground" />
                                                            {day.temperature_2m_min?.toFixed(0)}° / {day.temperature_2m_max?.toFixed(0)}°
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Wind className="w-3 h-3 text-muted-foreground" />
                                                            {day.wind_speed_10m_max.toFixed(0)} km/h
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="w-3 h-3 text-muted-foreground" />
                                                            {(day.visibility_min / 1000).toFixed(1)} km
                                                        </div>
                                                    </div>
                                                    {day.historical_snowfall !== undefined && (
                                                        <div className="pt-2 mt-2 border-t border-border/50">
                                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                                                <span>Historical Avg</span>
                                                                <span>{day.historical_snowfall.toFixed(1)}cm</span>
                                                            </div>
                                                            {(() => {
                                                                const comp = getHistoricalComparison(day.snowfall_sum, day.historical_snowfall);
                                                                if (!comp) return null;
                                                                return (
                                                                    <div className={cn("flex items-center gap-1.5 font-medium", comp.color)}>
                                                                        <comp.icon className="w-3 h-3" />
                                                                        {comp.label}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </TooltipProvider>
        </div >
        // </TooltipProvider>
    );
}
