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

interface TimeOffRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeOffTypes: LeaveType[] = [
  "CASUAL",
  "SICK",
  "EARNED",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "COMPENSATORY",
];

export function TimeOffRequestDialog({
  open,
  onOpenChange,
}: TimeOffRequestDialogProps) {
  const { isAdmin } = useEmployee();
  const [employeeId, setEmployeeId] = useState("");
  const [timeOffType, setTimeOffType] = useState<LeaveType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const createTimeOff = useCreateLeaveRequest();

  const setQuickDate = (daysFromToday: number) => {
    const today = new Date();
    const start = new Date(today);
    const end = new Date(today);
    end.setDate(end.getDate() + daysFromToday);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const handleSubmit = async () => {
    if (!timeOffType || !startDate || !endDate || !reason.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isAdmin && !employeeId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      await createTimeOff.mutateAsync({
        employeeId: isAdmin ? employeeId : undefined,
        leaveType: timeOffType,
        startDate,
        endDate,
        reason,
      });

      toast.success("Time off request created successfully");
      setEmployeeId("");
      setTimeOffType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create time off request"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Time Off Request</DialogTitle>
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
            <Label htmlFor="time-off-type">Time Off Type *</Label>
            <Select
              value={timeOffType}
              onValueChange={(value) => setTimeOffType(value as LeaveType)}
            >
              <SelectTrigger id="time-off-type">
                <SelectValue placeholder="Select time off type" />
              </SelectTrigger>
              <SelectContent>
                {timeOffTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {formatLeaveType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Quick Date Selection</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(0)}
                className="text-xs"
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(1)}
                className="text-xs"
              >
                Tomorrow
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(2)}
                className="text-xs"
              >
                Next 3 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(4)}
                className="text-xs"
              >
                Next 5 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate(6)}
                className="text-xs"
              >
                Next Week
              </Button>
            </div>
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
              placeholder="Explain the reason for time off..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={createTimeOff.isPending}
              className="flex-1"
            >
              {createTimeOff.isPending ? "Submitting..." : "Submit"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTimeOff.isPending}
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
