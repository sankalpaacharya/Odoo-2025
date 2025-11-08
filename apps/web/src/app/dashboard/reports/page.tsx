"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, Loader2 } from "lucide-react";

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

  useEffect(() => {
    fetchEmployees().then((data) => {
      setEmployees(data);
      setIsLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">View analytics and reports</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Salary Statement Report
          </CardTitle>
          <Button onClick={handlePrint} variant="default" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee Name :</label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoading ? "Loading employees..." : "Select employee"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No employees found
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.employeeCode})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
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
          </div>

          {selectedEmployee && selectedYear && (
            <div className="mt-8 space-y-4">
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Salary Details</h3>
                <p className="text-muted-foreground text-sm">
                  Salary statement for{" "}
                  {employees.find((e) => e.id === selectedEmployee)?.name} -{" "}
                  {selectedYear}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
