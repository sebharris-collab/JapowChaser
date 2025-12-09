"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeatherData } from "@/lib/weather";
import { calculatePowderScore, cn } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Wind, Eye, ChevronDown, ChevronUp } from "lucide-react";

interface ResortCardProps {
    name: string;
    region: string;
    data: WeatherData[];
    rank?: number; // Ordinal rank (1, 2, 3...)
    tags?: string[];
    loading?: boolean;
    percentile?: number; // Kept for compat if needed, but we prefer rank
}

export function ResortCard({ name, region, data, rank, tags = [], loading }: ResortCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (loading) {
        return (
            <Card className="animate-pulse border-border bg-card/50">
                <CardHeader className="h-24 bg-muted/50" />
                <CardContent className="h-40 bg-muted/30" />
            </Card>
        );
    }

    // Data Segregation
    const hasHistory = data.length >= 3;
    const historyData = hasHistory ? data.slice(0, 2) : [];
    const forecastData = hasHistory ? data.slice(2) : data;

    // Past Stats
    const past24hSnow = historyData.length > 1 ? (historyData[1].snowfall_sum || 0) : 0;
    const past48hSnow = historyData.reduce((acc, day) => acc + (day.snowfall_sum || 0), 0);

    return (
        <Card
            className={cn(
                "group relative overflow-hidden border border-border bg-card/80 backdrop-blur-xl transition-all duration-300 ease-out",
                "hover:scale-[1.02] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Vivid Gradient Glow at top */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <CardHeader className="pb-2 pt-6 px-6">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight text-foreground">{name}</CardTitle>
                        <CardDescription className="text-muted-foreground font-medium flex items-center gap-2">
                            {region}
                            {/* Display Tags */}
                            <div className="flex gap-1 ml-2">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20">{tag}</Badge>
                                ))}
                            </div>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary tracking-tighter">
                                {rank ? <span className="text-lg align-top mr-0.5 text-muted-foreground">#</span> : null}
                                {rank ? rank : '-'}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Rank</div>
                        </div>
                        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row (Always Visible/expanded based on pref, but user asked for expand interaction) */}
                {isExpanded && (
                    <div className="flex gap-8 mt-6 text-sm animate-in fade-in slide-in-from-top-1 duration-300 border-t border-border/50 pt-4">
                        <div>
                            <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Past 24h</div>
                            <div className="font-semibold text-foreground">{past24hSnow.toFixed(1)} cm</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Past 48h</div>
                            <div className="font-semibold text-foreground">{past48hSnow.toFixed(1)} cm</div>
                        </div>
                    </div>
                )}
            </CardHeader>

            {isExpanded && (
                <CardContent className="px-6 pb-6 pt-2 animate-in fade-in zoom-in-95 duration-200">

                    {/* Minimal Chart */}
                    <div className="h-[100px] w-full mb-6 shrink-0 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastData}>
                                <RechartsTooltip
                                    cursor={{ fill: 'var(--muted)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-xl">
                                                    <span className="text-[10px] uppercase text-muted-foreground block mb-1">Snowfall</span>
                                                    <span className="text-lg font-bold text-primary">
                                                        {Number(payload[0].value).toFixed(1)} cm
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="snowfall_sum"
                                    fill="hsl(var(--primary))"
                                    radius={[2, 2, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Detailed List */}
                    <div className="space-y-1">
                        {forecastData.map((day) => {
                            const isBluebird = day.precipitation_probability_max < 20 && day.visibility_min > 5000;
                            const isPowder = day.snowfall_sum > 10;

                            return (
                                <div key={day.date} className="group/row grid grid-cols-12 gap-2 items-center text-sm py-2 px-2 rounded-md hover:bg-muted/50 transition-colors">
                                    <div className="col-span-3 text-xs font-medium text-muted-foreground group-hover/row:text-foreground">
                                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="col-span-4 flex flex-col justify-center">
                                        <div className="font-bold text-foreground flex items-center gap-2">
                                            {day.snowfall_sum > 0 && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                            {day.snowfall_sum.toFixed(0)} <span className="text-[10px] text-muted-foreground font-normal uppercase">cm</span>
                                        </div>
                                    </div>
                                    <div className="col-span-5 flex justify-end items-center gap-2">
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mr-2">
                                            <Wind className="w-3 h-3" /> {day.wind_speed_10m_max.toFixed(0)}
                                        </div>
                                        {isPowder && <Badge variant="default" className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 h-5 px-1.5 text-[9px] uppercase tracking-wider font-semibold border-0">Powder</Badge>}
                                        {isBluebird && !isPowder && <Badge variant="secondary" className="bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/20 h-5 px-1.5 text-[9px] uppercase tracking-wider font-semibold border-0">Sun</Badge>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
