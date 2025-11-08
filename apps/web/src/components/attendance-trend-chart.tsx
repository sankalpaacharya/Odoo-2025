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

const chartData = [
  { month: "Jan", attendance: 92 },
  { month: "Feb", attendance: 89 },
  { month: "Mar", attendance: 94 },
  { month: "Apr", attendance: 91 },
  { month: "May", attendance: 88 },
  { month: "Jun", attendance: 95 },
  { month: "Jul", attendance: 93 },
  { month: "Aug", attendance: 90 },
  { month: "Sep", attendance: 96 },
  { month: "Oct", attendance: 94 },
  { month: "Nov", attendance: 92 },
];

const chartConfig = {
  attendance: {
    label: "Attendance Rate",
    color: "hsl(217, 91%, 60%)",
  },
};

export function AttendanceTrendChart() {
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
              domain={[80, 100]}
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
