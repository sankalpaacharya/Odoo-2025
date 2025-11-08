import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  attendanceRate: number;
  pendingLeaves: number;
  nextPayrun: {
    month: number;
    year: number;
    date: string;
    daysRemaining: number;
  } | null;
}

export interface MonthlyAttendance {
  month: string;
  attendance: number;
}

export interface LeaveDistribution {
  type: string;
  count: number;
}

export interface DepartmentHeadcount {
  department: string;
  headcount: number;
}

export interface WeeklyAttendance {
  day: string;
  present: number;
  absent: number;
  late: number;
}

export interface TodayAttendance {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: string;
  isCurrentlyActive: boolean;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      try {
        const [employees, todayAttendance, leavesResponse] = await Promise.all([
          apiClient<Array<{ id: string; employmentStatus: string }>>(
            "/api/employees"
          ).catch(() => []),
          apiClient<TodayAttendance[]>("/api/attendance/today").catch(() => []),
          apiClient<
            { leaves: Array<{ status: string }> } | Array<{ status: string }>
          >("/api/leaves/all?status=PENDING").catch(() => ({ leaves: [] })),
        ]);

        const leaves = Array.isArray(leavesResponse)
          ? leavesResponse
          : leavesResponse.leaves || [];

        const activeEmployees = employees.filter(
          (emp) => emp.employmentStatus === "ACTIVE"
        ).length;
        const presentToday = todayAttendance.filter(
          (att) => att.status === "present"
        ).length;
        const attendanceRate =
          activeEmployees > 0 ? (presentToday / activeEmployees) * 100 : 0;

        let nextPayrun = null;
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const payrunDate = new Date(nextYear, nextMonth - 1, 15);
        const daysRemaining = Math.ceil(
          (payrunDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        nextPayrun = {
          month: nextMonth,
          year: nextYear,
          date: payrunDate.toISOString(),
          daysRemaining,
        };

        const stats: DashboardStats = {
          totalEmployees: employees.length,
          activeEmployees,
          presentToday,
          attendanceRate: parseFloat(attendanceRate.toFixed(1)),
          pendingLeaves: leaves.length,
          nextPayrun,
        };

        return stats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
          totalEmployees: 0,
          activeEmployees: 0,
          presentToday: 0,
          attendanceRate: 0,
          pendingLeaves: 0,
          nextPayrun: null,
        };
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useMonthlyAttendanceTrend() {
  return useQuery({
    queryKey: ["dashboard", "monthly-attendance"],
    queryFn: async () => {
      try {
        const now = new Date();
        const months: MonthlyAttendance[] = [];

        const employees = await apiClient<
          Array<{ id: string; employmentStatus: string }>
        >("/api/employees").catch(() => []);

        const activeEmployeeCount = employees.filter(
          (emp) => emp.employmentStatus === "ACTIVE"
        ).length;

        if (activeEmployeeCount === 0) {
          for (let i = 10; i >= 0; i--) {
            const targetDate = new Date(
              now.getFullYear(),
              now.getMonth() - i,
              1
            );
            const month = targetDate.toLocaleString("en", { month: "short" });
            months.push({ month, attendance: 0 });
          }
          return months;
        }

        for (let i = 10; i >= 0; i--) {
          const targetDate = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            15
          );
          const month = targetDate.toLocaleString("en", { month: "short" });
          const dateStr = targetDate.toISOString().split("T")[0];

          try {
            const attendance = await apiClient<TodayAttendance[]>(
              `/api/attendance/today?date=${dateStr}`
            );

            const presentEmployees = attendance.filter(
              (att) => att.status === "present" || att.status === "on_leave"
            ).length;
            const rate =
              activeEmployeeCount > 0
                ? (presentEmployees / activeEmployeeCount) * 100
                : 0;

            months.push({
              month,
              attendance: parseFloat(rate.toFixed(1)),
            });
          } catch (error) {
            console.error(`Error fetching attendance for ${month}:`, error);
            months.push({ month, attendance: 0 });
          }
        }

        return months;
      } catch (error) {
        console.error("Error fetching monthly attendance trend:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaveDistribution() {
  return useQuery({
    queryKey: ["dashboard", "leave-distribution"],
    queryFn: async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();

        const response = await apiClient<{
          leaves: Array<{ leaveType: string; status: string }>;
          pagination: any;
        }>(`/api/leaves/all?status=APPROVED&year=${year}&limit=1000`);

        const leaves = response.leaves || [];

        const distribution: Record<string, number> = {
          PAID_TIME_OFF: 0,
          SICK_LEAVE: 0,
          UNPAID_LEAVE: 0,
        };

        leaves.forEach((leave) => {
          if (distribution[leave.leaveType] !== undefined) {
            distribution[leave.leaveType]++;
          }
        });

        const result: LeaveDistribution[] = [
          { type: "Paid Time Off", count: distribution.PAID_TIME_OFF },
          { type: "Sick Leave", count: distribution.SICK_LEAVE },
          { type: "Unpaid Leave", count: distribution.UNPAID_LEAVE },
        ];

        return result;
      } catch (error) {
        console.error("Error fetching leave distribution:", error);
        return [
          { type: "Paid Time Off", count: 0 },
          { type: "Sick Leave", count: 0 },
          { type: "Unpaid Leave", count: 0 },
        ];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartmentHeadcount() {
  return useQuery({
    queryKey: ["dashboard", "department-headcount"],
    queryFn: async () => {
      const employees = await apiClient<
        Array<{ department: string | null; employmentStatus: string }>
      >("/api/employees");

      const activeEmployees = employees.filter(
        (emp) => emp.employmentStatus === "ACTIVE"
      );
      const departmentMap: Record<string, number> = {};

      activeEmployees.forEach((emp) => {
        const dept = emp.department || "Unassigned";
        departmentMap[dept] = (departmentMap[dept] || 0) + 1;
      });

      const result: DepartmentHeadcount[] = Object.entries(departmentMap)
        .map(([department, headcount]) => ({ department, headcount }))
        .sort((a, b) => b.headcount - a.headcount);

      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWeeklyAttendance() {
  return useQuery({
    queryKey: ["dashboard", "weekly-attendance"],
    queryFn: async () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

      const weekData: WeeklyAttendance[] = [];
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

      for (let i = 0; i < 5; i++) {
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + i);

        if (targetDate > now) {
          weekData.push({
            day: days[i],
            present: 0,
            absent: 0,
            late: 0,
          });
          continue;
        }

        try {
          const dateStr = targetDate.toISOString().split("T")[0];
          const attendance = await apiClient<TodayAttendance[]>(
            `/api/attendance/today?date=${dateStr}`
          );

          const present = attendance.filter(
            (att) => att.status === "present"
          ).length;
          const absent = attendance.filter(
            (att) => att.status === "absent"
          ).length;
          const late = attendance.filter((att) => {
            if (!att.checkIn) return false;
            const checkInTime = new Date(att.checkIn);
            const hours = checkInTime.getHours();
            const minutes = checkInTime.getMinutes();
            return hours > 9 || (hours === 9 && minutes > 30);
          }).length;

          weekData.push({
            day: days[i],
            present,
            absent,
            late,
          });
        } catch (error) {
          weekData.push({
            day: days[i],
            present: 0,
            absent: 0,
            late: 0,
          });
        }
      }

      return weekData;
    },
    staleTime: 60 * 1000,
  });
}
