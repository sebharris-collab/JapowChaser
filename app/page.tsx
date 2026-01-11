"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { ForecastMatrix } from "@/components/dashboard/ForecastMatrix";
import { JAPANESE_RESORTS } from "@/lib/constants";
import { DEFAULT_PREFERENCES, UserPreferences } from "@/lib/utils";
import { fetchForecast, ForecastResult, WeatherData } from "@/lib/weather";

export default function Home() {
    // State
    const [selectedResorts, setSelectedResorts] = useState<string[]>([]);
    const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter & View State
    const [viewMode, setViewMode] = useState<"grid" | "matrix">("grid");
    const [selectedRegion, setSelectedRegion] = useState<string>("ALL");

    // Default dates: Today to Today + 7 days
    const today = new Date();
    // We want the default user view to be from Today
    const defaultStart = today.toISOString().split("T")[0];

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // userStartDate tracks what the user entered/sees
    const [userStartDate, setUserStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(nextWeek.toISOString().split("T")[0]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("japow_resorts");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setSelectedResorts(parsed);
                }
            } catch (e) {
                console.error("Failed to parse local storage", e);
            }
        }
    }, []);

    // Fetch data when resorts or dates change
    useEffect(() => {
        if (selectedResorts.length === 0) {
            setForecasts([]);
            return;
        }

        const loadData = async () => {
            setLoading(true);
            setError(null);

            // Calculate API start date (User Date - 2 Days)
            // This ensures we have history data without confusing the user UI
            const startObj = new Date(userStartDate);
            startObj.setDate(startObj.getDate() - 2);
            const apiStartDate = startObj.toISOString().split("T")[0];

            try {
                // Fetch all data in parallel
                const fetchPromises = selectedResorts.map(async (resortId) => {
                    const resort = JAPANESE_RESORTS.find(r => r.id === resortId);
                    if (!resort) return null;

                    try {
                        const data = await fetchForecast(resort.lat, resort.lon, apiStartDate, endDate);
                        return { resortId, daily: data };
                    } catch (e) {
                        console.error(`Failed to fetch for ${resortId}`, e);
                        return null;
                    }
                });

                const results = (await Promise.all(fetchPromises)).filter((r): r is ForecastResult => r !== null);
                setForecasts(results);
            } catch (err) {
                console.error(err);
                setError("Failed to fetch weather data. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };

        // Debounce slightly to avoid rapid fires if user changes date quickly
        const timer = setTimeout(loadData, 500);
        return () => clearTimeout(timer);
    }, [selectedResorts, userStartDate, endDate]);

    // Handlers
    const handleAddResort = (resortId: string) => {
        setSelectedResorts(prev => {
            if (prev.includes(resortId)) return prev;
            const updated = [...prev, resortId];
            localStorage.setItem("japow_resorts", JSON.stringify(updated));
            return updated;
        });
    };

    const handleDateChange = (start: string, end: string) => {
        setUserStartDate(start);
        setEndDate(end);
    };

    const handleResetResorts = () => {
        setSelectedResorts([]);
        localStorage.removeItem("japow_resorts");
        setForecasts([]);
    };

    // Filter Logic
    const filteredForecasts = forecasts.filter(f => {
        if (selectedRegion === "ALL") return true;
        const resort = JAPANESE_RESORTS.find(r => r.id === f.resortId);
        return resort?.region === selectedRegion;
    });

    // Preferences
    const [userPrefs, setUserPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                onAddResort={handleAddResort}
                startDate={userStartDate}
                endDate={endDate}
                onDateChange={handleDateChange}
                onResetResorts={handleResetResorts}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedRegion={selectedRegion}
                onRegionChange={setSelectedRegion}
                userPrefs={userPrefs}
                onPrefsChange={setUserPrefs}
                selectedResorts={selectedResorts}
            />

            <main className="flex-1 container py-6">
                {error && (
                    <div className="bg-destructive/15 text-destructive border-destructive/20 border p-4 rounded-md mb-6">
                        {error}
                    </div>
                )}

                {viewMode === 'grid' ? (
                    <DashboardGrid forecasts={filteredForecasts} loading={loading} userPrefs={userPrefs} />
                ) : (
                    <ForecastMatrix forecasts={filteredForecasts} loading={loading} userPrefs={userPrefs} />
                )}
            </main>
        </div>
    );
}
