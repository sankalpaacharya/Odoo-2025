"use client";

import { useEmployee } from "@/lib/employee-context";
import { EmployeeTimeOffView } from "./components/employee-time-off-view";
import { AdminTimeOffView } from "./components/admin-time-off-view";
import Loader from "@/components/loader";

export default function TimeOffPage() {
  const { isAdmin, isLoading } = useEmployee();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time Off</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Manage employee leave requests and approvals"
            : "Request time off and view your leave balances"}
        </p>
      </div>

      {isAdmin ? <AdminTimeOffView /> : <EmployeeTimeOffView />}
    </div>
  );
}
