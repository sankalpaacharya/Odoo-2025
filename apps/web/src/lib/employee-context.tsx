import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  role: "ADMIN" | "EMPLOYEE" | "HR_OFFICER" | "PAYROLL_OFFICER";
  department: string | null;
  designation: string | null;
  dateOfJoining: string;
  employmentStatus: string;
  phone: string | null;
  email: string;
  image: string | null;
}

interface EmployeeContextType {
  employee: Employee | undefined;
  isLoading: boolean;
  isAdmin: boolean;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(
  undefined
);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const { data: employee, isLoading } = useQuery({
    queryKey: ["employee", "me"],
    queryFn: () => apiClient<Employee>("/api/employee/me"),
    staleTime: 5 * 60 * 1000,
  });

  const isAdmin =
    employee?.role === "ADMIN" ||
    employee?.role === "HR_OFFICER" ||
    employee?.role === "PAYROLL_OFFICER";

      console.log(
        "EmployeeProvider - employee:",
        employee,
        "isAdmin:",
        isAdmin
      );

  return (
    <EmployeeContext.Provider value={{ employee, isLoading, isAdmin }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployee() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider");
  }
  return context;
}
