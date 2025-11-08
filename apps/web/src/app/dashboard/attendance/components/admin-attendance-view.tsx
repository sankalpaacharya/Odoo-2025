"use client";

import { DataTable, type Column } from "@/components/data-table";
import Loader from "@/components/loader";
import { EmployeeAvatar, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatHoursToTime } from "@/lib/time-utils";
import { Calendar, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTodayAttendance } from "../hooks";
import type { EmployeeAttendance } from "../types";

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
    render: (record) => (
      <div className="flex items-center gap-2">
        {record.isCurrentlyActive && (
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        )}
        {formatTime(record.checkIn)}
      </div>
    ),
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
      record.workingHours > 0 ? formatHoursToTime(record.workingHours) : "-",
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge status={record.status} />,
  },
  {
    key: "isCurrentlyActive",
    label: "Active",
    sortable: false,
    render: (record) =>
      record.isCurrentlyActive ? (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Working
          </div>
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
  },
];

export function AdminAttendanceView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: response, isLoading, error } = useTodayAttendance();

  if (error) {
    toast.error("Failed to load today's attendance");
  }

  const attendances = response || [];

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

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const dateDisplay = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-[300px] justify-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{dateDisplay}</span>
          </div>
          <Button variant="outline" size="icon" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isToday && (
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
          )}
        </div>
      </div>

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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {presentToday}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalEmployees > 0
                ? ((presentToday / totalEmployees) * 100).toFixed(1)
                : 0}
              % attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{onLeave}</div>
            <p className="text-xs text-muted-foreground">Employees on leave</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absent}</div>
            <p className="text-xs text-muted-foreground">Absent employees</p>
          </CardContent>
        </Card>
      </div>

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
