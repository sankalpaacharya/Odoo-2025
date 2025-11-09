"use client";

import { useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  getDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import { formatHoursToTime } from "@/lib/time-utils";
import type { CalendarDayData } from "../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminCalendarViewProps {
  selectedDate: Date;
  calendarData: CalendarDayData[];
}

export function AdminCalendarView({
  selectedDate,
  calendarData,
}: AdminCalendarViewProps) {
  const { calendarDays, dataMap } = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });

    const firstDayOfWeek = getDay(start);
    const paddingDays = Array(firstDayOfWeek).fill(null);

    const map = new Map<string, CalendarDayData>();
    calendarData.forEach((data) => {
      const dateKey = new Date(data.date).toISOString().split("T")[0];
      map.set(dateKey, data);
    });

    return {
      calendarDays: [...paddingDays, ...days],
      dataMap: map,
    };
  }, [selectedDate, calendarData]);

  const getAttendanceRate = (data: CalendarDayData) => {
    return Math.round((data.presentCount / data.totalEmployees) * 100);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "border-l-2 border-l-green-500/50";
    if (rate >= 70) return "border-l-2 border-l-blue-500/50";
    if (rate >= 50) return "border-l-2 border-l-amber-500/50";
    return "border-l-2 border-l-red-500/50";
  };

  const getRateBadgeColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500/15 text-green-700 dark:text-green-400";
    if (rate >= 70) return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
    if (rate >= 50) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    return "bg-red-500/15 text-red-700 dark:text-red-400";
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
      <Card className="mb-4">
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted-foreground font-medium">
              Attendance Rate:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 dark:bg-green-950/50" />
              <span>Excellent (≥90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/50" />
              <span>Good (≥70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/50" />
              <span>Fair (≥50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-red-500 bg-red-50 dark:bg-red-950/50" />
              <span>Low (&lt;50%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3.5">
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="min-h-32" />;
          }

          const dateKey = format(day, "yyyy-MM-dd");
          const isoDateKey = new Date(dateKey + "T00:00:00.000Z")
            .toISOString()
            .split("T")[0];
          const data = dataMap.get(isoDateKey);
          const isWeekend = getDay(day) === 0 || getDay(day) === 6;
          const isCurrentMonth = isSameMonth(day, selectedDate);

          if (isWeekend || !isCurrentMonth) {
            return (
              <div
                key={dateKey}
                className="min-h-32 p-3 rounded-lg border border-border bg-secondary/30 opacity-50"
              >
                <span className="text-sm font-semibold text-muted-foreground">
                  {format(day, "d")}
                </span>
              </div>
            );
          }

          if (!data) {
            return (
              <div
                key={dateKey}
                className="min-h-32 p-3 rounded-lg border border-border bg-secondary/30"
              >
                <div className="text-sm font-semibold text-muted-foreground">
                  {format(day, "d")}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  No data
                </div>
              </div>
            );
          }

          const attendanceRate = getAttendanceRate(data);

          return (
            <Tooltip key={dateKey} delayDuration={200}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "min-h-32 p-3 rounded-lg border shadow-md transition-all duration-200 cursor-pointer"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-base font-semibold text-foreground">
                      {format(day, "d")}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold px-2 py-1 rounded-full",
                        getRateBadgeColor(attendanceRate)
                      )}
                    >
                      {attendanceRate}%
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {data.presentCount}
                        </span>{" "}
                        Present
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {data.absentCount}
                        </span>{" "}
                        Absent
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {data.leaveCount}
                        </span>{" "}
                        Leave
                      </span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3">
                <div className="space-y-3">
                  <div className="font-semibold text-base">
                    {format(day, "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-sm text-muted-foreground">
                          Present
                        </span>
                      </div>
                      <span className="font-semibold text-sm">
                        {data.presentCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-sm text-muted-foreground">
                          Absent
                        </span>
                      </div>
                      <span className="font-semibold text-sm">
                        {data.absentCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span className="text-sm text-muted-foreground">
                          On Leave
                        </span>
                      </div>
                      <span className="font-semibold text-sm">
                        {data.leaveCount}
                      </span>
                    </div>
                  </div>
                  {data.averageHours > 0 && (
                    <div className="pt-2 border-t text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Average Hours
                        </span>
                        <span className="font-semibold">
                          {formatHoursToTime(data.averageHours)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Attendance Rate
                      </span>
                      <span className="font-semibold">{attendanceRate}%</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
