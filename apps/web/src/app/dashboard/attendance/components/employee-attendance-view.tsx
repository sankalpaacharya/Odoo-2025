"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
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
import { useMyAttendance } from "../hooks";
import { formatDate, formatTime, formatStatus, getStatusColor } from "../utils";
import type { AttendanceRecord } from "../types";

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

  const { data: attendances = [], isLoading } = useMyAttendance(month, year);

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const totalWorkingDays = attendances.filter(
    (r: AttendanceRecord) => r.status !== "HOLIDAY" && r.status !== "WEEKEND"
  ).length;

  const presentDays = attendances.filter(
    (r: AttendanceRecord) => r.status === "PRESENT" || r.status === "LATE"
  ).length;

  const halfDays = attendances.filter(
    (r: AttendanceRecord) => r.status === "HALF_DAY"
  ).length;

  const leaveDays = attendances.filter(
    (r: AttendanceRecord) => r.status === "ON_LEAVE"
  ).length;

  const totalWorkingHours = attendances.reduce(
    (sum: number, r: AttendanceRecord) => sum + (r.workingHours || 0),
    0
  );

  const totalOvertimeHours = attendances.reduce(
    (sum: number, r: AttendanceRecord) => sum + (r.overtimeHours || 0),
    0
  );

  const payableDays = presentDays + halfDays * 0.5;

  if (isLoading) {
    return <div>Loading...</div>;
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
              {totalWorkingHours.toFixed(1)}h
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
              {totalOvertimeHours.toFixed(1)}h
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
                attendances.map((record: AttendanceRecord) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell>{formatTime(record.checkIn)}</TableCell>
                    <TableCell>{formatTime(record.checkOut)}</TableCell>
                    <TableCell>
                      {record.workingHours > 0
                        ? `${record.workingHours.toFixed(2)}h`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {record.overtimeHours > 0
                        ? `${record.overtimeHours.toFixed(2)}h`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(record.status)}>
                        {formatStatus(record.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
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
