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
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary md:mr-4">
                        <Snowflake className="h-6 w-6" />
                        <span className="hidden lg:inline-block">JapowChaser</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Region Filter */}
                        <div className="relative">
                            <select
                                value={selectedRegion}
                                onChange={(e) => onRegionChange(e.target.value)}
                                className="h-9 w-[130px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none pl-8 cursor-pointer hover:bg-muted/50"
                            >
                                <option value="ALL">All Regions</option>
                                {regions.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>

                        <ResortCombobox onSelect={onAddResort} filterRegion={selectedRegion} />

                        <Button variant="ghost" size="sm" onClick={onResetResorts} className="text-muted-foreground hover:text-destructive hidden sm:flex">
                            Clear
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex items-center border rounded-md p-1 bg-muted/50">
                        <Button
                            variant={viewMode === 'grid' ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => onViewModeChange('grid')}
                            className="h-7 w-7"
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'matrix' ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => onViewModeChange('matrix')}
                            className="h-7 w-7"
                            title="Matrix View"
                        >
                            <Table className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 border rounded-md p-1 bg-card hidden sm:flex">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={handleStartChange}
                            className="h-8 w-fit border-0 focus-visible:ring-0 px-2"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={handleEndChange}
                            className="h-8 w-fit border-0 focus-visible:ring-0 px-2"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
