"use client";

import { EmployeeActivityChart } from "@/components/employee-activity-chart";
import { LeaveDistributionChart } from "@/components/leave-distribution-chart";
import Loader from "@/components/loader";
import { MonthlyAttendanceTrendChart } from "@/components/monthly-attendance-trend-chart";
import { RecentLeaveRequests } from "@/components/recent-leave-requests";
import { StatsCards } from "@/components/stats-cards";
import { WeeklyAttendanceChart } from "@/components/weekly-attendance-chart";
import { useDashboardStats } from "./hooks";

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return <Loader />;
  }

  const attendanceChangeType: "positive" | "negative" | "neutral" =
    stats.attendanceRate >= 90
      ? "positive"
      : stats.attendanceRate >= 80
      ? "neutral"
      : "negative";

  const pendingChangeType: "positive" | "neutral" =
    stats.pendingLeaves === 0 ? "positive" : "neutral";

  const statsData = [
    {
      name: "Total Employees",
      value: stats.activeEmployees.toString(),
      description: "Active users in system",
      change: `${stats.totalEmployees} total`,
      changeType: "neutral" as const,
    },
    {
      name: "Present Today",
      value: stats.presentToday.toString(),
      description: `${stats.attendanceRate.toFixed(1)}% attendance rate`,
      change: `${stats.activeEmployees - stats.presentToday} absent`,
      changeType: attendanceChangeType,
    },
    {
      name: "Pending Requests",
      value: stats.pendingLeaves.toString(),
      description: "Awaiting approval",
      change: stats.pendingLeaves === 0 ? "All clear" : "Needs attention",
      changeType: pendingChangeType,
    },
    {
      name: "Next Payrun",
      value: stats.nextPayrun
        ? new Date(stats.nextPayrun.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "N/A",
      description: stats.nextPayrun
        ? `${stats.nextPayrun.daysRemaining} days remaining`
        : "No scheduled payrun",
      change:
        stats.nextPayrun && stats.nextPayrun.daysRemaining <= 7
          ? "Coming soon"
          : "On schedule",
      changeType: "neutral" as const,
    },
  ];

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back! Here's an overview of your organization
        </p>
      </div>

      <StatsCards data={statsData} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 grid-rows-1">
        <div className="lg:col-span-4 w-full min-w-0">
          <MonthlyAttendanceTrendChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <LeaveDistributionChart />
        <WeeklyAttendanceChart />
        <EmployeeActivityChart />
      </div>

      <div className="lg:col-span-1 w-full min-w-0">
        <RecentLeaveRequests />
      </div>
    </div>
  );
}
