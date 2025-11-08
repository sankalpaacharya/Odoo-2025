"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock } from "lucide-react";

const recentLeaves = [
  {
    id: 1,
    name: "Sarah Johnson",
    initials: "SJ",
    type: "Sick Leave",
    startDate: "Nov 12, 2025",
    duration: "2 days",
    status: "pending",
  },
  {
    id: 2,
    name: "Michael Chen",
    initials: "MC",
    type: "Vacation",
    startDate: "Nov 15, 2025",
    duration: "5 days",
    status: "pending",
  },
  {
    id: 3,
    name: "Emily Davis",
    initials: "ED",
    type: "Personal",
    startDate: "Nov 10, 2025",
    duration: "1 day",
    status: "pending",
  },
  {
    id: 4,
    name: "James Wilson",
    initials: "JW",
    type: "Emergency",
    startDate: "Nov 13, 2025",
    duration: "3 days",
    status: "pending",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    initials: "LA",
    type: "Sick Leave",
    startDate: "Nov 14, 2025",
    duration: "1 day",
    status: "pending",
  },
];

export function RecentLeaveRequests() {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Leave Requests</CardTitle>
        <CardDescription>
          Latest pending leave applications requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-3">
          {recentLeaves.map((leave) => (
            <div
              key={leave.id}
              className="flex items-center justify-between gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="shrink-0">
                  <AvatarFallback>{leave.initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium leading-none truncate">
                    {leave.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {leave.type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3" />
                  {leave.startDate}
                </div>
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  {leave.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
