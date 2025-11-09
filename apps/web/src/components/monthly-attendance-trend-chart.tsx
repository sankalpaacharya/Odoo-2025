"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
    color: "hsl(142, 76%, 36%)",
  },
  on_leave: {
    label: "On Leave",
    color: "hsl(32, 95%, 44%)",
  },
  absent: {
    label: "Absent",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig;

export function MonthlyAttendanceTrendChart() {
  const [timeRange, setTimeRange] = React.useState("30d");

  const days = React.useMemo(() => {
    if (timeRange === "90d") return 90;
    if (timeRange === "7d") return 7;
    return 30;
  }, [timeRange]);

  const { data: chartData, isLoading } = useMonthlyAttendanceTrend(days);

  if (isLoading || !chartData) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Monthly Attendance Trend</CardTitle>
          <CardDescription>
            Daily attendance patterns over the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Loader />
        </CardContent>
      </Card>
    );
  }

  // Data is already filtered by the hook based on the days parameter
  const filteredData = chartData || [];

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
      <CardContent className="px-2 sm:px-6 h-full max-h-80">
        <ChartContainer config={chartConfig} className="h-full w-full">
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
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
            <ChartLegend
              content={<ChartLegendContent />}
              verticalAlign="top"
              align="right"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
