import { headers } from "next/headers";
import EmployeeCard from "@/components/employee-card";
import { AddEmployeeModal } from "@/components/add-employee-modal";

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

async function fetchEmployees(sessionToken: string): Promise<Employee[]> {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    const response = await fetch(`${API_URL}/api/employees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `better-auth.session_token=${sessionToken}`,
      },
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

export default async function EmployeesPage() {
  // Get the session token from cookies
  const headersList = await headers();
  const cookies = headersList.get("cookie") || "";
  const sessionToken =
    cookies
      .split(";")
      .find((c) => c.trim().startsWith("better-auth.session_token="))
      ?.split("=")[1] || "";

  // Fetch employees from the API
  const employees = await fetchEmployees(sessionToken);

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

      <div>
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No employees found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {employees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                id={emp.id}
                name={emp.name}
                role={emp.role}
                status={emp.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
