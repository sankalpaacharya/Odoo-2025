import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { MyAttendanceResponse, EmployeeAttendance } from "./types";

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

export function useTodayAttendance() {
  return useQuery({
    queryKey: ["attendance", "today"],
    queryFn: () => apiClient<EmployeeAttendance[]>("/api/attendance/today"),
    retry: 1,
    staleTime: 1 * 60 * 1000,
  });
}
