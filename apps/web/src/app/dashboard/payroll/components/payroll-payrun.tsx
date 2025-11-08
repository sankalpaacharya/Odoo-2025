"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
}

interface Payslip {
  id: string;
  employeeId: string;
  employee: Employee;
  month: number;
  year: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  basicSalary: number;
  grossSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  pfDeduction: number;
  professionalTax: number;
  otherDeductions: number;
  status: "PENDING" | "PROCESSED" | "PAID" | "CANCELLED";
  paidAt: string | null;
}

interface Payrun {
  id: string;
  month: number;
  year: number;
  periodStart: string;
  periodEnd: string;
  status: "DRAFT" | "PROCESSING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  processedBy: string | null;
  processedAt: string | null;
  payslips: Payslip[];
}

export function PayrollPayrun() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [payrun, setPayrun] = useState<Payrun | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();

  useEffect(() => {
    generatePayrun();
  }, [selectedMonth, selectedYear]);

  const generatePayrun = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<Payrun>("/api/payroll/payrun/generate", {
        method: "POST",
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
        }),
      });
      setPayrun(data);
    } catch (error: any) {
      console.error("Error generating payrun:", error);
      toast.error("Failed to generate payrun", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidatePayrun = async () => {
    if (!payrun) return;

    setIsValidating(true);
    try {
      const data = await apiClient<Payrun>(
        `/api/payroll/payrun/${payrun.id}/validate`,
        {
          method: "POST",
        }
      );
      setPayrun(data);
      toast.success("Payrun validated successfully");
    } catch (error: any) {
      console.error("Error validating payrun:", error);
      toast.error("Failed to validate payrun", {
        description: error.message,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleMarkAsDone = async () => {
    if (!payrun) return;

    setIsMarkingDone(true);
    try {
      const data = await apiClient<Payrun>(
        `/api/payroll/payrun/${payrun.id}/done`,
        {
          method: "POST",
        }
      );
      setPayrun(data);
      toast.success("Payrun marked as done");
    } catch (error: any) {
      console.error("Error marking payrun as done:", error);
      toast.error("Failed to mark payrun as done", {
        description: error.message,
      });
    } finally {
      setIsMarkingDone(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const payslips = payrun?.payslips || [];
  const totalEmployerCost = payslips.reduce(
    (sum, p) => sum + Number(p.grossSalary),
    0
  );
  const totalGrossWage = payslips.reduce(
    (sum, p) => sum + Number(p.grossSalary),
    0
  );
  const totalNetWage = payslips.reduce(
    (sum, p) => sum + Number(p.netSalary),
    0
  );

  const isDone = payrun?.status === "COMPLETED";
  const isProcessing = payrun?.status === "PROCESSING";
  const isDraft = payrun?.status === "DRAFT";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Pay Period</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                captionLayout="dropdown"
                fromYear={2020}
                toYear={2030}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleValidatePayrun}
            disabled={isValidating || !payrun || payrun.status !== "DRAFT"}
            variant="outline"
          >
            {isValidating ? "Validating..." : "Validate"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading payrun...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && payrun && payslips.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Payrun {format(selectedDate, "MMMM yyyy")}
                  </CardTitle>
                  <CardDescription>
                    {payslips.length} employee(s)
                  </CardDescription>
                </div>
                {isDone ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="size-3" />
                    Done
                  </Badge>
                ) : isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Validated</Badge>
                    <Button
                      size="sm"
                      onClick={handleMarkAsDone}
                      disabled={isMarkingDone}
                    >
                      {isMarkingDone ? "Processing..." : "Done"}
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Employer Cost</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalEmployerCost)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Gross Wage</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalGrossWage)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Net Wage</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalNetWage)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Period</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Employer Cost</TableHead>
                    <TableHead className="text-right">Basic Wage</TableHead>
                    <TableHead className="text-right">Gross Wage</TableHead>
                    <TableHead className="text-right">Net Wage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-medium">
                        {format(
                          new Date(payslip.year, payslip.month - 1),
                          "MMM yyyy"
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payslip.employee.firstName}{" "}
                            {payslip.employee.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payslip.employee.employeeCode}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(payslip.grossSalary))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(payslip.basicSalary))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(payslip.grossSalary))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(payslip.netSalary))}
                      </TableCell>
                      <TableCell>
                        {payslip.status === "PAID" && (
                          <Badge variant="success">Done</Badge>
                        )}
                        {payslip.status === "PROCESSED" && (
                          <Badge variant="default">Validated</Badge>
                        )}
                        {payslip.status === "PENDING" && (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {payslip.status === "CANCELLED" && (
                          <Badge variant="destructive">Cancelled</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payroll Definitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Employer Cost:</span>{" "}
            <span className="text-muted-foreground">
              Total monthly wage cost per employee (includes base salary and
              employer contributions)
            </span>
          </div>
          <div>
            <span className="font-medium">Basic Wage:</span>{" "}
            <span className="text-muted-foreground">
              Employee's base salary without any additional allowances
            </span>
          </div>
          <div>
            <span className="font-medium">Gross Wage:</span>{" "}
            <span className="text-muted-foreground">
              Total of basic salary + all allowances (housing, transport, etc.)
            </span>
          </div>
          <div>
            <span className="font-medium">Net Wage:</span>{" "}
            <span className="text-muted-foreground">
              Final amount paid to employee after all deductions (tax, PF, etc.)
            </span>
          </div>
        </CardContent>
      </Card>

      {!isLoading && (!payrun || payslips.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">
              No payslips generated yet for {format(selectedDate, "MMMM yyyy")}
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Payslips are automatically generated based on employee attendance
              and salary structure for the selected month.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
