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
import { CheckCircle2, Loader2 } from "lucide-react";
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
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );
  const [payrun, setPayrun] = useState<Payrun | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingDone, setIsMarkingDone] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPayrun();
  }, [selectedMonth, selectedYear]);

  const fetchPayrun = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<Payrun>(
        `/api/payroll/payrun/${selectedMonth}/${selectedYear}`
      );
      setPayrun(data);
    } catch (error: any) {
      setPayrun(null);
    } finally {
      setIsLoading(false);
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

    setIsMarkingDone(true);
    try {
      const data = await apiClient<Payrun>(
        `/api/payroll/payrun/${payrun.id}/done`,
        {
          method: "POST",
        }
      );
      setPayrun(data);
      toast.success("Payrun approved successfully");
    } catch (error: any) {
      console.error("Error approving payrun:", error);
      toast.error("Failed to approve payrun", {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
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

  const years = Array.from(
    { length: 11 },
    (_, i) => currentDate.getFullYear() - 5 + i
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Month</label>
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger>
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

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Year</label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger>
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

        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePayrun}
            disabled={isLoading || payrun !== null}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Payrun"
            )}
          </Button>
          {payrun && !isDone && (
            <Button onClick={handleApprovePayrun} disabled={isMarkingDone}>
              {isMarkingDone ? "Approving..." : "Approve"}
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
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Payrun{" "}
                    {months.find((m) => m.value === selectedMonth)?.label}{" "}
                    {selectedYear}
                  </CardTitle>
                  <CardDescription>
                    {payslips.length} employee(s)
                  </CardDescription>
                </div>
                {isDone ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="size-3" />
                    Approved
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending Approval</Badge>
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
                    <TableRow
                      key={payslip.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handlePayslipClick(payslip)}
                    >
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
                          <Badge variant="success">Approved</Badge>
                        )}
                        {payslip.status === "PROCESSED" && (
                          <Badge variant="default">Approved</Badge>
                        )}
                        {payslip.status === "PENDING" && (
                          <Badge variant="secondary">Pending</Badge>
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

      {/* Payslip Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
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
            <div className="space-y-6">
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
                <TabsList className="grid w-full grid-cols-2">
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
                        <TableCell>Attendance</TableCell>
                        <TableCell className="text-right">
                          {selectedPayslip.presentDays} (
                          {selectedPayslip.workingDays} working days in week)
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            Number(selectedPayslip.basicSalary) *
                              (Number(selectedPayslip.presentDays) /
                                selectedPayslip.workingDays)
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Paid Time off</TableCell>
                        <TableCell className="text-right">
                          {selectedPayslip.leaveDays} (
                          {selectedPayslip.leaveDays} Paid leaves/Month)
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            Number(selectedPayslip.basicSalary) *
                              (Number(selectedPayslip.leaveDays) /
                                selectedPayslip.workingDays)
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow className="font-medium border-t-2">
                        <TableCell></TableCell>
                        <TableCell className="text-right">
                          {Number(selectedPayslip.presentDays) +
                            Number(selectedPayslip.leaveDays)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(selectedPayslip.basicSalary))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <p className="text-sm text-muted-foreground">
                    Salary is calculated based on the employee's monthly
                    attendance. Paid leaves are included in the total payable
                    days, while unpaid leaves are deducted from the salary.
                  </p>
                </TabsContent>

                <TabsContent value="salary-computation" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rule Name</TableHead>
                        <TableHead className="text-right">Rate %</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Basic Salary
                        </TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(selectedPayslip.basicSalary))}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>House Rent Allowance</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            Number(selectedPayslip.basicSalary) * 0.5
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Standard Allowance</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(4167)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Performance Bonus</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            Number(selectedPayslip.basicSalary) * 0.0833
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Leave Travel Allowance</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            Number(selectedPayslip.basicSalary) * 0.0833
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Fixed Allowance</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            Number(selectedPayslip.grossSalary) -
                              Number(selectedPayslip.basicSalary) * 2.1666 -
                              4167
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow className="font-medium border-t-2">
                        <TableCell>Gross</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(selectedPayslip.grossSalary))}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-t">
                        <TableCell>PF Employee</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right text-destructive">
                          -{" "}
                          {formatCurrency(Number(selectedPayslip.pfDeduction))}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>PF Employer</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right text-destructive">
                          -{" "}
                          {formatCurrency(Number(selectedPayslip.pfDeduction))}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Professional Tax</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right text-destructive">
                          -{" "}
                          {formatCurrency(
                            Number(selectedPayslip.professionalTax)
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow className="font-medium border-t-2">
                        <TableCell>Net Amount</TableCell>
                        <TableCell className="text-right">100</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(selectedPayslip.netSalary))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <p className="text-sm text-muted-foreground">
                    Users can also view the payslip computation, which shows how
                    the total amount is calculated from different salary heads,
                    including allowances and deductions.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button variant="outline">Print</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
