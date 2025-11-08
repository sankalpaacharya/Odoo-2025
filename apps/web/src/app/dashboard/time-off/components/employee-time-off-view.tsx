"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge, EmployeeAvatar } from "@/components/status-badge";
import { formatLeaveType, formatDate } from "../utils";
import { TimeOffRequestDialog } from "./time-off-request-dialog";
import { LeaveDetailsDialog } from "./leave-details-dialog";
import { useMyLeaves } from "../hooks";
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

  const { data: leaves, isLoading: isLoadingLeaves } = useMyLeaves();

  const handleRowClick = (leave: Leave) => {
    setSelectedLeave(leave);
    setDetailsDialogOpen(true);
  };

  if (isLoadingLeaves) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <Button onClick={() => setNewLeaveDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
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
