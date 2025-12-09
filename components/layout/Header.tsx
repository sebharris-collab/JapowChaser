"use strict";

import { useEffect, useState } from "react";
import { Snowflake, LayoutGrid, Table, Filter, Sun, Moon, Calendar as CalendarIcon } from "lucide-react";
import { ResortCombobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { JAPANESE_RESORTS } from "@/lib/constants";

interface HeaderProps {
    onAddResort: (resortId: string) => void;
    startDate: string;
    endDate: string;
    onDateChange: (start: string, end: string) => void;
    onResetResorts: () => void;
    viewMode: "grid" | "matrix";
    onViewModeChange: (mode: "grid" | "matrix") => void;
    selectedRegion: string;
    onRegionChange: (region: string) => void;
}

export function Header({
    onAddResort,
    startDate,
    endDate,
    onDateChange,
    onResetResorts,
    viewMode,
    onViewModeChange,
    selectedRegion,
    onRegionChange
}: HeaderProps) {
    const [theme, setTheme] = useState<"dark" | "light">("dark");

    useEffect(() => {
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "dark" : "light");
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const regions = Array.from(new Set(JAPANESE_RESORTS.map(r => r.region)));

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateChange(e.target.value, endDate);
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateChange(startDate, e.target.value);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 py-4 transition-all duration-300">
            <div className="container flex flex-col gap-4">
                {/* Top Row: Theme Toggle (Left) - Brand (Center) - View Toggle (Right) */}
                <div className="grid grid-cols-3 items-center w-full">
                    {/* Left: Theme */}
                    <div className="flex justify-start">
                        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                    </div>

                    {/* Center: Brand */}
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2 font-bold text-2xl text-foreground tracking-tight">
                            <div className="bg-primary rounded-lg p-1.5 shadow-lg shadow-primary/20">
                                <Snowflake className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span>JapowChaser</span>
                        </div>
                    </div>

                    {/* Right: View Toggle */}
                    <div className="flex justify-end">
                        <div className="flex items-center border rounded-md p-1 bg-muted/40">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onViewModeChange('grid')}
                                className={cn(
                                    "h-7 w-7 rounded-sm transition-all",
                                    viewMode === 'grid'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                                title="Grid View"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onViewModeChange('matrix')}
                                className={cn(
                                    "h-7 w-7 rounded-sm transition-all",
                                    viewMode === 'matrix'
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                                title="Matrix View"
                            >
                                <Table className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Controls (Centered) */}
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    {/* Region Filter */}
                    <div className="relative group">
                        <select
                            value={selectedRegion}
                            onChange={(e) => onRegionChange(e.target.value)}
                            className="h-10 w-[150px] rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none pl-9 cursor-pointer hover:border-primary/50 text-foreground font-medium"
                        >
                            <option value="ALL">All Regions</option>
                            {regions.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

                    {/* Resort Search */}
                    <ResortCombobox onSelect={onAddResort} filterRegion={selectedRegion} />

                    <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

                    {/* Date Picker */}
                    <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-card shadow-sm border-input hover:border-primary/50 transition-colors">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <Input
                            type="date"
                            value={startDate}
                            onChange={handleStartChange}
                            className="h-6 w-fit border-0 bg-transparent focus-visible:ring-0 p-0 text-sm text-foreground [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        <span className="text-muted-foreground text-xs font-medium">to</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={handleEndChange}
                            className="h-6 w-fit border-0 bg-transparent focus-visible:ring-0 p-0 text-sm text-foreground [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                    </div>

                    {/* Clear Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onResetResorts}
                        className="h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 border-dashed"
                    >
                        Clear
                    </Button>
                </div>
            </div>
        </header>
    );
}
