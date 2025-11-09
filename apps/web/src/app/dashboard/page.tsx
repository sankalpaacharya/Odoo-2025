"use client";

import { StatsCards } from "@/components/stats-cards";
import { AttendanceTrendChart } from "@/components/attendance-trend-chart";
import { LeaveDistributionChart } from "@/components/leave-distribution-chart";
import { DepartmentHeadcountChart } from "@/components/department-headcount-chart";
import { RecentLeaveRequests } from "@/components/recent-leave-requests";
import { WeeklyAttendanceChart } from "@/components/weekly-attendance-chart";
import { useDashboardStats } from "./hooks";
import Loader from "@/components/loader";
import { Can, useAbility } from "@/components/ability-provider";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { getDefaultPageForRole } from "@/lib/role-defaults";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { userRole, canAccessRoute, loading } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !canAccessRoute("/dashboard")) {
      const defaultPage = getDefaultPageForRole(userRole as any);
      router.push(defaultPage);
    }
  }, [loading, canAccessRoute, userRole, router]);

  if (isLoading || !stats || loading) {
    return <Loader />;
  }

  if (!canAccessRoute("/dashboard")) {
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your organization
          </p>
        </div>
        <Can I="Export Data" a="Dashboard">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </Can>
      </div>

      <StatsCards data={statsData} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 w-full min-w-0">
          <AttendanceTrendChart />
        </div>
        <div className="lg:col-span-1 w-full min-w-0">
          <RecentLeaveRequests />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="w-full min-w-0">
          <LeaveDistributionChart />
        </div>
        <div className="w-full min-w-0">
          <WeeklyAttendanceChart />
        </div>
      </div>
    </div>
  );
}
