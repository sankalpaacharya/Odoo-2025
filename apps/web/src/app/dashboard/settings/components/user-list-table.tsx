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
import { Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
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
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage users and assign roles to control access rights
        </CardDescription>
      </CardHeader>
      <CardContent>
         
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <p className="text-muted-foreground">
                        No employees found
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
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
                          <SelectTrigger className="h-9">
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              router.push(
                                `/dashboard/settings/users/${employee.id}` as any
                              )
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              router.push(
                                `/dashboard/settings/users/${employee.id}/edit` as any
                              )
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
      </CardContent>
    </Card>
  );
}
