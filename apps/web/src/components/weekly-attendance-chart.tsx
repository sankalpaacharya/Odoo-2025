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
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useWeeklyAttendance } from "@/app/dashboard/hooks";
import Loader from "./loader";

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(142, 76%, 36%, 0.8)",
  },
  late: {
    label: "Late",
    color: "hsl(25, 95%, 53%, 0.8)",
  },
  absent: {
    label: "Absent",
    color: "hsl(0, 84%, 60%, 0.8)",
  },
};

export function WeeklyAttendanceChart() {
  const { data: chartData, isLoading } = useWeeklyAttendance();

  console.log(chartData);

  if (isLoading || !chartData) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Weekly Attendance Overview</CardTitle>
          <CardDescription>
            Daily attendance breakdown for this week
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg">
          Weekly Attendance Overview
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Daily attendance breakdown for this week
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="h-[250px] sm:h-[300px] lg:h-[350px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="present"
              fill="var(--color-present)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="late"
              fill="var(--color-late)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="absent"
              fill="var(--color-absent)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
