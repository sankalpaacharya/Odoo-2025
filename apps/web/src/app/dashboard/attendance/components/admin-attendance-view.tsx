"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/loader";
import { useTodayAttendance } from "../hooks";
import { formatTime } from "../utils";
import { toast } from "sonner";
import type { EmployeeAttendance } from "../types";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge, EmployeeAvatar } from "@/components/status-badge";
import { StatsCards, type StatItem } from "@/components";

const attendanceColumns: Column<EmployeeAttendance>[] = [
  {
    key: "avatar",
    // No label for avatar column
    sortable: false,
    render: (record) => <EmployeeAvatar name={record.employeeName} size="sm" />,
    className: "w-12",
  },
  {
    key: "employeeName",
    label: "Name",
    className: "font-medium",
  },
  {
    key: "employeeCode",
    label: "Employee ID",
    className: "font-medium",
  },
  {
    key: "department",
    label: "Department",
  },
  {
    key: "designation",
    label: "Designation",
    render: (record) => record.designation || "N/A",
  },
  {
    key: "checkIn",
    label: "Check In",
    render: (record) => formatTime(record.checkIn),
  },
  {
    key: "checkOut",
    label: "Check Out",
    render: (record) => formatTime(record.checkOut),
  },
  {
    key: "workingHours",
    label: "Work Hours",
    render: (record) =>
      record.workingHours > 0 ? `${record.workingHours.toFixed(2)}h` : "-",
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge status={record.status} />,
  },
];

export function AdminAttendanceView() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: attendances = [], isLoading, error } = useTodayAttendance();

  if (error) {
    toast.error("Failed to load today's attendance");
  }

  const filteredAttendances = attendances.filter(
    (record: EmployeeAttendance) =>
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEmployees = attendances.length;
  const presentToday = attendances.filter(
    (e: EmployeeAttendance) => e.status === "PRESENT" || e.status === "LATE"
  ).length;
  const onLeave = attendances.filter(
    (e: EmployeeAttendance) => e.status === "ON_LEAVE"
  ).length;
  const absent = attendances.filter(
    (e: EmployeeAttendance) => e.status === "ABSENT"
  ).length;

  const statsData: StatItem[] = [
    {
      name: "Total Employees",
      value: totalEmployees,
      description: "Active employees",
    },
    {
      name: "Present Today",
      value: presentToday,
      description: `${
        totalEmployees > 0
          ? ((presentToday / totalEmployees) * 100).toFixed(1)
          : 0
      }% attendance`,
      valueClassName: "text-green-600",
    },
    {
      name: "On Leave",
      value: onLeave,
      description: "Employees on leave",
      valueClassName: "text-amber-600",
    },
    {
      name: "Absent",
      value: absent,
      description: "Absent employees",
      valueClassName: "text-red-600",
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StatsCards data={statsData} />

      <div className="rounded-lg">
        <div className="py-4">
          <h2 className="text-lg font-semibold">Today's Attendance</h2>
        </div>
        <DataTable
          data={filteredAttendances}
          columns={attendanceColumns}
          keyExtractor={(record) => record.employeeId}
          emptyMessage="No employees found"
          isLoading={isLoading}
          loadingMessage="Loading attendance..."
        />
      </div>
    </>
  );
}
