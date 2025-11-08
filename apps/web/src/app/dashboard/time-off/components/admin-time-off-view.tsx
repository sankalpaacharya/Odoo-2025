"use client";

import { useState } from "react";
import { Search, Check, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatLeaveType,
  formatLeaveStatus,
  getStatusColor,
  formatDate,
} from "../utils";
import { NewLeaveRequestDialog } from "./new-leave-request-dialog";
import { LeaveDetailsDialog } from "./leave-details-dialog";
import { ApprovalDialog } from "./approval-dialog";
import type { Leave } from "../types";

const mockLeaves: Leave[] = [
  {
    id: "1",
    employeeId: "emp1",
    employeeName: "John Doe",
    employeeCode: "EMP001",
    department: "Engineering",
    leaveType: "CASUAL",
    startDate: "2025-11-15",
    endDate: "2025-11-17",
    totalDays: 3,
    reason: "Family function",
    status: "PENDING",
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    createdAt: "2025-11-08T09:00:00Z",
  },
  {
    id: "2",
    employeeId: "emp2",
    employeeName: "Jane Smith",
    employeeCode: "EMP002",
    department: "Marketing",
    leaveType: "SICK",
    startDate: "2025-11-10",
    endDate: "2025-11-12",
    totalDays: 3,
    reason: "Medical checkup",
    status: "PENDING",
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    createdAt: "2025-11-07T10:30:00Z",
  },
  {
    id: "3",
    employeeId: "emp3",
    employeeName: "Bob Johnson",
    employeeCode: "EMP003",
    department: "Sales",
    leaveType: "EARNED",
    startDate: "2025-10-25",
    endDate: "2025-10-30",
    totalDays: 6,
    reason: "Vacation",
    status: "APPROVED",
    approvedBy: "HR001",
    approvedAt: "2025-10-20T14:00:00Z",
    rejectionReason: null,
    createdAt: "2025-10-15T11:00:00Z",
  },
  {
    id: "4",
    employeeId: "emp4",
    employeeName: "Alice Williams",
    employeeCode: "EMP004",
    department: "HR",
    leaveType: "CASUAL",
    startDate: "2025-11-20",
    endDate: "2025-11-20",
    totalDays: 1,
    reason: "Personal work",
    status: "REJECTED",
    approvedBy: "HR001",
    approvedAt: "2025-11-08T09:30:00Z",
    rejectionReason: "Already too many leaves this month",
    createdAt: "2025-11-06T08:00:00Z",
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

  const filteredLeaves = mockLeaves.filter((leave) => {
    const matchesSearch =
      leave.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      leave.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const pendingCount = mockLeaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = mockLeaves.filter(
    (l) => l.status === "APPROVED"
  ).length;
  const rejectedCount = mockLeaves.filter(
    (l) => l.status === "REJECTED"
  ).length;
  const totalRequests = mockLeaves.length;

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
        <Button onClick={() => setNewLeaveDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              All time off requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedCount}
            </div>
            <p className="text-xs text-muted-foreground">Approved requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedCount}
            </div>
            <p className="text-xs text-muted-foreground">Rejected requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => (
                  <TableRow
                    key={leave.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(leave)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{leave.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {leave.employeeCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{leave.department}</TableCell>
                    <TableCell>{formatLeaveType(leave.leaveType)}</TableCell>
                    <TableCell>{formatDate(leave.startDate)}</TableCell>
                    <TableCell>{formatDate(leave.endDate)}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(leave.status)}>
                        {formatLeaveStatus(leave.status)}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {leave.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => handleApprove(leave, e)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => handleReject(leave, e)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
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

      <ApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        leave={selectedLeave}
        action={approvalAction}
      />
    </>
  );
}
