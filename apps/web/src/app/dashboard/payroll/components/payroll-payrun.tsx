"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";
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
  TableFooter,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import { DataTable, type Column } from "@/components/data-table";

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
  totalWorkingDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  leaveDays: number;
  overtimeHours: number;
  basicSalary: number;
  grossSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  pfDeduction: number;
  professionalTax: number;
  lopDeduction: number;
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
  status: "PROCESSING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  processedBy: string | null;
  processedAt: string | null;
  payslips: Payslip[];
}

export function PayrollPayrun() {
  const currentDate = new Date();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial values from URL params or use current date
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const [selectedMonth, setSelectedMonth] = useState<number>(
    monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    yearParam ? parseInt(yearParam) : currentDate.getFullYear()
  );
  const [payrun, setPayrun] = useState<Payrun | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [approvingPayslipId, setApprovingPayslipId] = useState<string | null>(
    null
  );
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: selectedPayslip
      ? `Payslip_${selectedPayslip.employee.employeeCode}_${
          months.find((m) => m.value === selectedPayslip.month)?.label
        }_${selectedPayslip.year}`
      : "Payslip",
  });

  useEffect(() => {
    // Update from URL params if they change
    if (monthParam) {
      const month = parseInt(monthParam);
      if (month >= 1 && month <= 12) {
        setSelectedMonth(month);
      }
    }
    if (yearParam) {
      const year = parseInt(yearParam);
      if (year >= 2000) {
        setSelectedYear(year);
      }
    }
  }, [monthParam, yearParam]);

  useEffect(() => {
    const loadPayrun = async () => {
      setIsLoading(true);
      await fetchPayrun();
      setIsLoading(false);
    };
    loadPayrun();
  }, [selectedMonth, selectedYear]);

  const fetchPayrun = async () => {
    try {
      const data = await apiClient<Payrun>(
        `/api/payroll/payrun/${selectedMonth}/${selectedYear}`
      );
      setPayrun(data);
    } catch (error: any) {
      setPayrun(null);
    }
  };

  const handleGeneratePayrun = async () => {
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
      toast.success("Payrun generated successfully");
    } catch (error: any) {
      console.error("Error generating payrun:", error);
      toast.error("Failed to generate payrun", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePayrun = async () => {
    if (!payrun) return;

    const pendingCount = payslips.filter((p) => p.status === "PENDING").length;
    const processedCount = payslips.filter(
      (p) => p.status === "PROCESSED"
    ).length;

    setIsMarkingDone(true);
    try {
      const data = await apiClient<Payrun>(
        `/api/payroll/payrun/${payrun.id}/done`,
        {
          method: "POST",
        }
      );
      setPayrun(data);

      if (pendingCount > 0) {
        toast.success(
          `Payrun completed! Approved ${pendingCount} pending and ${processedCount} processed payslips.`
        );
      } else {
        toast.success(
          `Payrun completed! All ${payslips.length} payslips marked as paid.`
        );
      }
    } catch (error: any) {
      console.error("Error completing payrun:", error);
      toast.error("Failed to complete payrun", {
        description: error.message,
      });
    } finally {
      setIsMarkingDone(false);
    }
  };

  const handlePayslipClick = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setIsModalOpen(true);
  };

  const handleApprovePayslip = async (
    e: React.MouseEvent,
    payslip: Payslip
  ) => {
    e.stopPropagation(); // Prevent row click

    if (!payrun) return;

    setApprovingPayslipId(payslip.id);
    try {
      await apiClient<Payslip>(`/api/payroll/payslip/${payslip.id}/approve`, {
        method: "POST",
      });

      // Refetch the entire payrun to get updated statuses (including auto-completion)
      await fetchPayrun();

      toast.success(
        `Payslip approved for ${payslip.employee.firstName} ${payslip.employee.lastName}`
      );
    } catch (error: any) {
      console.error("Error approving payslip:", error);
      toast.error("Failed to approve payslip", {
        description: error.message,
      });
    } finally {
      setApprovingPayslipId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Print component - renders without tabs for better printing
  const PrintablePayslip = ({ payslip }: { payslip: Payslip }) => {
    if (!payslip) return null;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-2xl font-bold mb-2">Payslip</h1>
          <p className="text-lg">
            {months.find((m) => m.value === payslip.month)?.label}{" "}
            {payslip.year}
          </p>
        </div>

        {/* Employee Information */}
        <div className="grid grid-cols-2 gap-4 border-b pb-6">
          <div>
            <h2 className="font-semibold text-lg mb-3">Employee Details</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Name:</span>{" "}
                {payslip.employee.firstName} {payslip.employee.lastName}
              </div>
              <div>
                <span className="font-medium">Employee Code:</span>{" "}
                {payslip.employee.employeeCode}
              </div>
              <div>
                <span className="font-medium">Department:</span>{" "}
                {payslip.employee.department}
              </div>
              <div>
                <span className="font-medium">Designation:</span>{" "}
                {payslip.employee.designation}
              </div>
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-lg mb-3">Pay Period</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Salary Structure:</span> Regular
                Pay
              </div>
              <div>
                <span className="font-medium">Period:</span> 01{" "}
                {months
                  .find((m) => m.value === payslip.month)
                  ?.label.substring(0, 3)}{" "}
                To {new Date(payslip.year, payslip.month, 0).getDate()}{" "}
                {months
                  .find((m) => m.value === payslip.month)
                  ?.label.substring(0, 3)}
              </div>
            </div>
          </div>
        </div>

        {/* Worked Days Section */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Attendance Summary</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Days</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  Total Working Days
                </TableCell>
                <TableCell className="text-right">
                  {payslip.totalWorkingDays}
                </TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Present Days</TableCell>
                <TableCell className="text-right">
                  {Number(payslip.presentDays)}
                </TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Paid Leave Days</TableCell>
                <TableCell className="text-right">
                  {Number(payslip.paidLeaveDays)}
                </TableCell>
                <TableCell className="text-right">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Unpaid Leave Days</TableCell>
                <TableCell className="text-right text-destructive">
                  {Number(payslip.unpaidLeaveDays)}
                </TableCell>
                <TableCell className="text-right text-destructive">
                  -
                  {formatCurrency(
                    (Number(payslip.grossSalary) / payslip.totalWorkingDays) *
                      Number(payslip.unpaidLeaveDays)
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Absent Days</TableCell>
                <TableCell className="text-right text-destructive">
                  {Number(payslip.absentDays)}
                </TableCell>
                <TableCell className="text-right text-destructive">
                  -
                  {formatCurrency(
                    (Number(payslip.grossSalary) / payslip.totalWorkingDays) *
                      Number(payslip.absentDays)
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-medium">
                  Total LOP Deduction
                </TableCell>
                <TableCell className="text-right font-medium">
                  {Number(payslip.absentDays) + Number(payslip.unpaidLeaveDays)}{" "}
                  days
                </TableCell>
                <TableCell className="text-right font-medium text-destructive">
                  -{formatCurrency(Number(payslip.lopDeduction))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Payable Days</TableCell>
                <TableCell className="text-right font-medium">
                  {Number(payslip.presentDays) + Number(payslip.paidLeaveDays)}{" "}
                  / {payslip.totalWorkingDays}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(
                    Number(payslip.grossSalary) - Number(payslip.lopDeduction)
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <p className="text-sm text-muted-foreground mt-4">
            Salary is calculated using Loss of Pay (LOP) method. Base gross
            salary is ₹{Number(payslip.grossSalary).toLocaleString()} for{" "}
            {payslip.totalWorkingDays} working days. Absent days and unpaid
            leaves are deducted at ₹
            {(Number(payslip.grossSalary) / payslip.totalWorkingDays).toFixed(
              2
            )}{" "}
            per day.
          </p>
        </div>

        {/* Salary Computation Section */}
        <div className="page-break-before">
          <h2 className="font-semibold text-lg mb-4">Salary Computation</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium" colSpan={2}>
                  Earnings
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">
                  Basic Salary (50% of CTC)
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(payslip.basicSalary))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">
                  House Rent Allowance (50% of Basic)
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(payslip.basicSalary) * 0.5)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Standard Allowance</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(4167)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">
                  Performance Bonus (8.33% of Basic)
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(payslip.basicSalary) * 0.0833)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">
                  Leave Travel Allowance (8.33% of Basic)
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(payslip.basicSalary) * 0.0833)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">Fixed Allowance</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(
                    Math.max(
                      0,
                      Number(payslip.grossSalary) -
                        Number(payslip.basicSalary) * 2.1666 -
                        4167
                    )
                  )}
                </TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Gross Salary</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(payslip.grossSalary))}
                </TableCell>
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium" colSpan={2}>
                  Deductions
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-destructive">
                  Loss of Pay (LOP)
                </TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatCurrency(Number(payslip.lopDeduction))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-destructive">
                  PF Employee Contribution (12% of Basic)
                </TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatCurrency(Number(payslip.pfDeduction))}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-destructive">
                  Professional Tax
                </TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatCurrency(Number(payslip.professionalTax))}
                </TableCell>
              </TableRow>
              {Number(payslip.otherDeductions) > 0 && (
                <TableRow>
                  <TableCell className="pl-6 text-destructive">
                    Other Deductions
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    -{formatCurrency(Number(payslip.otherDeductions))}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="font-medium">
                <TableCell className="text-destructive">
                  Total Deductions
                </TableCell>
                <TableCell className="text-right text-destructive">
                  -{formatCurrency(Number(payslip.totalDeductions))}
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold text-base">
                  Net Salary
                </TableCell>
                <TableCell className="text-right font-bold text-base">
                  {formatCurrency(Number(payslip.netSalary))}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <div className="text-sm text-muted-foreground space-y-1 mt-4">
            <p>
              <span className="font-medium">Note:</span> LOP deduction is
              calculated as (Gross Salary ÷ Working Days) × (Absent Days +
              Unpaid Leave Days)
            </p>
            <p>
              Per Day Rate: ₹
              {(Number(payslip.grossSalary) / payslip.totalWorkingDays).toFixed(
                2
              )}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6 mt-8">
          <p>
            This is a computer-generated payslip and does not require a
            signature.
          </p>
          <p className="mt-1">
            Generated on {format(new Date(), "dd MMM yyyy 'at' hh:mm a")}
          </p>
        </div>
      </div>
    );
  };

  const updateUrlParams = (month: number, year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", month.toString());
    params.set("year", year.toString());
    router.push(`/dashboard/payroll?${params.toString()}`, { scroll: false });
  };

  const handleMonthChange = (value: string) => {
    const month = Number(value);
    setSelectedMonth(month);
    updateUrlParams(month, selectedYear);
  };

  const handleYearChange = (value: string) => {
    const year = Number(value);
    setSelectedYear(year);
    updateUrlParams(selectedMonth, year);
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

  const years = Array.from(
    { length: 11 },
    (_, i) => currentDate.getFullYear() - 5 + i
  );

  const payslipColumns: Column<Payslip>[] = [
    {
      key: "month",
      label: "Pay Period",
      render: (payslip) => (
        <div className="font-medium">
          {format(new Date(payslip.year, payslip.month - 1), "MMM yyyy")}
        </div>
      ),
    },
    {
      key: "employee.firstName",
      label: "Employee",
      sortable: false,
      render: (payslip) => (
        <div>
          <div className="font-medium">
            {payslip.employee.firstName} {payslip.employee.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {payslip.employee.employeeCode}
          </div>
        </div>
      ),
    },
    {
      key: "grossSalary",
      label: "Employer Cost",
      className: "text-right",
      headerClassName: "text-right",
      render: (payslip) => formatCurrency(Number(payslip.grossSalary)),
    },
    {
      key: "basicSalary",
      label: "Basic Wage",
      className: "text-right",
      headerClassName: "text-right",
      render: (payslip) => formatCurrency(Number(payslip.basicSalary)),
    },
    {
      key: "totalEarnings",
      label: "Gross Wage",
      className: "text-right",
      headerClassName: "text-right",
      render: (payslip) => formatCurrency(Number(payslip.grossSalary)),
    },
    {
      key: "netSalary",
      label: "Net Wage",
      className: "text-right font-medium",
      headerClassName: "text-right",
      render: (payslip) => formatCurrency(Number(payslip.netSalary)),
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (payslip) => {
        if (payslip.status === "PAID" || payslip.status === "PROCESSED") {
          return <Badge variant="success">Approved</Badge>;
        }
        if (payslip.status === "PENDING") {
          return <Badge variant="secondary">Pending</Badge>;
        }
        if (payslip.status === "CANCELLED") {
          return <Badge variant="destructive">Cancelled</Badge>;
        }
        return null;
      },
    },
  ];

  // Add approve column only if payrun is not done
  if (!isDone) {
    payslipColumns.push({
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (payslip) => {
        // Only show button for pending payslips
        if (payslip.status !== "PENDING") {
          return null;
        }

        const isApproving = approvingPayslipId === payslip.id;
        const isAnyApproving = approvingPayslipId !== null;

        return (
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleApprovePayslip(e, payslip)}
              disabled={isAnyApproving || isMarkingDone}
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </Button>
          </div>
        );
      },
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-end gap-3 sm:gap-4">
        <div className="flex flex-1 gap-3 items-center">
          <div className="flex-1">
            <label className="text-xs sm:text-sm font-medium mb-2 block">Month</label>
            <Select
              value={selectedMonth.toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-xs sm:text-sm font-medium mb-2 block">Year</label>
            <Select
              value={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="text-xs sm:text-sm">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={handleGeneratePayrun}
            disabled={isLoading || payrun !== null}
            className="text-xs sm:text-sm w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Payrun"
            )}
          </Button>
          {payrun && !isDone && (
            <Button
              onClick={handleApprovePayrun}
              disabled={isMarkingDone || approvingPayslipId !== null}
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              {isMarkingDone ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                "Complete Payrun"
              )}
            </Button>
          )}
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

      {!isLoading && !payrun && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">
              No payrun found for{" "}
              {months.find((m) => m.value === selectedMonth)?.label}{" "}
              {selectedYear}
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Generate Payrun" to create payslips for all employees
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && payrun && payslips.length > 0 && (
        <>
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    Payrun{" "}
                    {months.find((m) => m.value === selectedMonth)?.label}{" "}
                    {selectedYear}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {payslips.length} employee(s)
                    {!isDone && (
                      <span className="ml-2">
                        •{" "}
                        {
                          payslips.filter((p) => p.status === "PROCESSED")
                            .length
                        }{" "}
                        approved ,{" "}
                        {payslips.filter((p) => p.status === "PENDING").length}{" "}
                        pending
                      </span>
                    )}
                  </CardDescription>
                </div>
                {isDone ? (
                  <Badge variant="success">Completed</Badge>
                ) : (
                  <Badge variant="secondary">In Progress</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Employer Cost</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {formatCurrency(totalEmployerCost)}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Gross Wage</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {formatCurrency(totalGrossWage)}
                  </div>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Net Wage</div>
                  <div className="text-xl sm:text-2xl font-bold">
                    {formatCurrency(totalNetWage)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DataTable
            data={payslips}
            columns={payslipColumns}
            keyExtractor={(payslip) => payslip.id}
            emptyMessage="No payslips found"
            onRowClick={handlePayslipClick}
            footer={
              <>
                <TableRow>
                  <TableCell colSpan={2} className="font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(totalEmployerCost)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(
                      payslips.reduce(
                        (sum, p) => sum + Number(p.basicSalary),
                        0
                      )
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(totalGrossWage)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(totalNetWage)}
                  </TableCell>
                  <TableCell></TableCell>
                  {!isDone && <TableCell></TableCell>}
                </TableRow>
              </>
            }
          />
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payroll Definitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
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

      {/* Payslip Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="print-hide">
            <DialogTitle>
              {selectedPayslip && (
                <div>
                  <div className="text-xl">
                    {selectedPayslip.employee.firstName}{" "}
                    {selectedPayslip.employee.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground font-normal">
                    Payrun{" "}
                    {
                      months.find((m) => m.value === selectedPayslip.month)
                        ?.label
                    }{" "}
                    {selectedPayslip.year}
                  </div>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedPayslip && (
            <>
              {/* Hidden print content - uses PrintablePayslip component */}
              <div className="hidden print:block">
                <div ref={printRef}>
                  <PrintablePayslip payslip={selectedPayslip} />
                </div>
              </div>

              {/* Screen view content - uses tabbed interface */}
              <div className="space-y-6 print:hidden">
                {/* Print-only header */}
                <div className="hidden">
                  <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
                    <h1 className="text-2xl font-bold">PAYSLIP</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      For the month of{" "}
                      {
                        months.find((m) => m.value === selectedPayslip.month)
                          ?.label
                      }{" "}
                      {selectedPayslip.year}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="font-semibold">Employee Name:</p>
                      <p>
                        {selectedPayslip.employee.firstName}{" "}
                        {selectedPayslip.employee.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Employee Code:</p>
                      <p>{selectedPayslip.employee.employeeCode}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Department:</p>
                      <p>{selectedPayslip.employee.department}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Designation:</p>
                      <p>{selectedPayslip.employee.designation}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Salary Structure:
                    </span>
                    <span className="ml-2 font-medium">Regular Pay</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Period:</span>
                    <span className="ml-2 font-medium">
                      01{" "}
                      {months
                        .find((m) => m.value === selectedPayslip.month)
                        ?.label.substring(0, 3)}{" "}
                      To{" "}
                      {new Date(
                        selectedPayslip.year,
                        selectedPayslip.month,
                        0
                      ).getDate()}{" "}
                      {months
                        .find((m) => m.value === selectedPayslip.month)
                        ?.label.substring(0, 3)}
                    </span>
                  </div>
                </div>

                <Tabs defaultValue="worked-days" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 print-hide">
                    <TabsTrigger value="worked-days">Worked Days</TabsTrigger>
                    <TabsTrigger value="salary-computation">
                      Salary Computation
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="worked-days" className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Days</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">
                            Total Working Days
                          </TableCell>
                          <TableCell className="text-right">
                            {selectedPayslip.totalWorkingDays}
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Present Days</TableCell>
                          <TableCell className="text-right">
                            {Number(selectedPayslip.presentDays)}
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Paid Leave Days</TableCell>
                          <TableCell className="text-right">
                            {Number(selectedPayslip.paidLeaveDays)}
                          </TableCell>
                          <TableCell className="text-right">-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Unpaid Leave Days</TableCell>
                          <TableCell className="text-right text-destructive">
                            {Number(selectedPayslip.unpaidLeaveDays)}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            -
                            {formatCurrency(
                              (Number(selectedPayslip.grossSalary) /
                                selectedPayslip.totalWorkingDays) *
                                Number(selectedPayslip.unpaidLeaveDays)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Absent Days</TableCell>
                          <TableCell className="text-right text-destructive">
                            {Number(selectedPayslip.absentDays)}
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            -
                            {formatCurrency(
                              (Number(selectedPayslip.grossSalary) /
                                selectedPayslip.totalWorkingDays) *
                                Number(selectedPayslip.absentDays)
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell className="font-medium">
                            Total LOP Deduction
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {Number(selectedPayslip.absentDays) +
                              Number(selectedPayslip.unpaidLeaveDays)}{" "}
                            days
                          </TableCell>
                          <TableCell className="text-right font-medium text-destructive">
                            -
                            {formatCurrency(
                              Number(selectedPayslip.lopDeduction)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            Payable Days
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {Number(selectedPayslip.presentDays) +
                              Number(selectedPayslip.paidLeaveDays)}{" "}
                            / {selectedPayslip.totalWorkingDays}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(
                              Number(selectedPayslip.grossSalary) -
                                Number(selectedPayslip.lopDeduction)
                            )}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                    <p className="text-sm text-muted-foreground">
                      Salary is calculated using Loss of Pay (LOP) method. Base
                      gross salary is ₹
                      {Number(selectedPayslip.grossSalary).toLocaleString()} for{" "}
                      {selectedPayslip.totalWorkingDays} working days. Absent
                      days and unpaid leaves are deducted at ₹
                      {(
                        Number(selectedPayslip.grossSalary) /
                        selectedPayslip.totalWorkingDays
                      ).toFixed(2)}{" "}
                      per day.
                    </p>
                  </TabsContent>

                  <TabsContent value="salary-computation" className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Component</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium" colSpan={2}>
                            Earnings
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">
                            Basic Salary (50% of CTC)
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(selectedPayslip.basicSalary)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">
                            House Rent Allowance (50% of Basic)
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(selectedPayslip.basicSalary) * 0.5
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">
                            Standard Allowance
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(4167)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">
                            Performance Bonus (8.33% of Basic)
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(selectedPayslip.basicSalary) * 0.0833
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">
                            Leave Travel Allowance (8.33% of Basic)
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(selectedPayslip.basicSalary) * 0.0833
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">
                            Fixed Allowance
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Math.max(
                                0,
                                Number(selectedPayslip.grossSalary) -
                                  Number(selectedPayslip.basicSalary) * 2.1666 -
                                  4167
                              )
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow className="font-medium">
                          <TableCell>Gross Salary</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(selectedPayslip.grossSalary)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50">
                          <TableCell className="font-medium" colSpan={2}>
                            Deductions
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6 text-destructive">
                            Loss of Pay (LOP)
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            -
                            {formatCurrency(
                              Number(selectedPayslip.lopDeduction)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6 text-destructive">
                            PF Employee Contribution (12% of Basic)
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            -
                            {formatCurrency(
                              Number(selectedPayslip.pfDeduction)
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6 text-destructive">
                            Professional Tax
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            -
                            {formatCurrency(
                              Number(selectedPayslip.professionalTax)
                            )}
                          </TableCell>
                        </TableRow>
                        {Number(selectedPayslip.otherDeductions) > 0 && (
                          <TableRow>
                            <TableCell className="pl-6 text-destructive">
                              Other Deductions
                            </TableCell>
                            <TableCell className="text-right text-destructive">
                              -
                              {formatCurrency(
                                Number(selectedPayslip.otherDeductions)
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className="font-medium">
                          <TableCell className="text-destructive">
                            Total Deductions
                          </TableCell>
                          <TableCell className="text-right text-destructive">
                            -
                            {formatCurrency(
                              Number(selectedPayslip.totalDeductions)
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell className="font-bold text-base">
                            Net Salary
                          </TableCell>
                          <TableCell className="text-right font-bold text-base">
                            {formatCurrency(Number(selectedPayslip.netSalary))}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">Note:</span> LOP deduction
                        is calculated as (Gross Salary ÷ Working Days) × (Absent
                        Days + Unpaid Leave Days)
                      </p>
                      <p>
                        Per Day Rate: ₹
                        {(
                          Number(selectedPayslip.grossSalary) /
                          selectedPayslip.totalWorkingDays
                        ).toFixed(2)}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
