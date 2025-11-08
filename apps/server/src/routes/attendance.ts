import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { requirePermission } from "../middleware/permission";
import { sessionService } from "../services/session.service";
import { employeeService } from "../services/employee.service";
import { leaveService } from "../services/leave.service";

const router: Router = Router();

router.use(authenticateUser);

type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "ON_LEAVE"
  | "HOLIDAY"
  | "WEEKEND";

function calculateWorkingHoursFromSessions(
  sessions: any[],
  now: Date = new Date()
): number {
  let totalMinutes = 0;

  sessions.forEach((session) => {
    if (session.isActive) {
      const sessionMinutes = Math.floor(
        (now.getTime() - session.startTime.getTime()) / (1000 * 60)
      );
      const breakMinutes = session.totalBreakTime
        ? parseFloat(session.totalBreakTime.toString()) * 60
        : 0;
      totalMinutes += Math.max(0, sessionMinutes - breakMinutes);
    } else if (session.workingHours) {
      totalMinutes += parseFloat(session.workingHours.toString()) * 60;
    }
  });

  return parseFloat((totalMinutes / 60).toFixed(2));
}

function determineStatus(
  sessions: any[],
  isOnLeave: boolean = false
): AttendanceStatus {
  if (isOnLeave) return "ON_LEAVE";
  if (sessions.length === 0) return "ABSENT";
  return "PRESENT";
}

router.get(
  "/my-attendance",
  requirePermission("Attendance", "View"),
  async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { month, year } = req.query;

      const targetMonth = month
        ? parseInt(month as string)
        : new Date().getMonth() + 1;
      const targetYear = year
        ? parseInt(year as string)
        : new Date().getFullYear();

      const employee = await employeeService.findByUserId(userId);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0);

      const [workSessions, approvedLeaves] = await Promise.all([
        sessionService.findSessionsByDateRange(employee.id, startDate, endDate),
        leaveService.findApprovedLeavesByDateRange(employee.id, startDate),
      ]);

      const now = new Date();

      // Format sessions with computed data
      const formattedSessions = workSessions.map((s) => {
        const startTime = new Date(s.startTime);
        const endTime = s.endTime
          ? new Date(s.endTime)
          : s.isActive
          ? now
          : startTime;
        const breakMinutes = s.totalBreakTime
          ? parseFloat(s.totalBreakTime.toString()) * 60
          : 0;
        const totalMinutes = Math.floor(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60)
        );
        const workingMinutes = Math.max(0, totalMinutes - breakMinutes);
        const hours = Math.floor(workingMinutes / 60);
        const minutes = Math.floor(workingMinutes % 60);

        return {
          id: s.id,
          date: s.date.toISOString(),
          startTime: s.startTime.toISOString(),
          endTime: s.endTime?.toISOString() || null,
          isActive: s.isActive,
          totalBreakTime: s.totalBreakTime
            ? parseFloat(s.totalBreakTime.toString())
            : 0,
          workingHours: s.isActive
            ? parseFloat((workingMinutes / 60).toFixed(2))
            : s.workingHours
            ? parseFloat(s.workingHours.toString())
            : 0,
          overtimeHours: s.overtimeHours
            ? parseFloat(s.overtimeHours.toString())
            : 0,
          durationMinutes: workingMinutes,
          durationFormatted: `${hours}h ${minutes}m`,
        };
      });

      // Calculate summary from actual sessions
      const uniqueWorkDays = new Set(formattedSessions.map((s) => s.date)).size;

      const totalWorkingHours = formattedSessions.reduce(
        (sum, s) => sum + s.workingHours,
        0
      );

      // Calculate total working days in month (excluding weekends and future dates)
      const today = new Date();
      let totalWorkingDaysInMonth = 0;
      for (
        let d = new Date(startDate);
        d <= endDate && d <= today;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        const dayOfWeek = d.getUTCDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Not Sunday or Saturday
          totalWorkingDaysInMonth++;
        }
      }

      const totalAbsentDays =
        totalWorkingDaysInMonth - uniqueWorkDays - approvedLeaves.length;

      const summary = {
        totalWorkingDays: totalWorkingDaysInMonth,
        totalPresentDays: uniqueWorkDays,
        totalAbsentDays: Math.max(0, totalAbsentDays),
        totalLeaveDays: approvedLeaves.length,
        totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
        totalOvertimeHours: parseFloat(
          formattedSessions
            .reduce((sum, s) => sum + s.overtimeHours, 0)
            .toFixed(2)
        ),
      };

      res.json({
        sessions: formattedSessions,
        leaves: approvedLeaves.map((leave) => ({
          id: leave.id,
          startDate: leave.startDate.toISOString(),
          endDate: leave.endDate.toISOString(),
          leaveType: leave.leaveType,
          reason: leave.reason,
        })),
        summary: {
          month: targetMonth,
          year: targetYear,
          ...summary,
        },
      });
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  }
);

