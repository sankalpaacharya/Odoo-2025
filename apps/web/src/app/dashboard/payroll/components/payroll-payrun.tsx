"use client";

import { useState } from "react";
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
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Payslip {
  id: string;
  payPeriod: string;
  employeeId: string;
  employeeName: string;
  employerCost: number;
  basicWage: number;
  grossWage: number;
  netWage: number;
  status: "draft" | "validated" | "done";
}

export function PayrollPayrun() {
  const [selectedMonth, setSelectedMonth] = useState("Oct 2025");
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Sample data - replace with actual API calls
  const months = [
    "Oct 2025",
    "Sept 2025",
    "Aug 2025",
    "Jul 2025",
    "Jun 2025",
    "May 2025",
  ];

  const handleGeneratePayrun = async () => {
    setIsGenerating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Sample generated payslips
    const generatedPayslips: Payslip[] = [
      {
        id: "1",
        payPeriod: selectedMonth,
        employeeId: "EMP001",
        employeeName: "John Doe",
        employerCost: 50000,
        basicWage: 25000,
        grossWage: 50000,
        netWage: 43800,
        status: "draft",
      },
      {
        id: "2",
        payPeriod: selectedMonth,
        employeeId: "EMP002",
        employeeName: "Jane Smith",
        employerCost: 60000,
        basicWage: 30000,
        grossWage: 60000,
        netWage: 52560,
        status: "draft",
      },
      {
        id: "3",
        payPeriod: selectedMonth,
        employeeId: "EMP003",
        employeeName: "Mike Johnson",
        employerCost: 55000,
        basicWage: 27500,
        grossWage: 55000,
        netWage: 48190,
        status: "draft",
      },
    ];

    setPayslips(generatedPayslips);
    setIsGenerating(false);
    toast.success(`Payrun generated for ${selectedMonth}`, {
      description: `${generatedPayslips.length} payslips created`,
    });
  };

  const handleValidatePayrun = async () => {
    if (payslips.length === 0) {
      toast.error("No payslips to validate");
      return;
    }

    setIsValidating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPayslips((prev) =>
      prev.map((p) => ({ ...p, status: "validated" as const }))
    );
    setIsValidating(false);
    toast.success("Payrun validated successfully");
  };

  const handleMarkAsDone = async () => {
    if (
      payslips.length === 0 ||
      !payslips.every((p) => p.status === "validated")
    ) {
      toast.error("Please validate payrun first");
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setPayslips((prev) => prev.map((p) => ({ ...p, status: "done" as const })));
    toast.success("Payrun marked as done");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalEmployerCost = payslips.reduce(
    (sum, p) => sum + p.employerCost,
    0
  );
  const totalGrossWage = payslips.reduce((sum, p) => sum + p.grossWage, 0);
  const totalNetWage = payslips.reduce((sum, p) => sum + p.netWage, 0);
  const allDone =
    payslips.length > 0 && payslips.every((p) => p.status === "done");

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Pay Period</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleGeneratePayrun}
            disabled={isGenerating}
            variant="default"
          >
            {isGenerating ? "Generating..." : "Payrun"}
          </Button>
          <Button
            onClick={handleValidatePayrun}
            disabled={isValidating || payslips.length === 0}
            variant="outline"
          >
            {isValidating ? "Validating..." : "Validate"}
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      {payslips.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payrun {selectedMonth}</CardTitle>
                <CardDescription>{payslips.length} employee(s)</CardDescription>
              </div>
              {allDone ? (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="size-3" />
                  Done
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={handleMarkAsDone}
                  disabled={!payslips.every((p) => p.status === "validated")}
                >
                  Done
                </Button>
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
      )}

      {/* Payslip Table */}
      {payslips.length > 0 && (
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
                      {payslip.payPeriod}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payslip.employeeName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payslip.employeeId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payslip.employerCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payslip.basicWage)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payslip.grossWage)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payslip.netWage)}
                    </TableCell>
                    <TableCell>
                      {payslip.status === "done" && (
                        <Badge variant="success">Done</Badge>
                      )}
                      {payslip.status === "validated" && (
                        <Badge variant="default">Validated</Badge>
                      )}
                      {payslip.status === "draft" && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Information Section */}
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

      {/* Note about attendance */}
      {payslips.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">
              No payslips generated yet for {selectedMonth}
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Click the <strong>Payrun</strong> button to automatically generate
              payslips for all employees based on their attendance and salary
              structure for the selected month.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
