import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { attendanceService } from "../services/attendance.service";
import { sessionService } from "../services/session.service";
import { employeeService } from "../services/employee.service";

const router: Router = Router();

router.use(authenticateUser);

router.get("/my-attendance", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { month, year } = req.query;

    const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const [attendances, workSessions] = await Promise.all([
      attendanceService.findByEmployeeAndDateRange(employee.id, startDate, endDate),
      sessionService.findSessionsByDateRange(employee.id, startDate, endDate),
    ]);

    const sessionsByDate = workSessions.reduce((acc, session) => {
      const dateKey = session.date.toISOString().split("T")[0];
      if (dateKey) {
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(session);
      }
      return acc;
    }, {} as Record<string, typeof workSessions>);

    const enriched = attendances.map((att) => {
      const dateKey = att.date.toISOString().split("T")[0];
      const sessions = (dateKey && sessionsByDate[dateKey]) || [];

      return {
        id: att.id,
        date: att.date.toISOString(),
        checkIn: att.checkIn?.toISOString() || null,
        checkOut: att.checkOut?.toISOString() || null,
        status: att.status,
        workingHours: att.workingHours ? parseFloat(att.workingHours.toString()) : 0,
        overtimeHours: att.overtimeHours ? parseFloat(att.overtimeHours.toString()) : 0,
        notes: att.notes,
        sessions: sessions.map((s: any) => {
          const startTime = new Date(s.startTime);
          const endTime = s.endTime ? new Date(s.endTime) : new Date();
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

    const summary = await attendanceService.calculateMonthlySummary(employee.id, targetMonth, targetYear);

    res.json({
      attendances: enriched,
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [attendances, allActiveEmployees] = await Promise.all([
      attendanceService.findByDateWithEmployees(today),
      employeeService.findActiveEmployees(employee.organizationId || undefined),
    ]);

    const activeSessions = await Promise.all(allActiveEmployees.map((emp) => sessionService.findActiveSession(emp.id)));

    const sessionMap = new Map(activeSessions.filter((s) => s !== null).map((s) => [s!.employeeId, s]));

    const formatted = allActiveEmployees.map((emp) => {
      const attendance = attendances.find((a) => a.employeeId === emp.id);
      const activeSession = sessionMap.get(emp.id);

      return {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeCode,
        department: emp.department || "N/A",
        checkIn: attendance?.checkIn?.toISOString() || null,
        checkOut: attendance?.checkOut?.toISOString() || null,
        workingHours: attendance?.workingHours ? parseFloat(attendance.workingHours.toString()) : 0,
        status: attendance?.status || "ABSENT",
        isCurrentlyActive: !!activeSession,
        activeSessionStart: activeSession?.startTime.toISOString() || null,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ error: "Failed to fetch today's attendance" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    if (!(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { startDate: startDateStr, endDate: endDateStr, department, status, employeeCode, page, limit } = req.query;

    const result = await attendanceService.findAllWithFilters({
      startDate: startDateStr ? new Date(startDateStr as string) : undefined,
      endDate: endDateStr ? new Date(endDateStr as string) : undefined,
      department: department as string,
      status: status as any,
      employeeCode: employeeCode as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    const formatted = result.attendances.map((a) => ({
      id: a.id,
      employeeId: a.employeeId,
      employeeName: `${a.employee.firstName} ${a.employee.lastName}`,
      employeeCode: a.employee.employeeCode,
      department: a.employee.department || "N/A",
      designation: a.employee.designation || "N/A",
      date: a.date.toISOString(),
      checkIn: a.checkIn?.toISOString() || null,
      checkOut: a.checkOut?.toISOString() || null,
      workingHours: a.workingHours ? parseFloat(a.workingHours.toString()) : 0,
      overtimeHours: a.overtimeHours ? parseFloat(a.overtimeHours.toString()) : 0,
      status: a.status,
      notes: a.notes,
    }));

    res.json({
      attendances: formatted,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching all attendances:", error);
    res.status(500).json({ error: "Failed to fetch attendances" });
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

    const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const [targetEmployee, attendances] = await Promise.all([
      employeeService.findById(employeeId),
      attendanceService.findByEmployeeAndDateRange(employeeId, startDate, endDate),
    ]);

    if (!targetEmployee) {
      return res.status(404).json({ error: "Target employee not found" });
    }

    const formatted = attendances.map((a) => ({
      id: a.id,
      date: a.date.toISOString(),
      checkIn: a.checkIn?.toISOString() || null,
      checkOut: a.checkOut?.toISOString() || null,
      status: a.status,
      workingHours: a.workingHours ? parseFloat(a.workingHours.toString()) : 0,
      overtimeHours: a.overtimeHours ? parseFloat(a.overtimeHours.toString()) : 0,
      notes: a.notes,
    }));

    const summary = await attendanceService.calculateMonthlySummary(employeeId, targetMonth, targetYear);

    res.json({
      employee: {
        employeeCode: targetEmployee.employeeCode,
        name: `${targetEmployee.firstName} ${targetEmployee.lastName}`,
        department: targetEmployee.department,
        designation: targetEmployee.designation,
      },
      attendances: formatted,
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

router.get("/summary", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    if (!(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

    const summary = await attendanceService.calculateOrganizationSummary(targetMonth, targetYear);

    res.json({
      month: targetMonth,
      year: targetYear,
      summary,
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({ error: "Failed to fetch attendance summary" });
  }
});

export default router;
