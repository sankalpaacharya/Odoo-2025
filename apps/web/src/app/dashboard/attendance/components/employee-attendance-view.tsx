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
import Loader from "@/components/loader";
import { useMyAttendance } from "../hooks";
import { formatStatus, getStatusColor } from "../utils";
import { formatDate, formatTime, formatHoursToTime } from "@/lib/time-utils";
import { toast } from "sonner";
import type { AttendanceRecord } from "../types";
import { useState } from "react";

export function EmployeeAttendanceView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();
  const day = selectedDate.getDate();

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

  const allAttendances = attendanceData?.attendances || [];

  // Filter to show only the selected date
  const selectedDateString = selectedDate.toISOString().split("T")[0];
  const todayRecord = allAttendances.find(
    (record) => record.date.split("T")[0] === selectedDateString
  );

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={getStatusColor(todayRecord?.status || "ABSENT")}
              className="text-lg"
            >
              {formatStatus(todayRecord?.status || "ABSENT")}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Today's attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Check In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(todayRecord?.checkIn || null)}
            </div>
            <p className="text-xs text-muted-foreground">First check-in time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Check Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(todayRecord?.checkOut || null)}
            </div>
            <p className="text-xs text-muted-foreground">Last check-out time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatHoursToTime(todayRecord?.workingHours || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total for today</p>
          </CardContent>
        </Card>
      </div>

      {todayRecord &&
        todayRecord.sessions &&
        todayRecord.sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Work Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayRecord.sessions.map((session, idx) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-md border"
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
                          <span className="text-muted-foreground">Break: </span>
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
            </CardContent>
          </Card>
        )}
    </>
  );
}
