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
            <div className="w-full h-64 flex items-center justify-center text-slate-500 animate-pulse bg-slate-900/50 rounded-lg border border-slate-800">
                Loading matrix data...
            </div>
        );
    }

    if (forecasts.length === 0) {
        return (
            <div className="text-center p-12 border border-dashed border-slate-800 rounded-xl text-slate-500 bg-slate-950/50">
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

    const firstResort = sortedForecasts[0];
    const daysToShow = firstResort.daily.slice(2); // Skip past 2 days

    const getSnowStyle = (cm: number) => {
        if (cm === 0) return "bg-transparent text-slate-600";
        // Gradient scale from faint blue to deep indigo/purple
        if (cm < 5) return "bg-indigo-950/30 text-indigo-200/70";
        if (cm < 15) return "bg-indigo-900/40 text-indigo-100";
        if (cm < 30) return "bg-indigo-600/60 text-white font-medium";
        if (cm < 50) return "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20";
        return "bg-purple-600 text-white font-bold animate-pulse shadow-lg shadow-purple-500/20";
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-900 text-[10px] uppercase text-slate-400 font-semibold tracking-wider backdrop-blur-md border-b border-indigo-500/20">
                    <tr>
                        <th className="px-6 py-4 min-w-[180px] sticky left-0 bg-slate-900 z-20 border-r border-slate-800">
                            Resort
                        </th>
                        <th className="px-4 py-4 text-center border-b border-r border-slate-800 w-[80px] bg-slate-900/50">
                            Score
                        </th>
                        {daysToShow.map((day) => (
                            <th key={day.date} className="px-2 py-4 text-center min-w-[80px] border-b border-slate-800 text-slate-300">
                                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {sortedForecasts.map((forecast) => {
                        const resort = JAPANESE_RESORTS.find(r => r.id === forecast.resortId);
                        const score = calculatePowderScore(forecast.daily);
                        const displayDays = forecast.daily.slice(2);

                        return (
                            <tr key={forecast.resortId} className="group hover:bg-slate-900/40 transition-colors">
                                <td className="px-6 py-4 font-medium sticky left-0 bg-slate-950 z-10 border-r border-slate-800 group-hover:bg-slate-900 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-slate-200 font-semibold tracking-tight text-base">{resort?.name || forecast.resortId}</span>
                                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{resort?.region}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center font-bold text-lg text-indigo-400 border-r border-slate-800 bg-slate-900/20">
                                    {score}
                                </td>
                                {displayDays.map((day) => (
                                    <td key={day.date} className="p-1 text-center border-r border-slate-800/50 last:border-0 h-full align-middle">
                                        <TooltipProvider delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className={cn(
                                                        "h-12 w-full flex items-center justify-center rounded-md cursor-help transition-all duration-300 mx-auto",
                                                        getSnowStyle(day.snowfall_sum)
                                                    )}>
                                                        {day.snowfall_sum > 0 ? day.snowfall_sum.toFixed(0) : <span className="text-slate-700">-</span>}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="text-xs p-3 bg-slate-900 border-slate-800 text-slate-200 shadow-xl">
                                                    <div className="font-bold mb-2 text-indigo-400">{new Date(day.date).toLocaleDateString()}</div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <Thermometer className="w-3 h-3 text-slate-400" />
                                                            {day.temperature_2m_min?.toFixed(0)}° / {day.temperature_2m_max?.toFixed(0)}°
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Wind className="w-3 h-3 text-slate-400" />
                                                            {day.wind_speed_10m_max.toFixed(0)} km/h
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Eye className="w-3 h-3 text-slate-400" />
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