router.get(
  "/today",
  requirePermission("Attendance", "View"),
  async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const employee = await employeeService.findByUserId(userId);

      if (!employee || !(await employeeService.isAdmin(userId))) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Support date parameter, default to today
      const dateParam = req.query.date as string | undefined;
      let targetDate: Date;

      if (dateParam) {
        targetDate = new Date(dateParam);
        if (isNaN(targetDate.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }
      } else {
        targetDate = new Date();
      }
      const startTargetDate = new Date(targetDate);
      startTargetDate.setUTCHours(0, 0, 0, 0);

      const allActiveEmployees = await employeeService.findActiveEmployees(
        employee.organizationId || undefined
      );

      const [activeSessions, todaySessions, employeeLeaves] = await Promise.all(
        [
          Promise.all(
            allActiveEmployees.map((emp) =>
              sessionService.findActiveSession(emp.id)
            )
          ),
          Promise.all(
            allActiveEmployees.map((emp) =>
              sessionService.findSessionsByEmployeeAndDate(
                emp.id,
                startTargetDate
              )
            )
          ),
          Promise.all(
            allActiveEmployees.map((emp) =>
              leaveService.findApprovedLeavesByDateRange(emp.id, targetDate)
            )
          ),
        ]
      );

      const activeSessionMap = new Map(
        activeSessions.filter((s) => s !== null).map((s) => [s!.employeeId, s])
      );
      const sessionMap = new Map(
        allActiveEmployees.map((emp, idx) => [emp.id, todaySessions[idx] || []])
      );
      const leaveMap = new Map(
        allActiveEmployees.map((emp, idx) => [
          emp.id,
          employeeLeaves[idx] || [],
        ])
      );

      const now = new Date();
      const formatted = allActiveEmployees.map((emp) => {
        const activeSession = activeSessionMap.get(emp.id);
        const sessions = sessionMap.get(emp.id) || [];
        const leaves = leaveMap.get(emp.id) || [];
        const isOnLeave = leaves.length > 0;

        const workingHours = calculateWorkingHoursFromSessions(sessions, now);
        const status = determineStatus(sessions, isOnLeave);

        let checkIn: Date | null = null;
        let checkOut: Date | null = null;

        if (sessions.length > 0) {
          checkIn = sessions[0]?.startTime || null;
          const lastSession = sessions[sessions.length - 1];
          checkOut = lastSession?.endTime || null;
        }

        return {
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          employeeCode: emp.employeeCode,
          department: emp.department || "N/A",
          designation: emp.designation || "N/A",
          checkIn: checkIn?.toISOString() || null,
          checkOut: checkOut?.toISOString() || null,
          workingHours,
          status,
          isCurrentlyActive: !!activeSession,
          activeSessionStart: activeSession?.startTime.toISOString() || null,
          sessions: sessions.map((s) => {
            const startTime = new Date(s.startTime);
            const endTime = s.endTime ? new Date(s.endTime) : now;
            const breakMinutes = s.totalBreakTime
              ? parseFloat(s.totalBreakTime.toString()) * 60
              : 0;
            const totalMinutes = Math.floor(
              (endTime.getTime() - startTime.getTime()) / (1000 * 60)
            );
            const workingMinutes = Math.max(0, totalMinutes - breakMinutes);
            const hours = Math.floor(workingMinutes / 60);
            const minutes = Math.floor(workingMinutes % 60);

            return {
              id: s.id,
              startTime: s.startTime.toISOString(),
              endTime: s.endTime?.toISOString() || null,
              isActive: s.isActive,
              totalBreakTime: s.totalBreakTime
                ? parseFloat(s.totalBreakTime.toString())
                : 0,
              workingHours: s.workingHours
                ? parseFloat(s.workingHours.toString())
                : null,
              overtimeHours: s.overtimeHours
                ? parseFloat(s.overtimeHours.toString())
                : 0,
              durationMinutes: workingMinutes,
              durationFormatted: `${hours}h ${minutes}m`,
            };
          }),
        };
      });

      res.json(formatted);
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
      res.status(500).json({ error: "Failed to fetch today's attendance" });
    }
  }
);

