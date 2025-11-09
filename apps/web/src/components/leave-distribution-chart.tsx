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
import { useLeaveDistribution } from "@/app/dashboard/hooks";
import Loader from "./loader";

const chartConfig = {
  count: {
    label: "Leaves",
    color: "hsl(217, 91%, 60%)",
  },
};

export function LeaveDistributionChart() {
  const { data: chartData, isLoading } = useLeaveDistribution();

  if (isLoading || !chartData) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Leave Type Distribution</CardTitle>
          <CardDescription>
            Approved leaves by type for the current year
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
    fill: `hsl(${217 - index * 10}, ${91 - index * 5}%, ${60 - index * 8}%)`,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg">
          Leave Type Distribution
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Approved leaves by type for the current year
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="h-[250px] sm:h-[300px] lg:h-[350px] w-full"
        >
          <BarChart data={formattedData}>
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
