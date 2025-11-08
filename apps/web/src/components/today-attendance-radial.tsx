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
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";

const chartData = [
  {
    metric: "attendance",
    value: 92,
    fill: "var(--color-attendance)",
  },
];

const chartConfig = {
  attendance: {
    label: "Today's Attendance",
    color: "hsl(var(--chart-1))",
  },
};

export function TodayAttendanceRadial() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Today's Attendance</CardTitle>
        <CardDescription>
          Real-time attendance rate for{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "Asia/Kathmandu",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={90 + (chartData[0].value / 100) * 360}
            innerRadius={80}
            outerRadius={140}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
              fill="var(--color-attendance)"
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
            >
              <tspan x="50%" dy="-0.5em" className="text-4xl font-bold">
                {chartData[0].value}%
              </tspan>
              <tspan
                x="50%"
                dy="1.5em"
                className="text-sm fill-muted-foreground"
              >
                Present
              </tspan>
            </text>
          </RadialBarChart>
        </ChartContainer>
        <div className="mt-4 flex w-full items-center justify-between text-sm">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-green-600">142</span>
            <span className="text-muted-foreground">Present</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-yellow-600">8</span>
            <span className="text-muted-foreground">Late</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-red-600">8</span>
            <span className="text-muted-foreground">Absent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
