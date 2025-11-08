"use client";

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Loader from "@/components/loader";
import { useMyAttendance } from "../hooks";
import { formatTime, formatHoursToTime } from "@/lib/time-utils";
import { toast } from "sonner";
import type { AttendanceRecord, WorkSessionInfo, LeaveInfo } from "../types";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DataTable, type Column } from "@/components/data-table";
import { StatsCards, type StatItem } from "@/components";
import { StatusBadge } from "@/components/status-badge";
import { WorkSessionsDisplay } from "./work-sessions-display";

const attendanceColumns: (
  expandedRows: Set<string>,
  toggleRow: (id: string) => void
) => Column<AttendanceRecord>[] = (expandedRows, toggleRow) => [
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
          onClick={() => toggleRow(record.id)}
        >
          {expandedRows.has(record.id) ? (
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
    key: "date",
    label: "Date",
    render: (record) => {
      const date = new Date(record.date);
      return (
        <div className="flex flex-col">
          <span className="font-medium">{format(date, "dd MMM yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, "EEEE")}
          </span>
        </div>
      );
    },
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
    key: "overtimeHours",
    label: "Extra Hours",
    render: (record) =>
      record.overtimeHours > 0 ? formatHoursToTime(record.overtimeHours) : "-",
  },
  {
    key: "status",
    label: "Status",
    render: (record) => <StatusBadge status={record.status} />,
  },
];

export function EmployeeAttendanceView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const month = selectedDate.getUTCMonth() + 1;
  const year = selectedDate.getUTCFullYear();

  const {
    data: attendanceData,
    isLoading,
    error,
  } = useMyAttendance(month, year);

  if (error) {
    toast.error("Failed to load attendance records");
  }

  // Group sessions by date and create attendance records
  const attendanceRecords = useMemo(() => {
    if (!attendanceData) return [];

    const { sessions, leaves, summary } = attendanceData;

    // Create a set of leave dates
    const leaveDateSet = new Set<string>();
    leaves.forEach((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (
        let d = new Date(start);
        d <= end;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        leaveDateSet.add(d.toISOString());
      }
    });

    // Group sessions by date
    const sessionsByDate = sessions.reduce((acc, session) => {
      const dateKey = session.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
      return acc;
    }, {} as Record<string, WorkSessionInfo[]>);

    // Generate all dates in the month (excluding weekends and future dates)
    const startDate = new Date(Date.UTC(summary.year, summary.month - 1, 1));
    const endDate = new Date(Date.UTC(summary.year, summary.month, 0));
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999); // Include today

    const records: AttendanceRecord[] = [];

    for (
      let d = new Date(startDate);
      d <= endDate && d <= today;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const currentDate = new Date(d);
      const dayOfWeek = currentDate.getUTCDay();
      const dateKey = currentDate.toISOString();

      // Skip weekends (Sunday = 0, Saturday = 6)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      const daySessions = sessionsByDate[dateKey] || [];
      const isOnLeave = leaveDateSet.has(dateKey);

      if (daySessions.length > 0) {
        const sortedSessions = daySessions.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        const totalWorkingHours = sortedSessions.reduce(
          (sum, s) => sum + s.workingHours,
          0
        );
        const totalOvertimeHours = sortedSessions.reduce(
          (sum, s) => sum + s.overtimeHours,
          0
        );

        const checkIn = sortedSessions[0]?.startTime || null;
        const lastSession = sortedSessions[sortedSessions.length - 1];
        const checkOut = lastSession?.endTime || null;

        records.push({
          id: dateKey,
          date: dateKey,
          checkIn,
          checkOut,
          workingHours: totalWorkingHours,
          overtimeHours: totalOvertimeHours,
          status: isOnLeave ? "ON_LEAVE" : "PRESENT",
          sessions: sortedSessions,
        });
      } else if (isOnLeave) {
        records.push({
          id: dateKey,
          date: dateKey,
          checkIn: null,
          checkOut: null,
          workingHours: 0,
          overtimeHours: 0,
          status: "ON_LEAVE",
          sessions: [],
        });
      } else {
        records.push({
          id: dateKey,
          date: dateKey,
          checkIn: null,
          checkOut: null,
          workingHours: 0,
          overtimeHours: 0,
          status: "ABSENT",
          sessions: [],
        });
      }
    }

    return records;
  }, [attendanceData]);

  const toggleRow = (recordId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setUTCMonth(newDate.getUTCMonth() - 1);
    setSelectedDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setUTCMonth(newDate.getUTCMonth() + 1);
    setSelectedDate(newDate);
  };

  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  const isCurrentMonth =
    selectedDate.getUTCMonth() === new Date().getUTCMonth() &&
    selectedDate.getUTCFullYear() === new Date().getUTCFullYear();

  const summary = attendanceData?.summary;

  // No filtering needed now as we already exclude weekends and future dates
  const filteredAttendances = attendanceRecords;

  const statsData: StatItem[] = [
    {
      name: "Days Present",
      value: summary?.totalPresentDays || 0,
      description: `Out of ${summary?.totalWorkingDays || 0} working days`,
      valueClassName: "text-green-600",
    },
    {
      name: "Leaves Count",
      value: summary?.totalLeaveDays || 0,
      description: "Days on leave",
      valueClassName: "text-amber-600",
    },
    {
      name: "Total Working Hours",
      value: summary?.totalWorkingHours
        ? formatHoursToTime(summary.totalWorkingHours)
        : "0h",
      description: "Hours worked this month",
      valueClassName: "text-blue-600",
    },
    {
      name: "Absent Days",
      value: summary?.totalAbsentDays || 0,
      description: "Days absent",
      valueClassName: "text-red-600",
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "min-w-[200px] justify-center font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "MMMM yyyy")
                ) : (
                  <span>Pick a month</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                className="rounded-md border shadow-sm"
                captionLayout="dropdown"
                selected={selectedDate}
                onSelect={(date: Date | undefined) =>
                  date && setSelectedDate(date)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isCurrentMonth && (
            <Button variant="outline" onClick={goToCurrentMonth}>
              Current Month
            </Button>
          )}
        </div>
      </div>

      <StatsCards data={statsData} />

      <div className="rounded-lg">
        <div className="py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Attendance Records</h2>
          <span className="text-sm text-muted-foreground">
            {format(selectedDate, "MMMM yyyy")} - {filteredAttendances.length}{" "}
            {filteredAttendances.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="border rounded-lg">
          <DataTable
            data={filteredAttendances}
            columns={attendanceColumns(expandedRows, toggleRow)}
            keyExtractor={(record) => record.id}
            emptyMessage="No attendance records found"
            isLoading={isLoading}
            loadingMessage="Loading attendance..."
            expandedRows={expandedRows}
            expandedContent={(record) => {
              if (!record.sessions || record.sessions.length === 0) {
                return null;
              }
              return (
                <WorkSessionsDisplay
                  sessions={record.sessions}
                  title={`Work Sessions for ${format(
                    new Date(record.date),
                    "dd MMM yyyy"
                  )}`}
                />
              );
            }}
          />
        </div>
      </div>
    </>
  );
}
