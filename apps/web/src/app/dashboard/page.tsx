"use client";

import { StatsCards } from "@/components/stats-cards";
import { AttendanceTrendChart } from "@/components/attendance-trend-chart";
import { LeaveDistributionChart } from "@/components/leave-distribution-chart";
import { DepartmentHeadcountChart } from "@/components/department-headcount-chart";
import { RecentLeaveRequests } from "@/components/recent-leave-requests";
import { WeeklyAttendanceChart } from "@/components/weekly-attendance-chart";

const statsData = [
  {
    name: "Total Employees",
    value: "158",
    description: "Active users in system",
    change: "+12 this month",
    changeType: "positive" as const,
  },
  {
    name: "Present Today",
    value: "142",
    description: "89.9% attendance rate",
    change: "+5.2%",
    changeType: "positive" as const,
  },
  {
    name: "Pending Requests",
    value: "8",
    description: "Awaiting approval",
    change: "-3 from yesterday",
    changeType: "positive" as const,
  },
  {
    name: "Next Payrun",
    value: "Nov 15",
    description: "7 days remaining",
    change: "On schedule",
    changeType: "neutral" as const,
  },
];

export default function DashboardPage() {
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
