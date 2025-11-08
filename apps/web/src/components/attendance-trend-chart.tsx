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
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useMonthlyAttendanceTrend } from "@/app/dashboard/hooks";
import Loader from "./loader";

const chartConfig = {
  attendance: {
    label: "Attendance Rate",
    color: "hsl(217, 91%, 60%)",
  },
};

export function AttendanceTrendChart() {
  const { data: chartData, isLoading } = useMonthlyAttendanceTrend();

  if (isLoading || !chartData) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Monthly Attendance Trend</CardTitle>
          <CardDescription>
            Overall attendance rate over the last 11 months
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Monthly Attendance Trend</CardTitle>
        <CardDescription>
          Overall attendance rate over the last 11 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-attendance)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-attendance)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              type="natural"
              dataKey="attendance"
              stroke="var(--color-attendance)"
              fill="url(#fillAttendance)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
