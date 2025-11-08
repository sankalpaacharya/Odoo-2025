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
import { useDepartmentHeadcount } from "@/app/dashboard/hooks";
import Loader from "./loader";

const chartConfig = {
  headcount: {
    label: "Headcount",
    color: "hsl(200, 98%, 39%)",
  },
};

export function DepartmentHeadcountChart() {
  const { data: chartData, isLoading } = useDepartmentHeadcount();

  if (isLoading || !chartData) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Department Headcount</CardTitle>
          <CardDescription>
            Employee distribution across departments
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
        <CardTitle>Department Headcount</CardTitle>
        <CardDescription>
          Employee distribution across departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="department"
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="headcount"
              fill="var(--color-headcount)"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
