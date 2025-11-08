"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartData = [
  { month: "Jan", hired: 5, terminated: 2 },
  { month: "Feb", hired: 8, terminated: 1 },
  { month: "Mar", hired: 12, terminated: 3 },
  { month: "Apr", hired: 6, terminated: 4 },
  { month: "May", hired: 9, terminated: 2 },
  { month: "Jun", hired: 15, terminated: 1 },
  { month: "Jul", hired: 7, terminated: 3 },
  { month: "Aug", hired: 11, terminated: 2 },
  { month: "Sep", hired: 10, terminated: 4 },
  { month: "Oct", hired: 13, terminated: 2 },
  { month: "Nov", hired: 8, terminated: 1 },
];

const chartConfig = {
  hired: {
    label: "New Hires",
    color: "hsl(var(--chart-1))",
  },
  terminated: {
    label: "Terminations",
    color: "hsl(var(--chart-5))",
  },
};

export function HiringTrendChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Hiring & Attrition Trends</CardTitle>
        <CardDescription>
          Monthly new hires vs terminations over the year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="hired"
              stroke="var(--color-hired)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="terminated"
              stroke="var(--color-terminated)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
