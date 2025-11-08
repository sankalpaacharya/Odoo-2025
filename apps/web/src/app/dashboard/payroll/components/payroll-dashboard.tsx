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
import { AlertCircle, TrendingUp } from "lucide-react";
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
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [isLoadingWarnings, setIsLoadingWarnings] = useState(true);
  const [isLoadingPayruns, setIsLoadingPayruns] = useState(true);

  useEffect(() => {
    fetchWarnings();
    fetchRecentPayruns();
  }, []);

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

  const handleWarningClick = (warning: Warning) => {
    setSelectedWarning(warning);
    setWarningModalOpen(true);
  };

  const formatPayrunMonth = (month: number, year: number) => {
    return `${MONTH_NAMES[month - 1]} ${year}`;
  };

  const payrollData = {
    monthly: [
      { month: "Jul 2025", cost: 120000, count: 10 },
      { month: "Aug 2025", cost: 135000, count: 11 },
      { month: "Sep 2025", cost: 150000, count: 12 },
      { month: "Oct 2025", cost: 165000, count: 13 },
      { month: "Nov 2025", cost: 180000, count: 15 },
      { month: "Dec 2025", cost: 220000, count: 18 },
    ],
    annually: [
      { month: "2020", cost: 1200000, count: 30 },
      { month: "2021", cost: 1500000, count: 38 },
      { month: "2022", cost: 1800000, count: 45 },
      { month: "2023", cost: 2100000, count: 52 },
      { month: "2024", cost: 2400000, count: 60 },
      { month: "2025", cost: 550000, count: 18 },
    ],
  };

  const currentMonthIndex = payrollData.monthly.length - 1;
  const currentYearIndex = payrollData.annually.length - 1;

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
    <div className="grid gap-6">
      <PayrollWarningModal
        open={warningModalOpen}
        onOpenChange={setWarningModalOpen}
        warning={selectedWarning}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Warning Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-yellow-600" />
              Warning
            </CardTitle>
            <CardDescription>Employee setup issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingWarnings ? (
              <p className="text-sm text-muted-foreground">
                Loading warnings...
              </p>
            ) : warnings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No warnings found. All employees have complete information.
              </p>
            ) : (
              warnings.map((warning) => (
                <Button
                  key={warning.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => handleWarningClick(warning)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600 hover:underline">
                      {warning.count} {warning.message}
                    </span>
                  </div>
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Payrun Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Payrun
            </CardTitle>
            <CardDescription>Recent pay runs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingPayruns ? (
              <p className="text-sm text-muted-foreground">
                Loading payruns...
              </p>
            ) : recentPayruns.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent payruns found.
              </p>
            ) : (
              recentPayruns.map((payrun) => (
                <Button
                  key={payrun.id}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-blue-600 hover:underline">
                      Payrun for {formatPayrunMonth(payrun.month, payrun.year)}{" "}
                      ({payrun._count.payslips} Payslips)
                    </span>
                  </div>
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll Statistics</CardTitle>
              <CardDescription>
                Employer cost and employee count trends{" "}
                {employerCostView === "annually" ? "annually" : "monthly"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="payroll-view"
                className={cn(
                  "text-sm cursor-pointer",
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
                  "text-sm cursor-pointer",
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
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <BarChart
              accessibilityLayer
              data={payrollData[employerCostView]}
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
                tickFormatter={(value) => value.slice(0, 3)}
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
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                yAxisId="left"
                dataKey="cost"
                fill="var(--chart-1)"
                radius={4}
                strokeWidth={2}
                activeIndex={
                  employerCostView === "monthly"
                    ? currentMonthIndex
                    : currentYearIndex
                }
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
                activeIndex={
                  employerCostView === "monthly"
                    ? currentMonthIndex
                    : currentYearIndex
                }
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
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Showing payroll trends for the last{" "}
            {employerCostView === "monthly" ? "6 months" : "6 years"}
          </div>
          <div className="text-muted-foreground leading-none">
            Active period:{" "}
            {employerCostView === "monthly"
              ? payrollData.monthly[currentMonthIndex].month
              : payrollData.annually[currentYearIndex].month}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
