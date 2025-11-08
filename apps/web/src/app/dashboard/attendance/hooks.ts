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

export function useTodayAttendance(status: string, department: string) {
  return useQuery({
    queryKey: ["attendance", "today", department],
    queryFn: () =>
      apiClient<EmployeeAttendance[]>(
        `/api/attendance/today?status=${status}&department=${department}`
      ),
    retry: 1,
    staleTime: 1,
  });
}
