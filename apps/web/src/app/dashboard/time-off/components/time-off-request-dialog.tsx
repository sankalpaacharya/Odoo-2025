"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  addDays,
  nextMonday,
  isWeekend,
  format,
  addBusinessDays,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  X,
  ChevronsUpDown,
  Check,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatLeaveType } from "../utils";
import { useCreateLeaveRequest, useActiveEmployees } from "../hooks";
import { useEmployee } from "@/lib/employee-context";
import { toast } from "sonner";
import type { LeaveType } from "../types";

interface TimeOffRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TimeOffFormData {
  employeeId: string;
  timeOffType: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  reason: string;
  attachment?: FileList;
}

const timeOffTypes: LeaveType[] = [
  "PAID_TIME_OFF",
  "SICK_LEAVE",
  "UNPAID_LEAVE",
];

const timeOffSchema = yup.object({
  employeeId: yup.string().required("Employee is required"),
  timeOffType: yup.string().required("Time off type is required"),
  startDate: yup
    .date()
    .required("Start date is required")
    .typeError("Start date is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .typeError("End date is required")
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return value >= startDate;
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
  const { isAdmin, employee } = useEmployee();
  const createTimeOff = useCreateLeaveRequest();
  const { data: employees, isLoading: isLoadingEmployees } =
    useActiveEmployees();

  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

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
      startDate: undefined,
      endDate: undefined,
      reason: "",
    },
  });

  const selectedEmployeeId = watch("employeeId");

  useEffect(() => {
    if (open && employee?.id) {
      setValue("employeeId", employee.id);
    }
  }, [open, employee, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
      setEmployeeSearchQuery("");
    }
  }, [open, reset]);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    if (!employeeSearchQuery) return employees;

    const query = employeeSearchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
    );
  }, [employees, employeeSearchQuery]);

  const selectedEmployee = useMemo(() => {
    return employees?.find((emp) => emp.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

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
        end = today;
        break;
      case "tomorrow":
        start = addDays(today, 1);
        end = addDays(today, 1);
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

    setValue("startDate", start, { shouldValidate: true });
    setValue("endDate", end, { shouldValidate: true });
  };

  const onSubmit = async (data: TimeOffFormData) => {
    try {
      if (!data.startDate || !data.endDate) {
        toast.error("Please select start and end dates");
        return;
      }

      const response = await createTimeOff.mutateAsync({
        employeeId: isAdmin ? data.employeeId : undefined,
        leaveType: data.timeOffType as LeaveType,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        reason: data.reason,
        attachment: data.attachment?.[0],
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
          <Controller
            name="employeeId"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor="employee">
                  Employee *{" "}
                  {!isAdmin && (
                    <span className="text-xs text-muted-foreground font-normal">
                      (You)
                    </span>
                  )}
                </Label>
                {isAdmin ? (
                  <Popover
                    open={employeeSearchOpen}
                    onOpenChange={setEmployeeSearchOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={employeeSearchOpen}
                        className="w-full justify-between"
                        disabled={isLoadingEmployees}
                      >
                        {selectedEmployee ? (
                          <span className="truncate">
                            {selectedEmployee.name} (
                            {selectedEmployee.employeeCode})
                          </span>
                        ) : (
                          "Select employee..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <div className="flex flex-col gap-2 p-2">
                        <Input
                          placeholder="Search employee..."
                          value={employeeSearchQuery}
                          onChange={(e) =>
                            setEmployeeSearchQuery(e.target.value)
                          }
                          className="h-9"
                        />
                        <div className="max-h-[300px] overflow-y-auto">
                          {filteredEmployees.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No employee found.
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              {filteredEmployees.map((emp) => (
                                <button
                                  key={emp.id}
                                  onClick={() => {
                                    field.onChange(emp.id);
                                    setEmployeeSearchOpen(false);
                                    setEmployeeSearchQuery("");
                                  }}
                                  className={cn(
                                    "flex flex-col items-start gap-1 rounded-sm px-2 py-2 text-sm hover:bg-accent",
                                    selectedEmployeeId === emp.id && "bg-accent"
                                  )}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <Check
                                      className={cn(
                                        "h-4 w-4",
                                        selectedEmployeeId === emp.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span className="font-medium">
                                      {emp.name}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground pl-6">
                                    {emp.employeeCode} • {emp.department} •{" "}
                                    {emp.designation}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Input
                    id="employee"
                    value={
                      selectedEmployee
                        ? `${selectedEmployee.name} (${selectedEmployee.employeeCode})`
                        : ""
                    }
                    disabled
                    className="bg-muted"
                  />
                )}
                {errors.employeeId && (
                  <p className="text-xs text-red-500">
                    {errors.employeeId.message}
                  </p>
                )}
              </div>
            )}
          />

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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = watch("startDate");
                          const today = new Date(
                            new Date().setHours(0, 0, 0, 0)
                          );
                          if (startDate) {
                            return date < startDate || date < today;
                          }
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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

          <Controller
            name="attachment"
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className="space-y-2">
                <Label htmlFor="attachment">
                  Attachment{" "}
                  <span className="text-muted-foreground text-xs">
                    (Optional)
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="attachment"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                    onChange={(e) => onChange(e.target.files)}
                    {...field}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {value && value.length > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    {value[0].name} ({(value[0].size / 1024).toFixed(2)} KB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Accepted formats: JPEG, PNG, PDF, DOC, DOCX (Max 5MB)
                </p>
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
