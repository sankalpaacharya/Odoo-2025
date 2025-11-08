"use client";

import {
  Calendar as CalendarIcon,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

import { DataTable, type Column } from "@/components/data-table";
import Loader from "@/components/loader";
import { EmployeeAvatar, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatHoursToTime, formatTime } from "@/lib/time-utils";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useTodayAttendance } from "../hooks";
import type { EmployeeAttendance } from "../types";

import { StatsCards, type StatItem } from "@/components";
import { cn } from "@/lib/utils";

const attendanceColumns: (
  expandedRows: Set<string>,
  toggleRow: (id: string) => void
) => Column<EmployeeAttendance>[] = (expandedRows, toggleRow) => [
  {
    key: "expand",
    sortable: false,
    render: (record) => {
      const hasSessions = record.sessions && record.sessions.length > 0;
      if (!hasSessions) return <div className="w-6" />;

      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => toggleRow(record.employeeId)}
        >
          {expandedRows.has(record.employeeId) ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      );
    },
    className: "w-12",
  },
  {
    key: "avatar",
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
    render: (record) => {
      const hasSessions = record.sessions && record.sessions.length > 0;
      return record.workingHours > 0 ? (
        <div className="flex flex-col">
          <span className="font-semibold">
            {formatHoursToTime(record.workingHours)}
          </span>
          {hasSessions && (
            <span className="text-xs text-muted-foreground">
              {record.sessions!.length} session
              {record.sessions!.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      ) : (
        "-"
      );
    },
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge status={record.status} />,
  },
];

export function AdminAttendanceView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { data: response, isLoading, error } = useTodayAttendance(selectedDate);

  if (error) {
    toast.error("Failed to load today's attendance");
  }

  // Normalize statuses (HALF_DAY and LATE -> PRESENT)
  const normalizedAttendances = (response || []).map(
    (record: EmployeeAttendance) => ({
      ...record,
      status: (record.status === "HALF_DAY" || record.status === "LATE"
        ? "PRESENT"
        : record.status) as typeof record.status,
    })
  );

  // Apply all filters
  const filteredAttendances = normalizedAttendances.filter(
    (record: EmployeeAttendance) => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || record.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  const totalEmployees = normalizedAttendances.length;
  const presentToday = normalizedAttendances.filter(
    (e: EmployeeAttendance) => e.status === "PRESENT"
  ).length;
  const onLeave = normalizedAttendances.filter(
    (e: EmployeeAttendance) => e.status === "ON_LEAVE"
  ).length;
  const absent = normalizedAttendances.filter(
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

  const toggleRow = (employeeId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "min-w-[300px] justify-center font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "EEEE, MMMM d, yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) =>
                  date && setSelectedDate(date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>

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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StatsCards data={statsData} />

      <div className="rounded-lg">
        <div className="py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Attendance Records</h2>
          <span className="text-sm text-muted-foreground">
            Showing {filteredAttendances.length} of {totalEmployees} employees
          </span>
        </div>

        <div className="border rounded-lg">
          <DataTable
            data={filteredAttendances}
            columns={attendanceColumns(expandedRows, toggleRow)}
            keyExtractor={(record) => record.employeeId}
            emptyMessage="No employees found"
            isLoading={isLoading}
            loadingMessage="Loading attendance..."
          />

          {/* Expanded sessions content */}
          {filteredAttendances.map((record) => {
            if (
              !expandedRows.has(record.employeeId) ||
              !record.sessions ||
              record.sessions.length === 0
            ) {
              return null;
            }

            return (
              <div
                key={`${record.employeeId}-expanded`}
                className="border-t bg-muted/30 p-4"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-3">
                    Work Sessions for {record.employeeName}
                  </h4>
                  <div className="space-y-2">
                    {record.sessions.map((session, idx) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 bg-background rounded-md border"
                      >
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Session {idx + 1}
                            </span>
                            {session.isActive && (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-500"
                              >
                                <div className="flex items-center gap-1">
                                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                  Active
                                </div>
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Check In:{" "}
                              </span>
                              <span className="font-medium">
                                {formatTime(session.startTime)}
                              </span>
                            </div>
                            <span className="text-muted-foreground">→</span>
                            <div>
                              <span className="text-muted-foreground">
                                Check Out:{" "}
                              </span>
                              <span className="font-medium">
                                {session.endTime
                                  ? formatTime(session.endTime)
                                  : "In Progress"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          {session.totalBreakTime > 0 && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Break:{" "}
                              </span>
                              <span className="font-medium">
                                {formatHoursToTime(session.totalBreakTime)}
                              </span>
                            </div>
                          )}
                          <div className="text-lg font-semibold text-primary">
                            {session.durationFormatted}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
