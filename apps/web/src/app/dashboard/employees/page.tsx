import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import EmployeeCard from "@/components/employee-card";
import { AddEmployeeModal } from "@/components/add-employee-modal";

type Status = "present" | "on_leave" | "absent";

export default async function EmployeesPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  // NOTE: For now we use placeholder data. Replace with real API fetch to /api/employees
  // and attendance/leave status once backend endpoint is available.
  const placeholderEmployees: { id: string; name: string; role?: string; status: Status }[] = [
    { id: "1", name: "Alice Johnson", role: "engineer", status: "present" },
    { id: "2", name: "Bob Martin", role: "designer", status: "on_leave" },
    { id: "3", name: "Cathy Zheng", role: "product_manager", status: "absent" },
    { id: "4", name: "Daniel Lee", role: "hr_officer", status: "present" },
    { id: "5", name: "Eve Kim", role: "payroll_officer", status: "present" },
    { id: "6", name: "Frank Ortiz", role: "engineer", status: "absent" },
  ];

  // Roles that can see all employee cards
  const allowedRoles = ["admin", "hr_officer", "payroll_officer"];

  const userRole = (session?.user as any)?.role as string | undefined;

  const showAll = userRole ? allowedRoles.includes(userRole) : true;

  // If the signed-in user is a normal employee, show only themselves (or a limited view).
  const employeesToShow = showAll ? placeholderEmployees : placeholderEmployees.filter((e) => e.name === session?.user?.name);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {employeesToShow.map((emp) => (
            <EmployeeCard key={emp.id} id={emp.id} name={emp.name} role={emp.role} status={emp.status} />
          ))}
        </div>
      </div>
    </div>
  );
}
