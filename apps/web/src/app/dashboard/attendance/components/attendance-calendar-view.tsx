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
import type { AttendanceRecord } from "../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AttendanceCalendarViewProps {
  selectedDate: Date;
  attendanceRecords: AttendanceRecord[];
}

export function AttendanceCalendarView({
  selectedDate,
  attendanceRecords,
}: AttendanceCalendarViewProps) {
  const { calendarDays, attendanceMap } = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });

    const firstDayOfWeek = getDay(start);
    const paddingDays = Array(firstDayOfWeek).fill(null);

    const map = new Map<string, AttendanceRecord>();
    attendanceRecords.forEach((record) => {
      const dateKey = new Date(record.date).toISOString().split("T")[0];
      map.set(dateKey, record);
    });

    return {
      calendarDays: [...paddingDays, ...days],
      attendanceMap: map,
    };
  }, [selectedDate, attendanceRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "border-green-500/50 bg-green-50/50 dark:bg-green-950/30";
      case "ABSENT":
        return "border-muted-foreground/30 bg-muted/30";
      case "ON_LEAVE":
        return "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/30";
      default:
        return "border-border bg-muted/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <Badge
            variant="default"
            className="bg-green-600 hover:bg-green-700 text-xs"
          >
            Present
          </Badge>
        );
      case "ABSENT":
        return (
          <Badge variant="outline" className="text-xs">
            Absent
          </Badge>
        );
      case "ON_LEAVE":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
          >
            On Leave
          </Badge>
        );
      default:
        return null;
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full">
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

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateKey = format(day, "yyyy-MM-dd");
          const isoDateKey = new Date(dateKey + "T00:00:00.000Z")
            .toISOString()
            .split("T")[0];
          const record = attendanceMap.get(isoDateKey);
          const isWeekend = getDay(day) === 0 || getDay(day) === 6;
          const isCurrentMonth = isSameMonth(day, selectedDate);

          if (isWeekend || !isCurrentMonth) {
            return (
              <Card key={dateKey} className="aspect-square opacity-50">
                <CardContent className="p-2 h-full">
                  <div className="text-sm font-medium text-muted-foreground">
                    {format(day, "d")}
                  </div>
                </CardContent>
              </Card>
            );
          }

          if (!record) {
            return (
              <Card key={dateKey} className="aspect-square">
                <CardContent className="p-2 h-full">
                  <div className="text-sm font-medium text-muted-foreground">
                    {format(day, "d")}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    No record
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Tooltip key={dateKey} delayDuration={200}>
              <TooltipTrigger asChild>
                <Card
                  className={cn(
                    "aspect-square cursor-pointer hover:shadow-lg transition-all duration-200 border-2",
                    getStatusColor(record.status)
                  )}
                >
                  <CardContent className="p-2 h-full flex flex-col">
                    <div className="text-sm font-semibold mb-1">
                      {format(day, "d")}
                    </div>
                    <div className="flex-1 flex flex-col justify-center items-center gap-1">
                      {getStatusBadge(record.status)}
                      {record.workingHours > 0 && (
                        <div className="text-xs font-medium text-center">
                          {formatHoursToTime(record.workingHours)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3">
                <div className="space-y-2">
                  <div className="font-semibold text-sm">
                    {format(day, "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Status:
                    </span>
                    {getStatusBadge(record.status)}
                  </div>
                  {record.workingHours > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Work Hours:</span>{" "}
                      <span className="font-medium">
                        {formatHoursToTime(record.workingHours)}
                      </span>
                    </div>
                  )}
                  {record.checkIn && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Check In:</span>{" "}
                      <span className="font-medium">
                        {format(new Date(record.checkIn), "h:mm a")}
                      </span>
                    </div>
                  )}
                  {record.checkOut && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Check Out:</span>{" "}
                      <span className="font-medium">
                        {format(new Date(record.checkOut), "h:mm a")}
                      </span>
                    </div>
                  )}
                  {record.sessions && record.sessions.length > 0 && (
                    <div className="text-xs border-t pt-2">
                      <span className="text-muted-foreground">Sessions:</span>{" "}
                      <span className="font-medium">
                        {record.sessions.length}
                      </span>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
