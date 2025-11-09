"use client";

import { useState } from "react";
import { Search, Check, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge, EmployeeAvatar } from "@/components/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatLeaveType, formatDate } from "../utils";
import { TimeOffRequestDialog } from "./time-off-request-dialog";
import { LeaveDetailsDialog } from "./leave-details-dialog";
import { ApprovalDialog } from "./approval-dialog";
import { useAllLeaves } from "../hooks";
import type { Leave } from "../types";
import Loader from "@/components/loader";
import { StatsCards, type StatItem } from "@/components";
import { useAbility } from "@/components/ability-provider";

const createLeaveColumns = (
  onApprove: (leave: Leave, e: React.MouseEvent) => void,
  onReject: (leave: Leave, e: React.MouseEvent) => void,
  canApprove: boolean
): Column<Leave>[] => [
  {
    key: "avatar",
    sortable: false,
    render: (leave) => (
      <EmployeeAvatar name={leave.employeeName || ""} size="sm" />
    ),
    className: "w-12",
  },
  {
    key: "employeeName",
    label: "Name",
    className: "font-medium",
  },
  {
    key: "employeeCode",
    label: "Employee ID",
    className: "font-medium",
  },
  {
    key: "department",
    label: "Department",
  },
  {
    key: "leaveType",
    label: "Leave Type",
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
    key: "status",
    label: "Status",
    render: (leave) => <StatusBadge status={leave.status} />,
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    render: (leave) =>
      leave.status === "PENDING" && canApprove ? (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="default"
            onClick={(e) => onApprove(leave, e)}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => onReject(leave, e)}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      ),
  },
];

export function AdminTimeOffView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newLeaveDialogOpen, setNewLeaveDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve"
  );

  const ability = useAbility();
  const canApprove = ability.can("Approve", "Time Off");
  const canCreate = ability.can("Create", "Time Off");

  const { data: leavesData, isLoading } = useAllLeaves({
    status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
  });

  const handleApprove = (leave: Leave, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeave(leave);
    setApprovalAction("approve");
    setApprovalDialogOpen(true);
  };

  const handleReject = (leave: Leave, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeave(leave);
    setApprovalAction("reject");
    setApprovalDialogOpen(true);
  };

  const handleRowClick = (leave: Leave) => {
    setSelectedLeave(leave);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return <Loader />;
  }

  const leaves = leavesData?.leaves || [];

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      leave.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.department?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;
  const totalRequests = leaves.length;

  const statsData: StatItem[] = [
    {
      name: "Total Requests",
      value: totalRequests,
      description: "All time off requests",
    },
    {
      name: "Pending Approval",
      value: pendingCount,
      description: "Awaiting your review",
      valueClassName: "text-amber-600",
    },
    {
      name: "Approved",
      value: approvedCount,
      description: "Approved requests",
      valueClassName: "text-green-600",
    },
    {
      name: "Rejected",
      value: rejectedCount,
      description: "Rejected requests",
      valueClassName: "text-red-600",
    },
  ];

  const leaveColumns = createLeaveColumns(
    handleApprove,
    handleReject,
    canApprove
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canCreate && (
          <Button onClick={() => setNewLeaveDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        )}
      </div>

      <StatsCards data={statsData} />

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">All Leave Requests</h2>
        </div>
        <DataTable
          data={filteredLeaves}
          columns={leaveColumns}
          keyExtractor={(leave) => leave.id}
          emptyMessage="No leave requests found"
          isLoading={isLoading}
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

      <ApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        leave={selectedLeave}
        action={approvalAction}
      />
    </>
  );
}
