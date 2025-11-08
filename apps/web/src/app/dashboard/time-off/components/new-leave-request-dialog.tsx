"use client";

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatLeaveType } from "../utils";
import { useCreateLeaveRequest } from "../hooks";
import { useEmployee } from "@/lib/employee-context";
import { toast } from "sonner";
import type { LeaveType } from "../types";

interface NewLeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const leaveTypes: LeaveType[] = [
  "CASUAL",
  "SICK",
  "EARNED",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "COMPENSATORY",
];

export function NewLeaveRequestDialog({
  open,
  onOpenChange,
}: NewLeaveRequestDialogProps) {
  const { isAdmin } = useEmployee();
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const createLeave = useCreateLeaveRequest();

  const handleSubmit = async () => {
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isAdmin && !employeeId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      await createLeave.mutateAsync({
        employeeId: isAdmin ? employeeId : undefined,
        leaveType,
        startDate,
        endDate,
        reason,
      });

      toast.success("Leave request created successfully");
      setEmployeeId("");
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create leave request"
      );
    }
  };

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
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="employee">Employee ID</Label>
              <Input
                id="employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee ID"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to create for yourself
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="leave-type">Time off Type *</Label>
            <Select
              value={leaveType}
              onValueChange={(value) => setLeaveType(value as LeaveType)}
            >
              <SelectTrigger id="leave-type">
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatLeaveType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <div className="relative">
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date *</Label>
              <div className="relative">
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for leave..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createLeave.isPending}
              className="flex-1"
            >
              {createLeave.isPending ? "Submitting..." : "Submit"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createLeave.isPending}
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
