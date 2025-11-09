"use client";

import { Users } from "lucide-react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { type PieSectorDataItem } from "recharts/types/polar/Pie";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface TodayAttendance {
  employeeId: string;
  employeeName: string;
  status: string;
  isCurrentlyActive: boolean;
}

interface ActivityData {
  status: string;
  count: number;
  fill: string;
}

const chartConfig = {
  count: {
    label: "Employees",
  },
  online: {
    label: "Online",
    color: "var(--chart-2)",
  },
  offline: {
    label: "Offline", // Present but checked out
    color: "var(--chart-1)",
  },
  on_leave: {
    label: "On Leave",
    color: "var(--chart-3)",
  },
  absent: {
    label: "Absent",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

function useEmployeeActivity() {
  return useQuery({
    queryKey: ["dashboard", "employee-activity"],
    queryFn: async () => {
      try {
        const todayAttendance = await apiClient<TodayAttendance[]>(
          "/api/attendance/today"
        );

        const activityMap: Record<string, number> = {
          online: 0,
          offline: 0,
          on_leave: 0,
          absent: 0,
        };

        todayAttendance.forEach((att) => {
          const status = att.status.toUpperCase();

          if (status === "ON_LEAVE") {
            activityMap.on_leave++;
          } else if (status === "ABSENT") {
            activityMap.absent++;
          } else if (status === "PRESENT") {
            // Employee is present (has worked today)
            if (att.isCurrentlyActive) {
              activityMap.online++;
            } else {
              activityMap.offline++;
            }
          } else {
            // Default to offline for unknown statuses
            activityMap.offline++;
          }
        });

        const chartData: ActivityData[] = [
          {
            status: "Online",
            count: activityMap.online,
            fill: "var(--color-online)",
          },
          {
            status: "Offline",
            count: activityMap.offline,
            fill: "var(--color-offline)",
          },
          {
            status: "On Leave",
            count: activityMap.on_leave,
            fill: "var(--color-on_leave)",
          },
          {
            status: "Absent",
            count: activityMap.absent,
            fill: "var(--color-absent)",
          },
        ];

        const totalEmployees = todayAttendance.length;
        const activeNow = activityMap.online;

        return { chartData, totalEmployees, activeNow };
      } catch (error) {
        console.error("Error fetching employee activity:", error);
        return {
          chartData: [],
          totalEmployees: 0,
          activeNow: 0,
        };
      }
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });
}

export function EmployeeActivityChart() {
  const { data, isLoading } = useEmployeeActivity();

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Activity Status
          </CardTitle>
          <CardDescription>Loading activity data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center min-h-[300px]">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const { chartData = [], totalEmployees = 0, activeNow = 0 } = data || {};
  const activityRate =
    totalEmployees > 0 ? ((activeNow / totalEmployees) * 100).toFixed(1) : "0";

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Employee Activity Status
        </CardTitle>
        <CardDescription>Current online/offline distribution</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
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
                          {activeNow}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Active Now
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {activityRate}% of employees currently active
        </div>
        <div className="text-muted-foreground leading-none">
          Real-time activity status of {totalEmployees} employees
        </div>
      </CardFooter>
    </Card>
  );
}
