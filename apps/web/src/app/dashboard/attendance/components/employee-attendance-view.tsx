"use client";

import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Loader from "@/components/loader";
import { useMyAttendance } from "../hooks";
import { formatStatus, getStatusColor } from "../utils";
import { formatDate, formatTime, formatHoursToTime } from "@/lib/time-utils";
import { toast } from "sonner";
import type { AttendanceRecord } from "../types";
import { useState } from "react";

interface EmployeeAttendanceViewProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function EmployeeAttendanceView({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: EmployeeAttendanceViewProps) {
  const month = currentMonth.getMonth() + 1;
  const year = currentMonth.getFullYear();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const {
    data: attendanceData,
    isLoading,
    error,
  } = useMyAttendance(month, year);

  if (error) {
    toast.error("Failed to load attendance records");
  }

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

  const attendances = attendanceData?.attendances || [];
  const summary = attendanceData?.summary;

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const totalWorkingDays = summary?.totalWorkingDays || 0;
  const presentDays = summary?.totalPresentDays || 0;
  const halfDays = summary?.totalHalfDays || 0;
  const leaveDays = summary?.totalLeaveDays || 0;
  const totalWorkingHours = summary?.totalWorkingHours || 0;
  const totalOvertimeHours = summary?.totalOvertimeHours || 0;
  const payableDays = presentDays + halfDays * 0.5;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 min-w-[200px] justify-center">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{monthYear}</span>
          </div>
          <Button variant="outline" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Working Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkingDays}</div>
            <p className="text-xs text-muted-foreground">Total days in month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Days Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {presentDays} {halfDays > 0 && `+ ${halfDays} half`}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalWorkingDays > 0
                ? ((presentDays / totalWorkingDays) * 100).toFixed(1)
                : 0}
              % attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{leaveDays}</div>
            <p className="text-xs text-muted-foreground">
              Approved leaves taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Working Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHoursToTime(totalWorkingHours)}
            </div>
            <p className="text-xs text-muted-foreground">Logged this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Overtime Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatHoursToTime(totalOvertimeHours)}
            </div>
            <p className="text-xs text-muted-foreground">Extra hours worked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Payable Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {payableDays.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              For payslip computation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Extra Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.length > 0 ? (
                attendances.map((record: AttendanceRecord) => {
                  const hasSessions =
                    record.sessions && record.sessions.length > 0;
                  const isExpanded = expandedRows.has(record.id);

                  return (
                    <>
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {formatDate(record.date)}
                            {hasSessions && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleRow(record.id)}
                              >
                                <Clock
                                  className={`h-4 w-4 transition-transform ${
                                    isExpanded ? "rotate-90" : ""
                                  }`}
                                />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatTime(record.checkIn)}</TableCell>
                        <TableCell>{formatTime(record.checkOut)}</TableCell>
                        <TableCell>
                          {record.workingHours > 0 ? (
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {formatHoursToTime(record.workingHours)}
                              </span>
                              {hasSessions && record.sessions && (
                                <span className="text-xs text-muted-foreground">
                                  {record.sessions.length} session
                                  {record.sessions.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {record.overtimeHours > 0
                            ? formatHoursToTime(record.overtimeHours)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(record.status)}>
                            {formatStatus(record.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {hasSessions && isExpanded && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/50 p-4">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm">
                                Work Sessions
                              </h4>
                              <div className="space-y-2">
                                {record.sessions?.map((session, idx) => (
                                  <div
                                    key={session.id}
                                    className="flex items-center justify-between p-3 bg-background rounded-md border"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">
                                          Session {idx + 1}
                                        </span>
                                        {session.isActive && (
                                          <Badge
                                            variant="default"
                                            className="text-xs"
                                          >
                                            Active
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex gap-2 text-sm">
                                        <span>
                                          {formatTime(session.startTime)}
                                        </span>
                                        <span>→</span>
                                        <span>
                                          {session.endTime
                                            ? formatTime(session.endTime)
                                            : "In Progress"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      {session.totalBreakTime > 0 && (
                                        <span className="text-xs text-muted-foreground">
                                          Break:{" "}
                                          {formatHoursToTime(
                                            session.totalBreakTime
                                          )}
                                        </span>
                                      )}
                                      <span className="font-semibold text-primary">
                                        {session.durationFormatted}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No attendance records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
