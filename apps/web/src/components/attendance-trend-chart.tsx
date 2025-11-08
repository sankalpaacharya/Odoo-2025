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
import { useEmployeeStatusDistribution } from "@/app/dashboard/hooks";
import Loader from "./loader";

const chartConfig = {
  count: {
    label: "Employees",
    color: "hsl(217, 91%, 60%)",
  },
};

export function AttendanceTrendChart() {
  const { data: chartData, isLoading } = useEmployeeStatusDistribution();

  if (isLoading || !chartData) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Employee Status Today</CardTitle>
          <CardDescription>
            Current status breakdown of all employees
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  const formattedData = chartData.map((item, index) => ({
    ...item,
    fill:
      index === 0
        ? "hsl(142, 76%, 36%)" // Green for Present
        : index === 1
        ? "hsl(0, 84%, 60%)" // Red for Absent
        : "hsl(217, 91%, 60%)", // Blue for On Leave
  }));

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Employee Status Today</CardTitle>
        <CardDescription>
          Current status breakdown of all employees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="status"
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
