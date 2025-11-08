"use client";

import { X, Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatLeaveType,
  formatLeaveStatus,
  getStatusColor,
  formatDate,
} from "../utils";
import type { Leave } from "../types";

interface LeaveDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: Leave | null;
}

export function LeaveDetailsDialog({
  open,
  onOpenChange,
  leave,
}: LeaveDetailsDialogProps) {
  if (!leave) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Time off Type Request</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Employee</div>
              <div className="text-sm font-medium text-primary">
                {leave.employeeName || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <Badge variant={getStatusColor(leave.status)}>
                {formatLeaveStatus(leave.status)}
              </Badge>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Time off Type
            </div>
            <div className="text-sm font-medium text-primary">
              {formatLeaveType(leave.leaveType)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Start Date
              </div>
              <div className="text-sm font-medium">
                {formatDate(leave.startDate)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">End Date</div>
              <div className="text-sm font-medium">
                {formatDate(leave.endDate)}
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Allocation</div>
            <div className="text-sm font-medium">
              {leave.totalDays.toFixed(2)} Days
            </div>
          </div>

          {leave.reason && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">Reason</div>
              <div className="text-sm">{leave.reason}</div>
            </div>
          )}

          {leave.attachment && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Attachment
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leaves/attachment/${leave.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                <span>{leave.attachment}</span>
                <Download className="h-3 w-3" />
              </a>
            </div>
          )}

          {leave.status === "REJECTED" && leave.rejectionReason && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Rejection Reason
              </div>
              <div className="text-sm text-red-600">
                {leave.rejectionReason}
              </div>
            </div>
          )}

          {leave.approvedBy && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Approved By
              </div>
              <div className="text-sm">{leave.approvedBy}</div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
