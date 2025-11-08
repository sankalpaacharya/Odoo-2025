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

const chartData = [
  { department: "Engineering", headcount: 48 },
  { department: "Sales", headcount: 32 },
  { department: "Marketing", headcount: 24 },
  { department: "Operations", headcount: 28 },
  { department: "Finance", headcount: 12 },
  { department: "HR", headcount: 8 },
  { department: "Support", headcount: 18 },
];

const chartConfig = {
  headcount: {
    label: "Headcount",
    color: "hsl(200, 98%, 39%)",
  },
};

export function DepartmentHeadcountChart() {
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
