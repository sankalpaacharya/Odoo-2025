"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  addDays,
  startOfWeek,
  endOfWeek,
  nextMonday,
  isWeekend,
  format,
  addBusinessDays,
} from "date-fns";
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

interface TimeOffFormData {
  employeeId?: string;
  timeOffType: string;
  startDate: string;
  endDate: string;
  reason: string;
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

const timeOffSchema = yup.object({
  employeeId: yup.string().optional(),
  timeOffType: yup.string().required("Time off type is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup
    .string()
    .required("End date is required")
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) >= new Date(startDate);
      }
    ),
  reason: yup
    .string()
    .required("Reason is required")
    .min(10, "Reason must be at least 10 characters"),
});

export function TimeOffRequestDialog({
  open,
  onOpenChange,
}: TimeOffRequestDialogProps) {
  const { isAdmin } = useEmployee();
  const createTimeOff = useCreateLeaveRequest();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TimeOffFormData>({
    resolver: yupResolver(timeOffSchema) as any,
    defaultValues: {
      employeeId: "",
      timeOffType: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const getNextBusinessDay = (date: Date): Date => {
    let nextDay = new Date(date);
    if (isWeekend(nextDay)) {
      nextDay = addDays(nextDay, nextDay.getDay() === 6 ? 2 : 1);
    }
    return nextDay;
  };

  const setQuickDate = (option: string) => {
    const today = new Date();
    let start: Date;
    let end: Date;

    switch (option) {
      case "today":
        start = today;
        end = start;
        break;
      case "tomorrow":
        start = addDays(today, 1);
        end = start;
        break;
      case "next-3":
        start = getNextBusinessDay(today);
        end = addBusinessDays(start, 2);
        break;
      case "next-week":
        const monday = nextMonday(today);
        start = monday;
        end = addDays(monday, 4);
        break;

      default:
        start = today;
        end = today;
    }

    setValue("startDate", format(start, "yyyy-MM-dd"));
    setValue("endDate", format(end, "yyyy-MM-dd"));
  };

  const onSubmit = async (data: TimeOffFormData) => {
    if (isAdmin && !data.employeeId) {
      toast.error("Please select an employee");
      return;
    }

    try {
      const response = await createTimeOff.mutateAsync({
        employeeId: isAdmin ? data.employeeId : undefined,
        leaveType: data.timeOffType as LeaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      });

      if ((response as any).warning) {
        toast.warning((response as any).warning, {
          duration: 5000,
        });
      } else {
        toast.success("Time off request created successfully");
      }

      reset();
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
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee ID</Label>
                  <Input
                    id="employee"
                    {...field}
                    placeholder="Enter employee ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to create for yourself
                  </p>
                </div>
              )}
            />
          )}

          <Controller
            name="timeOffType"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="time-off-type">Time Off Type *</Label>
                <Select value={field.value} onValueChange={field.onChange}>
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
                {errors.timeOffType && (
                  <p className="text-xs text-red-500">
                    {errors.timeOffType.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="space-y-3">
            <Label>Quick Date Selection</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate("today")}
                className="text-xs"
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate("tomorrow")}
                className="text-xs"
              >
                Tomorrow
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate("next-3")}
                className="text-xs"
              >
                Next 3 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuickDate("next-week")}
                className="text-xs"
              >
                Next Week
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date *</Label>
                  <div className="relative">
                    <Input id="start-date" type="date" {...field} />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.startDate && (
                    <p className="text-xs text-red-500">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date *</Label>
                  <div className="relative">
                    <Input id="end-date" type="date" {...field} />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.endDate && (
                    <p className="text-xs text-red-500">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <Controller
            name="reason"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  {...field}
                  placeholder="Explain the reason for time off..."
                  className="min-h-[80px] resize-none"
                />
                {errors.reason && (
                  <p className="text-xs text-red-500">
                    {errors.reason.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || createTimeOff.isPending}
              className="flex-1"
            >
              {isSubmitting || createTimeOff.isPending
                ? "Submitting..."
                : "Submit"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || createTimeOff.isPending}
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
