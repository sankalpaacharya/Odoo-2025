"use client";

import { Plus } from "lucide-react";
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
  formatLeaveType,
  formatLeaveStatus,
  getStatusColor,
  formatDate,
} from "../utils";
import type { Leave, LeaveBalance } from "../types";

const mockLeaveBalances: LeaveBalance[] = [
  { id: "1", leaveType: "CASUAL", allocated: 12, used: 3, remaining: 9 },
  { id: "2", leaveType: "SICK", allocated: 7, used: 2, remaining: 5 },
  { id: "3", leaveType: "EARNED", allocated: 15, used: 0, remaining: 15 },
];

const mockLeaves: Leave[] = [
  {
    id: "1",
    employeeId: "emp1",
    leaveType: "CASUAL",
    startDate: "2025-10-15",
    endDate: "2025-10-17",
    totalDays: 3,
    reason: "Family function",
    status: "APPROVED",
    approvedBy: "HR001",
    approvedAt: "2025-10-10T10:30:00Z",
    rejectionReason: null,
    createdAt: "2025-10-08T09:00:00Z",
  },
  {
    id: "2",
    employeeId: "emp1",
    leaveType: "SICK",
    startDate: "2025-09-20",
    endDate: "2025-09-21",
    totalDays: 2,
    reason: "Fever and cold",
    status: "APPROVED",
    approvedBy: "HR001",
    approvedAt: "2025-09-19T15:00:00Z",
    rejectionReason: null,
    createdAt: "2025-09-19T08:30:00Z",
  },
  {
    id: "3",
    employeeId: "emp1",
    leaveType: "CASUAL",
    startDate: "2025-11-25",
    endDate: "2025-11-27",
    totalDays: 3,
    reason: "Personal work",
    status: "PENDING",
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    createdAt: "2025-11-05T10:00:00Z",
  },
];

export function EmployeeTimeOffView() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Leave Balance</h2>
          <p className="text-sm text-muted-foreground">
            Your available leave balances for 2025
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {mockLeaveBalances.map((balance) => (
          <Card key={balance.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {formatLeaveType(balance.leaveType)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Allocated
                  </span>
                  <span className="text-sm font-medium">
                    {balance.allocated} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Used</span>
                  <span className="text-sm font-medium text-amber-600">
                    {balance.used} days
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-medium">Remaining</span>
                  <span className="text-xl font-bold text-green-600">
                    {balance.remaining}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLeaves.length > 0 ? (
                mockLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {formatLeaveType(leave.leaveType)}
                    </TableCell>
                    <TableCell>{formatDate(leave.startDate)}</TableCell>
                    <TableCell>{formatDate(leave.endDate)}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {leave.reason}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(leave.status)}>
                        {formatLeaveStatus(leave.status)}
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
                    No leave requests found
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
