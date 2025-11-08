"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowUpDown, Plane } from "lucide-react";
import { AddEmployeeModal } from "@/components/add-employee-modal";
import { Button } from "@/components/ui/button";

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

type SortField = "name" | "employeeCode" | "department" | "designation" | "status";
type SortDirection = "asc" | "desc";

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

function getStatusBadge(status: Status) {
  switch (status) {
    case "present":
      return (
        <Badge variant="success" className="gap-1.5">
          <span className="size-2 rounded-full bg-white" />
          Present
        </Badge>
      );
    case "on_leave":
      return (
        <Badge variant="warning" className="gap-1.5">
          <Plane className="size-3" />
          On Leave
        </Badge>
      );
    case "absent":
      return (
        <Badge variant="outline" className="gap-1.5">
          <span className="size-2 rounded-full bg-amber-400" />
          Absent
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    fetchEmployees().then((data) => {
      setEmployees(data);
      setIsLoading(false);
    });
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue = a[sortField] ?? "";
    let bValue = b[sortField] ?? "";

    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // TODO: Get user role from employee API to check permissions
  const showAll = false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        {showAll && <AddEmployeeModal />}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No employees found matching your search"
                : "No employees found"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("employeeCode")}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Employee Code
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Name
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("department")}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Department
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("designation")}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Designation
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Status
                    <ArrowUpDown className="ml-2 size-3.5" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-8 shrink-0 rounded-md bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {emp.name
                          .split(" ")
                          .map((s) => (s ? s[0] : ""))
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <span className="font-medium">{emp.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{emp.department || "—"}</TableCell>
                  <TableCell className="capitalize">
                    {emp.designation?.replace(/_/g, " ") || "—"}
                  </TableCell>
                  <TableCell>{getStatusBadge(emp.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
