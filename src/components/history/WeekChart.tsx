"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { FocusSession } from "@/types/focus";
import { lastNDays } from "@/lib/stats";
import { formatDurationShort } from "@/lib/timer/format";
import { useReferenceNow } from "@/hooks/useReferenceNow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface WeekChartProps {
  sessions: FocusSession[];
}

const chartConfig = {
  seconds: {
    label: "Focus",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function WeekChart({ sessions }: WeekChartProps) {
  const now = useReferenceNow();
  const days = useMemo(() => lastNDays(7, sessions, now), [sessions, now]);
  const total = days.reduce((acc, day) => acc + day.seconds, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 7 days</CardTitle>
        <CardDescription>{formatDurationShort(total)} of focus</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
          <BarChart accessibilityLayer data={days} margin={{ top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <div className="flex w-full items-center justify-between gap-6">
                      <span className="text-muted-foreground">Focus</span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {formatDurationShort(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="seconds"
              fill="var(--color-seconds)"
              radius={6}
              maxBarSize={64}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
