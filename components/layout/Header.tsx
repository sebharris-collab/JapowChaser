"use strict";

import { useEffect, useState } from "react";
import { Snowflake, LayoutGrid, Table, Filter, Sun, Moon } from "lucide-react";
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

    // Initialize theme from HTML or LocalStorage
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

    // Calculate unique regions
    const regions = Array.from(new Set(JAPANESE_RESORTS.map(r => r.region)));

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateChange(e.target.value, endDate);
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateChange(startDate, e.target.value);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2 font-bold text-xl text-foreground md:mr-4 tracking-tight">
                        <div className="bg-primary rounded-md p-1">
                            <Snowflake className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="hidden lg:inline-block">JapowChaser</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <select
                                value={selectedRegion}
                                onChange={(e) => onRegionChange(e.target.value)}
                                className="h-9 w-[140px] rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none pl-9 cursor-pointer hover:bg-accent hover:text-accent-foreground font-medium text-foreground"
                            >
                                <option value="ALL">All Regions</option>
                                {regions.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        <ResortCombobox onSelect={onAddResort} filterRegion={selectedRegion} />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onResetResorts}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hidden sm:flex h-9"
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
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

                    <div className="flex items-center gap-2 border rounded-md p-1 bg-muted/40 hidden sm:flex">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={handleStartChange}
                            className="h-7 w-fit border-0 bg-transparent focus-visible:ring-0 px-2 text-xs"
                        />
                        <span className="text-muted-foreground text-xs">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={handleEndChange}
                            className="h-7 w-fit border-0 bg-transparent focus-visible:ring-0 px-2 text-xs"
                        />
                    </div>

                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 rounded-full">
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </header>
    );
}