router.get(
  "/employee/:employeeId",
  requirePermission("Attendance", "View"),
  async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { employeeId } = req.params;
      const { month, year } = req.query;

      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      const employee = await employeeService.findByUserId(userId);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const isAdmin = await employeeService.isAdmin(userId);
      if (employee.id !== employeeId && !isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const targetMonth = month
        ? parseInt(month as string)
        : new Date().getMonth() + 1;
      const targetYear = year
        ? parseInt(year as string)
        : new Date().getFullYear();

      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0);

      const [targetEmployee, workSessions, approvedLeaves] = await Promise.all([
        employeeService.findById(employeeId),
        sessionService.findSessionsByDateRange(employeeId, startDate, endDate),
        leaveService.findApprovedLeavesByDateRange(
          employeeId,
          startDate,
          endDate
        ),
      ]);

      if (!targetEmployee) {
        return res.status(404).json({ error: "Target employee not found" });
      }

      const sessionsByDate = workSessions.reduce((acc, session) => {
        const dateKey = session.date.toISOString();
        if (dateKey) {
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(session);
        }
        return acc;
      }, {} as Record<string, typeof workSessions>);

      const leaveDates = new Set<string>();
      approvedLeaves.forEach((leave) => {
        const start = new Date(leave.startDate);
        start.setUTCHours(0, 0, 0, 0);
        const end = new Date(leave.endDate);
        end.setUTCHours(0, 0, 0, 0);

        const current = new Date(start);
        while (current <= end) {
          leaveDates.add(current.toISOString());
          current.setUTCDate(current.getUTCDate() + 1);
        }
      });

      const datesInMonth: Date[] = [];
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setUTCDate(d.getUTCDate() + 1)
      ) {
        datesInMonth.push(new Date(d));
      }

      const now = new Date();
      const attendances = datesInMonth.map((date) => {
        const dateKey = date.toISOString();
        const sessions = (dateKey && sessionsByDate[dateKey]) || [];
        const isOnLeave = dateKey ? leaveDates.has(dateKey) : false;

        const workingHours = calculateWorkingHoursFromSessions(sessions, now);
        const overtimeHours = Math.max(0, workingHours - 9);
        const status = determineStatus(sessions, isOnLeave);

        let checkIn: Date | null = null;
        let checkOut: Date | null = null;

        if (sessions.length > 0) {
          checkIn = sessions[0]?.startTime || null;
          const lastSession = sessions[sessions.length - 1];
          checkOut = lastSession?.endTime || null;
        }

        return {
          id: dateKey || date.toISOString(),
          date: date.toISOString(),
          checkIn: checkIn?.toISOString() || null,
          checkOut: checkOut?.toISOString() || null,
          status,
          workingHours: parseFloat(workingHours.toFixed(2)),
          overtimeHours: parseFloat(overtimeHours.toFixed(2)),
          notes: null,
        };
      });

      const summary = {
        totalWorkingDays: attendances.filter((a) => a.status === "PRESENT")
          .length,
        totalPresentDays: attendances.filter((a) => a.status === "PRESENT")
          .length,
        totalAbsentDays: attendances.filter((a) => a.status === "ABSENT")
          .length,
        totalLeaveDays: attendances.filter((a) => a.status === "ON_LEAVE")
          .length,
        totalWorkingHours: parseFloat(
          attendances.reduce((sum, a) => sum + a.workingHours, 0).toFixed(2)
        ),
        totalOvertimeHours: parseFloat(
          attendances.reduce((sum, a) => sum + a.overtimeHours, 0).toFixed(2)
        ),
      };

      res.json({
        employee: {
          employeeCode: targetEmployee.employeeCode,
          name: `${targetEmployee.firstName} ${targetEmployee.lastName}`,
          department: targetEmployee.department,
          designation: targetEmployee.designation,
        },
        attendances,
        summary: {
          month: targetMonth,
          year: targetYear,
          ...summary,
        },
      });
    } catch (error) {
      console.error("Error fetching employee attendance:", error);
      res.status(500).json({ error: "Failed to fetch employee attendance" });
    }
  }
);

export default router;
