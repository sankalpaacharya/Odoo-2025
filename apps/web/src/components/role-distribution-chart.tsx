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
import { Pie, PieChart, Label } from "recharts";

const chartData = [
  { role: "employee", count: 142, fill: "var(--color-employee)" },
  { role: "hr", count: 8, fill: "var(--color-hr)" },
  { role: "admin", count: 3, fill: "var(--color-admin)" },
  { role: "payroll", count: 5, fill: "var(--color-payroll)" },
];

const chartConfig = {
  employee: {
    label: "Employee",
    color: "hsl(var(--chart-1))",
  },
  hr: {
    label: "HR Officer",
    color: "hsl(var(--chart-2))",
  },
  admin: {
    label: "Admin",
    color: "hsl(var(--chart-3))",
  },
  payroll: {
    label: "Payroll Officer",
    color: "hsl(var(--chart-4))",
  },
};

export function RoleDistributionChart() {
  const totalUsers = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Role Distribution</CardTitle>
        <CardDescription>
          Breakdown of users by role in the organization
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="role"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalUsers.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Users
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="role" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
