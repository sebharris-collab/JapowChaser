"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeatherData } from "@/lib/weather";
import { calculatePowderScore, cn } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Snowflake, Wind, Eye, ChevronDown, ChevronUp } from "lucide-react";

interface ResortCardProps {
    name: string;
    region: string;
    data: WeatherData[];
    loading?: boolean;
}

export function ResortCard({ name, region, data, loading }: ResortCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (loading) {
        return (
            <Card className="animate-pulse">
                <CardHeader className="h-24 bg-muted/50" />
                <CardContent className="h-40 bg-muted/30" />
            </Card>
        );
    }

    // Assumptions:
    // data[0] = 2 days ago
    // data[1] = yesterday
    // data[2] = today (start of forecast)

    // Safety check if we have enough data
    const hasHistory = data.length >= 3;
    const historyData = hasHistory ? data.slice(0, 2) : []; // Past 2 days
    const forecastData = hasHistory ? data.slice(2) : data; // Today onwards

    // Calculate past stats
    // Calculate past stats
    const past24hSnow = historyData.length > 1 ? (historyData[1].snowfall_sum || 0) : 0;
    const past48hSnow = historyData.reduce((acc, day) => acc + (day.snowfall_sum || 0), 0);

    const powderScore = calculatePowderScore(forecastData);

    return (
        <Card
            className="overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-primary/10 flex flex-col h-full cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <CardHeader className="pb-2 bg-muted/20">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{name}</CardTitle>
                        <CardDescription>{region}</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary">{powderScore}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-widest">Powder Score</div>
                        </div>
                        <div className="text-muted-foreground">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div className="flex gap-4 mt-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <div className="text-muted-foreground text-xs">Past 24h</div>
                            <div className="font-semibold">{past24hSnow.toFixed(1)} cm</div>
                        </div>
                        <div>
                            <div className="text-muted-foreground text-xs">Past 48h</div>
                            <div className="font-semibold">{past48hSnow.toFixed(1)} cm</div>
                        </div>
                    </div>
                )}
            </CardHeader>

            {isExpanded && (
                <CardContent className="flex-1 flex flex-col pt-4 animate-in zoom-in-95 duration-200">
                    <div className="h-[100px] w-full mb-6 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastData}>
                                <XAxis
                                    dataKey="date"
                                    hide
                                />
                                <YAxis
                                    label={{ value: 'cm', position: 'insideLeft', angle: 0, style: { fontSize: '10px', fill: 'hsl(var(--muted-foreground))' } }}
                                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                    width={30}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        backgroundColor: 'hsl(var(--popover))',
                                        color: 'hsl(var(--popover-foreground))'
                                    }}
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value: number) => [`${value.toFixed(1)} cm`, 'Snowfall']}
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Bar dataKey="snowfall_sum" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
                        {forecastData.map((day) => {
                            const isBluebird = day.precipitation_probability_max < 20 && day.visibility_min > 5000;
                            const isPowder = day.snowfall_sum > 10;
                            const isWhiteout = day.visibility_min < 200;

                            return (
                                <div key={day.date} className="grid grid-cols-12 gap-2 items-center text-sm border-b pb-2 last:border-0">
                                    <div className="col-span-3 text-xs font-medium text-muted-foreground">
                                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric' })}
                                    </div>
                                    <div className="col-span-3 flex flex-col items-start gap-0.5">
                                        <div className="font-semibold flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            {day.snowfall_sum.toFixed(0)} <span className="text-[10px] text-muted-foreground">cm</span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            {day.temperature_2m_min?.toFixed(0)}° / {day.temperature_2m_max?.toFixed(0)}°
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                                        <div className="flex items-center gap-1"><Wind className="w-3 h-3" /> {day.wind_speed_10m_max.toFixed(0)} km/h</div>
                                        <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(day.visibility_min / 1000).toFixed(1)} km</div>
                                    </div>
                                    <div className="col-span-3 flex justify-end">
                                        {isPowder && <Badge variant="default" className="bg-indigo-600 h-5 px-1 text-[10px]">Powder</Badge>}
                                        {isBluebird && !isPowder && <Badge variant="secondary" className="bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100 h-5 px-1 text-[10px]">Bluebird</Badge>}
                                        {isWhiteout && <Badge variant="destructive" className="h-5 px-1 text-[10px]">Whiteout</Badge>}
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
