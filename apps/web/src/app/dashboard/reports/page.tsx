"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Download,
  FileText,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { generateSalaryStatementPDF } from "@/lib/generate-salary-pdf";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Status = "present" | "on_leave" | "absent";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: Status;
  employeeCode: string;
  department?: string | null;
  designation?: string | null;
  employmentStatus: string;
  profileImage?: string | null;
}

interface SalaryComponent {
  name: string;
  monthlyAmount: number;
  yearlyAmount: number;
}

interface SalaryReportData {
  companyName: string;
  employeeName: string;
  designation: string;
  dateOfJoining: string;
  salaryEffectiveFrom: string;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
}

async function fetchEmployees(): Promise<Employee[]> {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    const response = await fetch(`${API_URL}/api/employees`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch employees:", response.statusText);
      return [];
    }

    const employees = await response.json();
    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}
export default function ReportsPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salaryData, setSalaryData] = useState<SalaryReportData | null>(null);
  const [isFetchingSalary, setIsFetchingSalary] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchEmployees().then((data) => {
      setEmployees(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedYear) {
      setIsFetchingSalary(true);
      apiClient<SalaryReportData>(
        `/api/profile/salary-report/${selectedEmployee}?year=${selectedYear}`
      )
        .then((data) => {
          setSalaryData(data);
        })
        .catch((error) => {
          console.error("Error fetching salary report:", error);
          setSalaryData(null);
        })
        .finally(() => {
          setIsFetchingSalary(false);
        });
    } else {
      setSalaryData(null);
    }
  }, [selectedEmployee, selectedYear]);

  const handlePrint = () => {
    if (!selectedEmployee || !selectedYear || !salaryData) {
      alert("Please select an employee and year first");
      return;
    }

    generateSalaryStatementPDF(salaryData);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const selectedEmployeeData = employees.find(
    (emp) => emp.id === selectedEmployee
  );

  const getProfileImageUrl = (profileImage: string | null | undefined) => {
    if (!profileImage) return null;
    const API_URL =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    return `${API_URL}${profileImage}`;
  };

  const calculateTotals = () => {
    if (!salaryData)
      return { totalEarnings: 0, totalDeductions: 0, netSalary: 0 };

    const totalEarningsMonthly = salaryData.earnings.reduce(
      (sum, item) => sum + item.monthlyAmount,
      0
    );
    const totalDeductionsMonthly = salaryData.deductions.reduce(
      (sum, item) => sum + item.monthlyAmount,
      0
    );
    const netSalaryMonthly = totalEarningsMonthly - totalDeductionsMonthly;

    return {
      totalEarnings: totalEarningsMonthly,
      totalDeductions: totalDeductionsMonthly,
      netSalary: netSalaryMonthly,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view salary statement reports
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Employee</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  {selectedEmployeeData ? (
                    <div className="flex items-center gap-2">
                      {selectedEmployeeData.profileImage ? (
                        <img
                          src={
                            getProfileImageUrl(
                              selectedEmployeeData.profileImage
                            )!
                          }
                          alt={selectedEmployeeData.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {selectedEmployeeData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate">
                        {selectedEmployeeData.name} (
                        {selectedEmployeeData.employeeCode})
                      </span>
                    </div>
                  ) : (
                    <span>
                      {isLoading ? "Loading employees..." : "Select employee"}
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search employee..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No employee found.</CommandEmpty>
                    <CommandGroup>
                      {employees.map((employee) => (
                        <CommandItem
                          key={employee.id}
                          value={`${employee.name} ${employee.employeeCode}`}
                          onSelect={() => {
                            setSelectedEmployee(employee.id);
                            setOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {employee.profileImage ? (
                              <img
                                src={getProfileImageUrl(employee.profileImage)!}
                                alt={employee.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                {employee.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {employee.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {employee.employeeCode}
                                {employee.designation &&
                                  ` • ${employee.designation}`}
                              </span>
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedEmployee === employee.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
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

          {(!selectedEmployee ||
            !selectedYear ||
            !salaryData ||
            isFetchingSalary) && (
            <div className="space-y-2">
              <label className="text-sm font-medium invisible">Action</label>
              <Button
                onClick={handlePrint}
                variant="default"
                className="gap-2 w-full"
                disabled={
                  !selectedEmployee ||
                  !selectedYear ||
                  !salaryData ||
                  isFetchingSalary
                }
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </div>

        {isFetchingSalary && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!isFetchingSalary && salaryData && (
          <>
            {/* PDF Preview */}
            <div className="rounded-lg border bg-background overflow-hidden">
              <div className="bg-muted px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">
                  Salary Statement Report
                </h2>
                <p className="text-sm text-muted-foreground">
                  {salaryData.companyName}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Employee Name
                    </p>
                    <p className="font-medium">{salaryData.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Date Of Joining
                    </p>
                    <p className="font-medium">{salaryData.dateOfJoining}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Designation</p>
                    <p className="font-medium">{salaryData.designation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Salary Effective From
                    </p>
                    <p className="font-medium">
                      {salaryData.salaryEffectiveFrom}
                    </p>
                  </div>
                </div>

                {/* Salary Components Table */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-semibold">
                          Salary Components
                        </th>
                        <th className="text-right px-4 py-3 text-sm font-semibold">
                          Monthly Amount
                        </th>
                        <th className="text-right px-4 py-3 text-sm font-semibold">
                          Yearly Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-muted/50">
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-sm font-semibold"
                        >
                          Earnings
                        </td>
                      </tr>
                      {salaryData.earnings.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 pl-8 text-sm">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-right text-sm">
                            ₹ {item.monthlyAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-2 text-right text-sm">
                            ₹ {item.yearlyAmount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}

                      <tr className="bg-muted/50 border-t">
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-sm font-semibold"
                        >
                          Deductions
                        </td>
                      </tr>
                      {salaryData.deductions.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 pl-8 text-sm">
                            {item.name}
                          </td>
                          <td className="px-4 py-2 text-right text-sm">
                            ₹ {item.monthlyAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-2 text-right text-sm">
                            ₹ {item.yearlyAmount.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}

                      <tr className="bg-primary/10 border-t-2 border-primary/20 font-semibold">
                        <td className="px-4 py-3 text-sm">Net Salary</td>
                        <td className="px-4 py-3 text-right text-sm">
                          ₹ {totals.netSalary.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          ₹ {(totals.netSalary * 12).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
