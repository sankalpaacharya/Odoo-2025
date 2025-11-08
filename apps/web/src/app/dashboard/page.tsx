"use client";

import { StatsCards } from "@/components/stats-cards";
import { AttendanceTrendChart } from "@/components/attendance-trend-chart";
import { LeaveDistributionChart } from "@/components/leave-distribution-chart";
import { DepartmentHeadcountChart } from "@/components/department-headcount-chart";
import { RecentLeaveRequests } from "@/components/recent-leave-requests";
import { WeeklyAttendanceChart } from "@/components/weekly-attendance-chart";
import { useDashboardStats } from "./hooks";
import Loader from "@/components/loader";

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
    <div className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your organization
        </p>
      </div>

      <StatsCards data={statsData} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceTrendChart />
        </div>
        <div className="lg:col-span-1">
          <RecentLeaveRequests />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LeaveDistributionChart />
        <DepartmentHeadcountChart />
      </div>

      <div className="grid gap-6">
        <WeeklyAttendanceChart />
      </div>
    </div>
  );
}
