"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Leave } from "../types";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: Leave | null;
  action: "approve" | "reject";
}

export function ApprovalDialog({
  open,
  onOpenChange,
  leave,
  action,
}: ApprovalDialogProps) {
  const [reason, setReason] = useState("");

  if (!leave) return null;

  const handleSubmit = () => {
    console.log({ leaveId: leave.id, action, reason });
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
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
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Employee: </span>
              <span className="font-medium">{leave.employeeName}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Leave Type: </span>
              <span className="font-medium">{leave.leaveType}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Duration: </span>
              <span className="font-medium">{leave.totalDays} days</span>
            </div>
          </div>

          {action === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                className="min-h-[100px] resize-none"
              />
            </div>
          )}

          {action === "approve" && (
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Add any notes..."
                className="min-h-[80px] resize-none"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              variant={action === "approve" ? "default" : "destructive"}
              disabled={action === "reject" && !reason.trim()}
            >
              {action === "approve" ? "Approve" : "Reject"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
