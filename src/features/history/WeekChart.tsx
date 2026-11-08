"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { FocusMode, FocusSession } from "@/types/focus";
import { lastNDays } from "@/lib/stats";
import { formatDurationShort } from "@/lib/timer/format";
import { useReferenceNow } from "@/hooks/useReferenceNow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface WeekChartProps {
  sessions: FocusSession[];
}

const chartConfig = {
  open: {
    label: "Open",
    color: "var(--chart-1)",
  },
  target: {
    label: "Target",
    color: "var(--chart-2)",
  },
  pomodoro: {
    label: "Pomodoro",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

/** Stacking order, bottom bar first. */
const STACK: { key: FocusMode; radius?: [number, number, number, number] }[] = [
  { key: "open", radius: [0, 0, 4, 4] },
  { key: "target" },
  { key: "pomodoro", radius: [4, 4, 0, 0] },
];

export function WeekChart({ sessions }: WeekChartProps) {
  const now = useReferenceNow();
  const days = useMemo(() => lastNDays(7, sessions, now), [sessions, now]);
  const total = days.reduce((acc, day) => acc + day.open + day.target + day.pomodoro, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 7 days</CardTitle>
        <CardDescription>{formatDurationShort(total)} of focus</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
          <BarChart accessibilityLayer data={days} margin={{ top: 4 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <div className="flex w-full items-center justify-between gap-6">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{ background: item.color }}
                        />
                        {chartConfig[name as FocusMode]?.label ?? name}
                      </span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {formatDurationShort(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {STACK.map(({ key, radius }) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={`var(--color-${key})`}
                radius={radius}
                maxBarSize={64}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
