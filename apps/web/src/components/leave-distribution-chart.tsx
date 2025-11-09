"use client";

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
import { Pie, PieChart } from "recharts";
import { useLeaveDistribution } from "@/app/dashboard/hooks";
import Loader from "./loader";

const chartConfig = {
  count: {
    label: "Leaves",
  },
  "Paid Time Off": {
    label: "Paid Time Off",
    color: "hsl(var(--chart-1))",
  },
  "Sick Leave": {
    label: "Sick Leave",
    color: "hsl(var(--chart-2))",
  },
  "Unpaid Leave": {
    label: "Unpaid Leave",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

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

  // Check if all counts are zero
  const hasData = chartData.some((item) => item.count > 0);

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

  const formattedData = chartData.map((item, index) => ({
    ...item,
    fill: COLORS[index] || `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="items-center pb-4">
        <CardTitle className="text-base sm:text-lg">
          Leave Type Distribution
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Approved leaves by type for the current year
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-2 sm:px-6">
        {!hasData ? (
          <div className="flex items-center justify-center h-[250px] sm:h-[300px] lg:h-[350px]">
            <p className="text-sm text-muted-foreground">
              No approved leaves data available for this year
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px] sm:max-h-[300px] lg:max-h-[350px] [&_.recharts-pie-label-text]:fill-foreground"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={formattedData} dataKey="count" label nameKey="type" />
              <ChartLegend content={<ChartLegendContent nameKey="type" />} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
