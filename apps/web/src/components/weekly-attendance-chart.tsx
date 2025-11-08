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

const chartData = [
  { day: "Mon", present: 142, absent: 8, late: 12 },
  { day: "Tue", present: 145, absent: 5, late: 8 },
  { day: "Wed", present: 138, absent: 10, late: 14 },
  { day: "Thu", present: 148, absent: 6, late: 6 },
  { day: "Fri", present: 135, absent: 12, late: 15 },
];

const chartConfig = {
  present: {
    label: "Present",
    color: "hsl(217, 91%, 60%)",
  },
  late: {
    label: "Late",
    color: "hsl(199, 89%, 48%)",
  },
  absent: {
    label: "Absent",
    color: "hsl(205, 87%, 29%)",
  },
};

export function WeeklyAttendanceChart() {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Weekly Attendance Overview</CardTitle>
        <CardDescription>
          Daily attendance breakdown for this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
