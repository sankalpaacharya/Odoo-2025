"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AlertCircle, FileText, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  XAxis,
  YAxis,
} from "recharts";
import { apiClient } from "@/lib/api-client";
import { PayrollWarningModal } from "./payroll-warning-modal";
import Link from "next/link";

interface Warning {
  id: string;
  type: string;
  message: string;
  count: number;
  employees: any[];
}

interface Payrun {
  id: string;
  month: number;
  year: number;
  status: string;
  totalAmount: number;
  processedAt: string | null;
  _count: {
    payslips: number;
  };
}

interface PayrollStatistic {
  month: string;
  cost: number;
  count: number;
  isPending?: boolean;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function PayrollDashboard() {
  const [employerCostView, setEmployerCostView] = useState<
    "monthly" | "annually"
  >("monthly");
  const [employeeCountView, setEmployeeCountView] = useState<
    "monthly" | "annually"
  >("monthly");

  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [recentPayruns, setRecentPayruns] = useState<Payrun[]>([]);
  const [payrollStatistics, setPayrollStatistics] = useState<
    PayrollStatistic[]
  >([]);
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [isLoadingWarnings, setIsLoadingWarnings] = useState(true);
  const [isLoadingPayruns, setIsLoadingPayruns] = useState(true);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(true);

  useEffect(() => {
    fetchWarnings();
    fetchRecentPayruns();
  }, []);

  useEffect(() => {
    fetchPayrollStatistics(employerCostView);
  }, [employerCostView]);

  const fetchWarnings = async () => {
    try {
      setIsLoadingWarnings(true);
      const data = await apiClient<Warning[]>("/api/payroll/warnings");
      setWarnings(data);
    } catch (error) {
      console.error("Error fetching warnings:", error);
    } finally {
      setIsLoadingWarnings(false);
    }
  };

  const fetchRecentPayruns = async () => {
    try {
      setIsLoadingPayruns(true);
      const data = await apiClient<Payrun[]>("/api/payroll/payruns/recent");
      setRecentPayruns(data);
    } catch (error) {
      console.error("Error fetching recent payruns:", error);
    } finally {
      setIsLoadingPayruns(false);
    }
  };

  const fetchPayrollStatistics = async (view: "monthly" | "annually") => {
    try {
      setIsLoadingStatistics(true);
      const data = await apiClient<PayrollStatistic[]>(
        `/api/payroll/statistics?view=${view}`
      );
      setPayrollStatistics(data);
    } catch (error) {
      console.error("Error fetching payroll statistics:", error);
    } finally {
      setIsLoadingStatistics(false);
    }
  };

  const handleWarningClick = (warning: Warning) => {
    setSelectedWarning(warning);
    setWarningModalOpen(true);
  };

  const formatPayrunMonth = (month: number, year: number) => {
    return `${MONTH_NAMES[month - 1]} ${year}`;
  };

  const currentMonthIndex = payrollStatistics.length - 1;

  const chartConfig = {
    cost: {
      label: "Employer Cost",
      color: "var(--chart-1)",
    },
    count: {
      label: "Employee Count",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-4 sm:gap-6">
      <PayrollWarningModal
        open={warningModalOpen}
        onOpenChange={setWarningModalOpen}
        warning={selectedWarning}
      />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertCircle className="size-4 sm:size-5 text-yellow-600" />
              Warning
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Employee setup issues</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            {isLoadingWarnings ? (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Loading warnings...
              </p>
            ) : warnings.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">
                No warnings found. All employees have complete information.
              </p>
            ) : (
              warnings.map((warning) => (
                <Button
                  key={warning.id}
                  variant="ghost"
                  className="flex w-fit justify-start text-left h-auto py-1 transition-colors hover:cursor-pointer hover:underline text-blue-600 hover:text-blue-600 hover:bg-transparent px-0!"
                  onClick={() => handleWarningClick(warning)}
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    {warning.count} {warning.message}
                  </div>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="size-4 sm:size-5" />
              Recent Pay Runs
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Latest payroll processing history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              {recentPayruns.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No recent payruns found.
                </p>
              ) : (
                recentPayruns.map((payrun) => (
                  <Link
                    key={payrun.id}
                    href={`/dashboard/payroll?tab=payrun&month=${payrun.month}&year=${payrun.year}`}
                    className="flex w-full justify-start text-left h-auto py-1 transition-colors hover:cursor-pointer hover:underline text-blue-600"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-xs sm:text-sm font-medium">
                        Payrun for{" "}
                        {formatPayrunMonth(payrun.month, payrun.year)} (
                        {payrun._count.payslips} Payslips)
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Section */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg">Payroll Statistics</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Employer cost and employee count trends{" "}
                {employerCostView === "annually" ? "annually" : "monthly"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="payroll-view"
                className={cn(
                  "text-xs sm:text-sm cursor-pointer",
                  employerCostView === "annually"
                    ? "text-muted-foreground"
                    : "text-foreground font-medium"
                )}
              >
                Monthly
              </Label>
              <Switch
                id="payroll-view"
                checked={employerCostView === "annually"}
                onCheckedChange={(checked) => {
                  setEmployerCostView(checked ? "annually" : "monthly");
                  setEmployeeCountView(checked ? "annually" : "monthly");
                }}
              />
              <Label
                htmlFor="payroll-view"
                className={cn(
                  "text-xs sm:text-sm cursor-pointer",
                  employerCostView === "annually"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                Annually
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] lg:h-[350px] w-full">
            {isLoadingStatistics ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  Loading statistics...
                </p>
              </div>
            ) : payrollStatistics.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">
                  No payroll data available
                </p>
              </div>
            ) : (
              <BarChart
                accessibilityLayer
                data={payrollStatistics}
                margin={{
                  top: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    employerCostView === "annually" ? value : value.slice(0, 3)
                  }
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="var(--chart-1)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--chart-2)"
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={true}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;

                    const data = payload[0].payload;
                    const isPending = data?.isPending;

                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {data.month}
                              {isPending && (
                                <span className="ml-2 text-orange-600 font-medium">
                                  (Pending)
                                </span>
                              )}
                            </span>
                          </div>
                          {payload.map((entry: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="h-2.5 w-2.5 rounded-[2px]"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {entry.name}:
                              </span>
                              <span className="text-sm font-medium">
                                {entry.name === "Employer Cost"
                                  ? `₹${entry.value.toLocaleString("en-IN")}`
                                  : entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="left"
                  dataKey="cost"
                  fill="var(--chart-1)"
                  radius={4}
                  strokeWidth={2}
                  activeIndex={currentMonthIndex}
                  activeBar={({ ...props }) => {
                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke="var(--chart-1)"
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    );
                  }}
                  shape={(props: any) => {
                    const { x, y, width, height, index } = props;
                    const data = payrollStatistics[index];
                    const isPending = data?.isPending;

                    return (
                      <Rectangle
                        {...props}
                        fill={isPending ? "transparent" : "var(--chart-1)"}
                        fillOpacity={isPending ? 0 : 1}
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        strokeDasharray={isPending ? "4 4" : "0"}
                      />
                    );
                  }}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
                <Bar
                  yAxisId="right"
                  dataKey="count"
                  fill="var(--chart-2)"
                  radius={4}
                  strokeWidth={2}
                  activeIndex={currentMonthIndex}
                  activeBar={({ ...props }) => {
                    return (
                      <Rectangle
                        {...props}
                        fillOpacity={0.8}
                        stroke="var(--chart-2)"
                        strokeDasharray={4}
                        strokeDashoffset={4}
                      />
                    );
                  }}
                  shape={(props: any) => {
                    const { x, y, width, height, index } = props;
                    const data = payrollStatistics[index];
                    const isPending = data?.isPending;

                    return (
                      <Rectangle
                        {...props}
                        fill={isPending ? "transparent" : "var(--chart-2)"}
                        fillOpacity={isPending ? 0 : 1}
                        stroke="var(--chart-2)"
                        strokeWidth={2}
                        strokeDasharray={isPending ? "4 4" : "0"}
                      />
                    );
                  }}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            )}
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Showing payroll trends for the last{" "}
            {employerCostView === "monthly" ? "6 months" : "6 years"}
          </div>
          {payrollStatistics.length > 0 && (
            <>
              <div className="text-muted-foreground leading-none">
                Active period: {payrollStatistics[currentMonthIndex]?.month}
              </div>
              {payrollStatistics.some((stat) => stat.isPending) && (
                <div className="flex items-center gap-1.5 text-muted-foreground leading-none">
                  <div
                    className="h-3 w-3 rounded border-2 border-current"
                    style={{ borderStyle: "dashed" }}
                  />
                  <span>Dotted outline indicates pending payrun</span>
                </div>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
