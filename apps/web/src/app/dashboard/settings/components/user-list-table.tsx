"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/api-client";

interface Employee {
  id: string;
  name: string;
  role: string;
  status: string;
  employeeCode: string;
  department: string;
  designation: string;
  employmentStatus: string;
}

// Map database roles to display roles
const roleMap: Record<string, string> = {
  admin: "Admin",
  employee: "Employee",
  hr_officer: "HR Officer",
  payroll_officer: "Payroll Officer",
};

// Map display roles back to database roles
const reverseRoleMap: Record<string, string> = {
  Admin: "ADMIN",
  Employee: "EMPLOYEE",
  "HR Officer": "HR_OFFICER",
  "Payroll Officer": "PAYROLL_OFFICER",
};

const ROLES = ["Employee", "HR Officer", "Payroll Officer", "Admin"] as const;

export function UserListTable() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const employees = await apiClient<Employee[]>("/api/employees");
      setEmployees(employees);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch employees");
    }
    setLoading(false);
  };

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const query = searchQuery.toLowerCase();
    return employees.filter((employee) => {
      const displayRole = roleMap[employee.role] || employee.role;
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.employeeCode.toLowerCase().includes(query) ||
        (employee.department?.toLowerCase() || "").includes(query) ||
        displayRole.toLowerCase().includes(query)
      );
    });
  }, [employees, searchQuery]);

  const handleRoleChange = async (employeeId: string, newRole: string) => {
    setUpdatingRole(employeeId);

    // Convert display role to database role
    const dbRole = reverseRoleMap[newRole];

    try {
      await apiClient<{ success: boolean; employee: any }>(
        `/api/users/${employeeId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: dbRole }),
        }
      );

      // Update local state with the new role
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === employeeId ? { ...emp, role: dbRole.toLowerCase() } : emp
        )
      );
      toast.success("Employee role updated successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
      // Refresh the employee list to revert any optimistic updates
      fetchEmployees();
    }

    setUpdatingRole(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users and assign roles to control access rights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <CardTitle className="text-lg sm:text-xl">User Management</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Manage users and assign roles to control access rights
        </CardDescription>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, employee code, department, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border overflow-x-auto">
        <div className="min-w-[640px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Name</TableHead>
                <TableHead className="min-w-[120px]">Employee Code</TableHead>
                <TableHead className="min-w-[120px]">Department</TableHead>
                <TableHead className="min-w-[150px]">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No employees match your search"
                        : "No employees found"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.employeeCode}</TableCell>
                    <TableCell>{employee.department || "N/A"}</TableCell>
                    <TableCell>
                      <Select
                        value={roleMap[employee.role] || employee.role}
                        onValueChange={(value) =>
                          handleRoleChange(employee.id, value)
                        }
                        disabled={updatingRole === employee.id}
                      >
                        <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
