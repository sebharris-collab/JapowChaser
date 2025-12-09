"use strict";

import { Snowflake, Calendar as CalendarIcon, LayoutGrid, Table, Filter } from "lucide-react";
import { ResortCombobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

    // Calculate unique regions
    const regions = Array.from(new Set(JAPANESE_RESORTS.map(r => r.region)));

    // Simple handler for date inputs
    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateChange(e.target.value, endDate);
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateChange(startDate, e.target.value);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2 font-bold text-xl text-slate-50 md:mr-4 tracking-tight">
                        <div className="bg-indigo-500 rounded-md p-1">
                            <Snowflake className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden lg:inline-block">JapowChaser</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Region Filter */}
                        <div className="relative group">
                            <select
                                value={selectedRegion}
                                onChange={(e) => onRegionChange(e.target.value)}
                                className="h-9 w-[140px] rounded-md border border-slate-800 bg-slate-900/50 px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 text-slate-300 appearance-none pl-9 cursor-pointer hover:bg-slate-800 hover:border-slate-700 font-medium"
                            >
                                <option value="ALL">All Regions</option>
                                {regions.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 group-hover:text-slate-400 transition-colors pointer-events-none" />
                        </div>

                        <ResortCombobox onSelect={onAddResort} filterRegion={selectedRegion} />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onResetResorts}
                            className="text-slate-500 hover:text-red-400 hover:bg-red-950/30 hidden sm:flex h-9"
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex items-center border border-slate-800 rounded-md p-1 bg-slate-900/50">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewModeChange('grid')}
                            className={cn(
                                "h-7 w-7 rounded-sm transition-all",
                                viewMode === 'grid'
                                    ? "bg-slate-700 text-slate-50 shadow-sm"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
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
                                    ? "bg-slate-700 text-slate-50 shadow-sm"
                                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                            )}
                            title="Matrix View"
                        >
                            <Table className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 border border-slate-800 rounded-md p-1 bg-slate-900/50 hidden sm:flex">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={handleStartChange}
                            className="h-7 w-fit border-0 bg-transparent focus-visible:ring-0 px-2 text-slate-300 text-xs"
                        />
                        <span className="text-slate-600 text-xs">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={handleEndChange}
                            className="h-7 w-fit border-0 bg-transparent focus-visible:ring-0 px-2 text-slate-300 text-xs"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
