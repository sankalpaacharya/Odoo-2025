import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { sessionService } from "../services/session.service";
import { employeeService } from "../services/employee.service";

const router: Router = Router();

router.use(authenticateUser);

type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE"
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
  workingHours: number
): AttendanceStatus {
  if (sessions.length === 0) return "ABSENT";
  if (workingHours < 4) return "HALF_DAY";

  const firstSession = sessions[0];
  if (firstSession && firstSession.startTime.getHours() > 10) return "LATE";

  return "PRESENT";
}

router.get("/my-attendance", async (req, res) => {
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

    const workSessions = await sessionService.findSessionsByDateRange(
      employee.id,
      startDate,
      endDate
    );

    const sessionsByDate = workSessions.reduce((acc, session) => {
      const dateKey = session.date.toISOString().split("T")[0];
      if (dateKey) {
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(session);
      }
      return acc;
    }, {} as Record<string, typeof workSessions>);

    const datesInMonth: Date[] = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      datesInMonth.push(new Date(d));
    }

    const now = new Date();
    const attendances = datesInMonth.map((date) => {
      const dateKey = date.toISOString().split("T")[0];
      const sessions = (dateKey && sessionsByDate[dateKey]) || [];

      const workingHours = calculateWorkingHoursFromSessions(sessions, now);
      const overtimeHours = Math.max(0, workingHours - 9);
      const status = determineStatus(sessions, workingHours);

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

    const summary = {
      totalWorkingDays: attendances.filter((a) =>
        ["PRESENT", "LATE", "HALF_DAY"].includes(a.status)
      ).length,
      totalPresentDays: attendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length,
      totalAbsentDays: attendances.filter((a) => a.status === "ABSENT").length,
      totalLeaveDays: 0,
      totalHalfDays: attendances.filter((a) => a.status === "HALF_DAY").length,
      totalLateDays: attendances.filter((a) => a.status === "LATE").length,
      totalWorkingHours: parseFloat(
        attendances.reduce((sum, a) => sum + a.workingHours, 0).toFixed(2)
      ),
      totalOvertimeHours: parseFloat(
        attendances.reduce((sum, a) => sum + a.overtimeHours, 0).toFixed(2)
      ),
    };

    res.json({
      attendances,
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
});

router.get("/today", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee || !(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Support date parameter, default to today
    const dateParam = req.query.date as string | undefined;
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const allActiveEmployees = await employeeService.findActiveEmployees(
      employee.organizationId || undefined
    );

    const [activeSessions, todaySessions] = await Promise.all([
      Promise.all(
        allActiveEmployees.map((emp) =>
          sessionService.findActiveSession(emp.id)
        )
      ),
      Promise.all(
        allActiveEmployees.map((emp) =>
          sessionService.findSessionsByEmployeeAndDate(emp.id, targetDate)
        )
      ),
    ]);

    const activeSessionMap = new Map(
      activeSessions.filter((s) => s !== null).map((s) => [s!.employeeId, s])
    );
    const sessionMap = new Map(
      allActiveEmployees.map((emp, idx) => [emp.id, todaySessions[idx] || []])
    );

    const now = new Date();
    const formatted = allActiveEmployees.map((emp) => {
      const activeSession = activeSessionMap.get(emp.id);
      const sessions = sessionMap.get(emp.id) || [];

      const workingHours = calculateWorkingHoursFromSessions(sessions, now);
      const status = determineStatus(sessions, workingHours);

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
});

router.get("/employee/:employeeId", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { employeeId } = req.params;
    const { month, year } = req.query;

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

    const [targetEmployee, workSessions] = await Promise.all([
      employeeService.findById(employeeId),
      sessionService.findSessionsByDateRange(employeeId, startDate, endDate),
    ]);

    if (!targetEmployee) {
      return res.status(404).json({ error: "Target employee not found" });
    }

    const sessionsByDate = workSessions.reduce((acc, session) => {
      const dateKey = session.date.toISOString().split("T")[0];
      if (dateKey) {
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(session);
      }
      return acc;
    }, {} as Record<string, typeof workSessions>);

    const datesInMonth: Date[] = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      datesInMonth.push(new Date(d));
    }

    const now = new Date();
    const attendances = datesInMonth.map((date) => {
      const dateKey = date.toISOString().split("T")[0];
      const sessions = (dateKey && sessionsByDate[dateKey]) || [];

      const workingHours = calculateWorkingHoursFromSessions(sessions, now);
      const overtimeHours = Math.max(0, workingHours - 9);
      const status = determineStatus(sessions, workingHours);

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
      totalWorkingDays: attendances.filter((a) =>
        ["PRESENT", "LATE", "HALF_DAY"].includes(a.status)
      ).length,
      totalPresentDays: attendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length,
      totalAbsentDays: attendances.filter((a) => a.status === "ABSENT").length,
      totalLeaveDays: 0,
      totalHalfDays: attendances.filter((a) => a.status === "HALF_DAY").length,
      totalLateDays: attendances.filter((a) => a.status === "LATE").length,
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
});

export default router;
