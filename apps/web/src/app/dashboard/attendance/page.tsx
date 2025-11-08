"use client";

import { useEmployee } from "@/lib/employee-context";
import { EmployeeAttendanceView } from "./components/employee-attendance-view";
import { AdminAttendanceView } from "./components/admin-attendance-view";
import Loader from "@/components/loader";

export default function AttendancePage() {
  const { isAdmin, isLoading } = useEmployee();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Monitor employee attendance"
              : "Track your attendance records"}
          </p>
        </div>
      </div>

      {isAdmin ? <AdminAttendanceView /> : <EmployeeAttendanceView />}
    </div>
  );
}
