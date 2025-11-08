"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge, EmployeeAvatar } from "@/components/status-badge";
import { formatLeaveType, formatDate } from "../utils";
import { TimeOffRequestDialog } from "./time-off-request-dialog";
import { LeaveDetailsDialog } from "./leave-details-dialog";
import { useMyLeaves, useMyLeaveBalances } from "../hooks";
import type { Leave } from "../types";
import Loader from "@/components/loader";

const leaveColumns: Column<Leave>[] = [
  {
    key: "leaveType",
    label: "Leave Type",
    className: "font-medium",
    render: (leave) => formatLeaveType(leave.leaveType),
  },
  {
    key: "startDate",
    label: "Start Date",
    render: (leave) => formatDate(leave.startDate),
  },
  {
    key: "endDate",
    label: "End Date",
    render: (leave) => formatDate(leave.endDate),
  },
  {
    key: "totalDays",
    label: "Days",
  },
  {
    key: "reason",
    label: "Reason",
    className: "max-w-[200px] truncate",
  },
  {
    key: "status",
    label: "Status",
    render: (leave) => <StatusBadge status={leave.status} />,
  },
];

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

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">My Leave Requests</h2>
        </div>
        <DataTable
          data={leaves || []}
          columns={leaveColumns}
          keyExtractor={(leave) => leave.id}
          emptyMessage="No leave requests found"
          isLoading={isLoadingLeaves}
          loadingMessage="Loading leave requests..."
        />
      </div>

      <TimeOffRequestDialog
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
