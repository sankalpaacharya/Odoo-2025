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
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartData = [
  { type: "Sick", count: 45, fill: "var(--color-sick)" },
  { type: "Vacation", count: 78, fill: "var(--color-vacation)" },
  { type: "Personal", count: 32, fill: "var(--color-personal)" },
  { type: "Emergency", count: 18, fill: "var(--color-emergency)" },
  { type: "Unpaid", count: 12, fill: "var(--color-unpaid)" },
];

const chartConfig = {
  sick: {
    label: "Sick Leave",
    color: "hsl(217, 91%, 60%)",
  },
  vacation: {
    label: "Vacation",
    color: "hsl(200, 98%, 39%)",
  },
  personal: {
    label: "Personal",
    color: "hsl(199, 89%, 48%)",
  },
  emergency: {
    label: "Emergency",
    color: "hsl(188, 94%, 43%)",
  },
  unpaid: {
    label: "Unpaid",
    color: "hsl(205, 87%, 29%)",
  },
};

export function LeaveDistributionChart() {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Leave Type Distribution</CardTitle>
        <CardDescription>
          Approved leaves by type for the current year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="type"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
