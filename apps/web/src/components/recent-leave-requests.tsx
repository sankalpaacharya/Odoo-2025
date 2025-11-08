"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachment: string | null;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

interface LeavesResponse {
  leaves: Leave[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLeaveType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

export function RecentLeaveRequests() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaves() {
      try {
        const data = await apiClient<LeavesResponse>(
          "/api/leaves/all?limit=5&status=PENDING"
        );
        setLeaves(data.leaves || []);
      } catch (err) {
        console.error("Error fetching leaves:", err);
        setError(err instanceof Error ? err.message : "Failed to load leaves");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaves();
  }, []);

  return (
    <Card className="w-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg">
          Recent Leave Requests
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Latest pending leave applications requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {error}
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No pending leave requests
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 rounded-lg border p-2 sm:p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar className="shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarFallback className="text-xs">
                      {getInitials(leave.employeeName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium leading-none truncate">
                      {leave.employeeName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className="text-[10px] sm:text-xs px-1.5 py-0"
                      >
                        {formatLeaveType(leave.leaveType)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 text-[10px] sm:text-xs text-muted-foreground shrink-0 pl-10 sm:pl-0">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Calendar className="h-3 w-3" />
                    {formatDate(leave.startDate)}
                  </div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {leave.totalDays} {leave.totalDays === 1 ? "day" : "days"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
