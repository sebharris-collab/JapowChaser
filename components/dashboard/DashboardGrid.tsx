"use client";

import { useState, useLayoutEffect, useRef } from "react";
import { ForecastResult } from "@/lib/weather";
import { ResortCard } from "@/components/dashboard/ResortCard";
import { rankResorts, UserPreferences } from "@/lib/utils";
import { JAPANESE_RESORTS } from "@/lib/constants";

interface DashboardGridProps {
    forecasts: ForecastResult[];
    loading: boolean;
    userPrefs: UserPreferences;
}

// Custom Hook for FLIP Animations
function useFlip(trigger: any) {
    const refs = useRef(new Map<string, HTMLElement>());
    const positions = useRef(new Map<string, DOMRect>());

    useLayoutEffect(() => {
        // FLIP Logic
        const anims: Animation[] = [];

        refs.current.forEach((element, id) => {
            if (!element) return;

            const newRect = element.getBoundingClientRect();
            const oldRect = positions.current.get(id);

            if (oldRect) {
                const dx = oldRect.left - newRect.left;
                const dy = oldRect.top - newRect.top;

                if (dx !== 0 || dy !== 0) {
                    // Invert
                    element.style.transform = `translate(${dx}px, ${dy}px)`;
                    element.style.transition = 'none';

                    // Play
                    requestAnimationFrame(() => {
                        element.style.transform = '';
                        element.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'; // "Premium" ease-out-quintish
                    });
                }
            }

            // Save new position for next update
            positions.current.set(id, newRect);
        });

    }, [trigger]); // Run when trigger changes (e.g., sort order changes)

    const setRef = (id: string) => (el: HTMLElement | null) => {
        if (el) refs.current.set(id, el);
        else refs.current.delete(id);
    };

    return setRef;
}

export function DashboardGrid({ forecasts, loading, userPrefs }: DashboardGridProps) {
    // Generate derived state (ranking)
    const scoredResorts = rankResorts(
        forecasts.map(f => ({ id: f.resortId, data: f.daily })),
        userPrefs
    );

    // FLIP Hook - Trigger on the stringified order of IDs to catch reorders
    const orderKey = scoredResorts.map(r => r.resortId).join(',');
    const setRef = useFlip(orderKey);

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 items-start">
            {scoredResorts.map((scoreData) => {
                const forecast = forecasts.find(f => f.resortId === scoreData.resortId);
                const resort = JAPANESE_RESORTS.find((r) => r.id === scoreData.resortId);

                if (!forecast || !resort) return null;

                return (
                    <div ref={setRef(scoreData.resortId)} key={scoreData.resortId} className="h-full">
                        <ResortCard
                            name={resort.name}
                            region={resort.region}
                            data={forecast.daily}
                            rank={scoreData.rank}
                            tags={scoreData.tags}
                        />
                    </div>
                );
            })}
        </div>
    );
}
