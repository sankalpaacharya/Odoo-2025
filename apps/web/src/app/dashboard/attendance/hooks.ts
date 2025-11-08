import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import type { EmployeeAttendance, MyAttendanceResponse } from "./types";

export function useMyAttendance(month: number, year: number) {
  return useQuery({
    queryKey: ["attendance", "my", month, year],
    queryFn: () =>
      apiClient<MyAttendanceResponse>(
        `/api/attendance/my-attendance?month=${month}&year=${year}`
      ),
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTodayAttendance(date?: Date) {
  const dateStr = date ? date.toISOString().split("T")[0] : undefined;
  return useQuery({
    queryKey: ["attendance", "today", dateStr],
    queryFn: () => {
      const url = dateStr
        ? `/api/attendance/today?date=${dateStr}`
        : "/api/attendance/today";
      return apiClient<EmployeeAttendance[]>(url);
    },
    retry: 1,
    staleTime: 1,
  });
}
