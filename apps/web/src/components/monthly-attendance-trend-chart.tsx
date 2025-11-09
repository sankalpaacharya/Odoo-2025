"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMonthlyAttendanceTrend } from "@/app/dashboard/hooks";
import Loader from "./loader";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  present: {
    label: "Present",
    color: "var(--chart-1)",
  },
  on_leave: {
    label: "On Leave",
    color: "var(--chart-2)",
  },
  absent: {
    label: "Absent",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function MonthlyAttendanceTrendChart() {
  const { data: chartData, isLoading } = useMonthlyAttendanceTrend();
  const [timeRange, setTimeRange] = React.useState("30d");

  if (isLoading || !chartData) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Monthly Attendance Trend</CardTitle>
          <CardDescription>
            Daily attendance patterns over the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const now = new Date();
    let daysToSubtract = 30;
    if (timeRange === "90d") {
      daysToSubtract = 90;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  console.log(filteredData, "filteredData");

  return (
    <Card className="pt-0 h-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Monthly Attendance Trend</CardTitle>
          <CardDescription>
            Showing daily attendance patterns for the selected period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-full flex-1 w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-present)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-present)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillOnLeave" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-on_leave)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-on_leave)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAbsent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-absent)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-absent)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="absent"
              type="natural"
              fill="url(#fillAbsent)"
              stroke="var(--color-absent)"
            />
            <Area
              dataKey="on_leave"
              type="natural"
              fill="url(#fillOnLeave)"
              stroke="var(--color-on_leave)"
            />
            <Area
              dataKey="present"
              type="natural"
              fill="url(#fillPresent)"
              stroke="var(--color-present)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
