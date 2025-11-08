"use client";

import { useState } from "react";
import { Calendar, Upload, X } from "lucide-react";
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
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allocation, setAllocation] = useState("");
  const [note, setNote] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSubmit = () => {
    console.log({
      selectedEmployee,
      leaveType,
      startDate,
      endDate,
      allocation,
      note,
      attachment,
    });
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
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
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger id="employee">
                <SelectValue placeholder="[Employee]" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emp1">John Doe</SelectItem>
                <SelectItem value="emp2">Jane Smith</SelectItem>
                <SelectItem value="emp3">Bob Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-type">Time off Type</Label>
            <Select
              value={leaveType}
              onValueChange={(value) => setLeaveType(value as LeaveType)}
            >
              <SelectTrigger id="leave-type">
                <SelectValue placeholder="[Paid time off]" />
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
              <Label htmlFor="start-date">Validity Period</Label>
              <div className="relative">
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="May 13"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-transparent">
                To
              </Label>
              <div className="relative">
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="May 14"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allocation">Allocation</Label>
            <div className="flex items-center gap-2">
              <Input
                id="allocation"
                type="number"
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                placeholder="01.00"
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">Days</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachment</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              {attachment && (
                <span className="text-sm text-muted-foreground truncate">
                  {attachment.name}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                (For sick leave certificate)
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              Submit
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Discard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
