"use client";

import { useState } from "react";
import { useEmployee } from "@/lib/employee-context";
import { EmployeeAttendanceView } from "./components/employee-attendance-view";
import { AdminAttendanceView } from "./components/admin-attendance-view";

export default function AttendancePage() {
  const { isAdmin, isLoading } = useEmployee();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
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

      {isAdmin ? (
        <AdminAttendanceView />
      ) : (
        <EmployeeAttendanceView
          currentMonth={currentMonth}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />
      )}
    </div>
  );
}
