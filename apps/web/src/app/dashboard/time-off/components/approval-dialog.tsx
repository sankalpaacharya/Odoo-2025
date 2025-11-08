"use client";

import { useState, useEffect } from "react";
import { X, Download, FileText, Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useApproveLeave, useRejectLeave } from "../hooks";
import { formatLeaveType, formatDate } from "../utils";
import { toast } from "sonner";
import type { Leave, LeaveType } from "../types";

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
  const [leaveType, setLeaveType] = useState<LeaveType>("PAID_TIME_OFF");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [totalDays, setTotalDays] = useState(0);

  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  useEffect(() => {
    if (leave) {
      setLeaveType(leave.leaveType);
      setStartDate(new Date(leave.startDate));
      setEndDate(new Date(leave.endDate));
      setTotalDays(leave.totalDays);
      setReason("");
    }
  }, [leave]);

  useEffect(() => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(diffDays);
    }
  }, [startDate, endDate]);

  if (!leave) return null;

  const isImage = (filename: string) => {
    const ext = filename.toLowerCase().split(".").pop();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  const getAttachmentUrl = (filename: string) => {
    return `${process.env.NEXT_PUBLIC_SERVER_URL}/api/leaves/attachment/${filename}`;
  };

  const handleSubmit = async () => {
    if (action === "reject" && !reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    if (action === "approve") {
      if (!startDate || !endDate) {
        toast.error("Please select valid dates");
        return;
      }

      if (endDate < startDate) {
        toast.error("End date must be after start date");
        return;
      }
    }

    try {
      if (action === "approve") {
        await approveLeave.mutateAsync({
          leaveId: leave.id,
          data: {
            note: reason.trim() || undefined,
            leaveType,
            startDate: startDate!.toISOString(),
            endDate: endDate!.toISOString(),
            totalDays,
          } as any,
        });
        toast.success("Leave request approved successfully");
      } else {
        await rejectLeave.mutateAsync({
          leaveId: leave.id,
          data: { rejectionReason: reason },
        });
        toast.success("Leave request rejected successfully");
      }

      setReason("");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${action} leave request`
      );
    }
  };

  const isPending = approveLeave.isPending || rejectLeave.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

            {action === "approve" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select
                    value={leaveType}
                    onValueChange={(value) => setLeaveType(value as LeaveType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID_TIME_OFF">
                        Paid Time Off
                      </SelectItem>
                      <SelectItem value="SICK_LEAVE">Sick Leave</SelectItem>
                      <SelectItem value="UNPAID_LEAVE">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate
                            ? formatDate(startDate.toISOString())
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate
                            ? formatDate(endDate.toISOString())
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) =>
                            startDate ? date < startDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalDays">Total Days</Label>
                  <Input
                    id="totalDays"
                    type="number"
                    value={totalDays}
                    onChange={(e) => setTotalDays(Number(e.target.value))}
                    min={1}
                    step={0.5}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="text-sm">
                  <span className="text-muted-foreground">Leave Type: </span>
                  <span className="font-medium">
                    {formatLeaveType(leave.leaveType)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Duration: </span>
                  <span className="font-medium">{leave.totalDays} days</span>
                </div>
              </>
            )}

            <div className="text-sm">
              <span className="text-muted-foreground">Reason: </span>
              <span>{leave.reason}</span>
            </div>
          </div>

          {leave.attachment && (
            <div className="space-y-2">
              <Label>Attachment</Label>
              {isImage(leave.attachment) ? (
                <div className="border rounded-md overflow-hidden">
                  <img
                    src={getAttachmentUrl(leave.attachment)}
                    alt="Leave attachment"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              ) : (
                <a
                  href={getAttachmentUrl(leave.attachment)}
                  download
                  className="flex items-center gap-2 p-3 border rounded-md hover:bg-accent transition-colors"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">
                    {leave.attachment}
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </div>
          )}

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
              disabled={isPending || (action === "reject" && !reason.trim())}
            >
              {isPending
                ? "Processing..."
                : action === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
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
