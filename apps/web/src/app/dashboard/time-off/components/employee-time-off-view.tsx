"use client";

import { useState } from "react";
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
import { NewLeaveRequestDialog } from "./new-leave-request-dialog";
import { LeaveDetailsDialog } from "./leave-details-dialog";
import { useMyLeaves, useMyLeaveBalances } from "../hooks";
import type { Leave } from "../types";
import Loader from "@/components/loader";

export function EmployeeTimeOffView() {
  const [newLeaveDialogOpen, setNewLeaveDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);

  const currentYear = new Date().getFullYear();
  const { data: leaveBalances, isLoading: isLoadingBalances } =
    useMyLeaveBalances(currentYear);
  const { data: leaves, isLoading: isLoadingLeaves } = useMyLeaves();

  const handleRowClick = (leave: Leave) => {
    setSelectedLeave(leave);
    setDetailsDialogOpen(true);
  };

  if (isLoadingBalances || isLoadingLeaves) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Leave Balance</h2>
          <p className="text-sm text-muted-foreground">
            Your available leave balances for {currentYear}
          </p>
        </div>
        <Button onClick={() => setNewLeaveDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {leaveBalances && leaveBalances.length > 0 ? (
          leaveBalances.map((balance) => (
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
          ))
        ) : (
          <Card className="col-span-3">
            <CardContent className="py-8 text-center text-muted-foreground">
              No leave balances found. Contact HR to set up your leave balances.
            </CardContent>
          </Card>
        )}
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
              {leaves && leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow
                    key={leave.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(leave)}
                  >
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

      <NewLeaveRequestDialog
        open={newLeaveDialogOpen}
        onOpenChange={setNewLeaveDialogOpen}
      />

      <LeaveDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        leave={selectedLeave}
      />
    </>
  );
}
