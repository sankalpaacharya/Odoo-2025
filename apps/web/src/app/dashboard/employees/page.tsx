"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddEmployeeModal } from "@/components/add-employee-modal";
import { DataTable, type Column } from "@/components/data-table";
import { StatusBadge, EmployeeAvatar } from "@/components/status-badge";

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

const employeeColumns: Column<Employee>[] = [
  {
    key: "avatar",
    // No label for avatar column
    sortable: false,
    render: (emp) => <EmployeeAvatar name={emp.name} size="sm" profileImage={emp.profileImage} />,
    className: "w-12",
  },
  {
    key: "name",
    label: "Name",
    className: "font-medium",
  },
  {
    key: "employeeCode",
    label: "Employee ID",
    className: "font-medium",
  },
  {
    key: "department",
    label: "Department",
    render: (emp) => emp.department || "—",
  },
  {
    key: "designation",
    label: "Designation",
    className: "capitalize",
    render: (emp) => emp.designation?.replace(/_/g, " ") || "—",
  },
  {
    key: "status",
    label: "Status",
    render: (emp) => <StatusBadge status={emp.status} />,
  },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployees().then((data) => {
      setEmployees(data);
      setIsLoading(false);
    });
  }, []);

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <DataTable
        data={filteredEmployees}
        columns={employeeColumns}
        keyExtractor={(emp) => emp.id}
        emptyMessage={searchQuery ? "No employees found matching your search" : "No employees found"}
        isLoading={isLoading}
        loadingMessage="Loading employees..."
      />
    </div>
  );
}
