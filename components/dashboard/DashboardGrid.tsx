"use client";

import { useState } from "react";
import { ForecastResult } from "@/lib/weather";
import { ResortCard } from "@/components/dashboard/ResortCard";
import { calculatePowderScore } from "@/lib/utils";
import { JAPANESE_RESORTS } from "@/lib/constants";

interface DashboardGridProps {
    forecasts: ForecastResult[];
    loading: boolean;
}

export function DashboardGrid({ forecasts, loading }: DashboardGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {[1, 2, 3].map((i) => (
                    <ResortCard key={i} name="" region="" data={[]} loading={true} />
                ))}
            </div>
        );
    }

    if (forecasts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl mx-6">
                <h3 className="text-lg font-semibold mb-2">No Resorts Selected</h3>
                <p>Add a resort from the top bar to start tracking usage.</p>
            </div>
        );
    }

    // Sorting logic based on Powder Score
    const sortedForecasts = [...forecasts].sort((a, b) => {
        const scoreA = calculatePowderScore(a.daily);
        const scoreB = calculatePowderScore(b.daily);
        return scoreB - scoreA;
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 items-start">
            {sortedForecasts.map((forecast) => {
                const resort = JAPANESE_RESORTS.find((r) => r.id === forecast.resortId);
                if (!resort) return null;

                return (
                    <ResortCard
                        key={forecast.resortId}
                        name={resort.name}
                        region={resort.region}
                        data={forecast.daily}
                    />
                );
            })}
        </div>
    );
}
