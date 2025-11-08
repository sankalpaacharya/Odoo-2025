import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { sessionService } from "../services/session.service";
import { attendanceService } from "../services/attendance.service";
import { employeeService } from "../services/employee.service";

const router: Router = Router();

router.use(authenticateUser);

router.get("/active", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const activeSession = await sessionService.findActiveSession(employee.id);

    if (!activeSession) {
      return res.json({ hasActiveSession: false, session: null });
    }

    res.json({
      hasActiveSession: true,
      session: {
        id: activeSession.id,
        startTime: activeSession.startTime.toISOString(),
        date: activeSession.date.toISOString(),
        breakStartTime: activeSession.breakStartTime?.toISOString() || null,
        breakEndTime: activeSession.breakEndTime?.toISOString() || null,
        totalBreakTime: activeSession.totalBreakTime
          ? parseFloat(activeSession.totalBreakTime.toString())
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active session" });
  }
});

router.post("/start", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    if (employee.employmentStatus !== "ACTIVE") {
      return res
        .status(403)
        .json({ error: "Only active employees can start a work session" });
    }

    const activeSession = await sessionService.findActiveSession(employee.id);

    if (activeSession) {
      return res.status(400).json({
        error: "You already have an active session",
        session: {
          id: activeSession.id,
          startTime: activeSession.startTime.toISOString(),
        },
      });
    }

    const now = new Date();
    const todayDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const newSession = await sessionService.createSession({
      employeeId: employee.id,
      date: todayDate,
      startTime: now,
    });

    res.json({
      success: true,
      message: "Work session started successfully",
      session: {
        id: newSession.id,
        startTime: newSession.startTime.toISOString(),
        date: newSession.date.toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to start work session" });
  }
});

router.post("/stop", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const activeSession = await sessionService.findActiveSession(employee.id);

    if (!activeSession) {
      return res.status(400).json({ error: "No active session found to stop" });
    }

    const now = new Date();
    const startTime = activeSession.startTime;
    const breakMinutes = activeSession.totalBreakTime
      ? parseFloat(activeSession.totalBreakTime.toString()) * 60
      : 0;

    const workingHours = await sessionService.calculateWorkingHours(
      startTime,
      now,
      breakMinutes
    );
    const overtimeHours = await sessionService.calculateOvertime(workingHours);

    const updatedSession = await sessionService.updateSession(
      activeSession.id,
      {
        endTime: now,
        isActive: false,
        workingHours,
        overtimeHours,
      }
    );

    const sessionDate = new Date(
      activeSession.date.getFullYear(),
      activeSession.date.getMonth(),
      activeSession.date.getDate()
    );

    const attendanceStatus = attendanceService.determineAttendanceStatus(
      workingHours,
      startTime
    );

    await attendanceService.upsertAttendance(
      employee.id,
      sessionDate,
      {
        checkIn: startTime,
        checkOut: now,
        workingHours,
        overtimeHours,
        status: attendanceStatus,
      },
      {
        checkOut: now,
        workingHours,
        overtimeHours,
        status: attendanceStatus,
      }
    );

    res.json({
      success: true,
      message: "Work session stopped successfully",
      session: {
        id: updatedSession.id,
        startTime: updatedSession.startTime.toISOString(),
        endTime: updatedSession.endTime?.toISOString(),
        workingHours,
        overtimeHours,
      },
    });
  } catch (error) {
    console.error("Error stopping session:", error);
    res.status(500).json({ error: "Failed to stop work session" });
  }
});

router.get("/today", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const today = new Date();
    const sessions = await sessionService.findSessionsByEmployeeAndDate(
      employee.id,
      today
    );

    const formatted = sessions.map((s) => ({
      id: s.id,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime?.toISOString() || null,
      isActive: s.isActive,
      workingHours: s.workingHours
        ? parseFloat(s.workingHours.toString())
        : null,
      overtimeHours: s.overtimeHours
        ? parseFloat(s.overtimeHours.toString())
        : 0,
      totalBreakTime: s.totalBreakTime
        ? parseFloat(s.totalBreakTime.toString())
        : 0,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch today's sessions" });
  }
});

router.post("/break/start", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const activeSession = await sessionService.findActiveSession(employee.id);

    if (!activeSession) {
      return res.status(400).json({ error: "No active session to take break" });
    }

    const updatedSession = await sessionService.startBreak(activeSession.id);

    res.json({
      success: true,
      message: "Break started",
      breakStartTime: updatedSession.breakStartTime?.toISOString(),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to start break" });
  }
});

router.post("/break/end", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const activeSession = await sessionService.findActiveSession(employee.id);

    if (!activeSession) {
      return res.status(400).json({ error: "No active session found" });
    }

    const updatedSession = await sessionService.endBreak(activeSession.id);

    const currentTotalBreak = updatedSession.totalBreakTime
      ? parseFloat(updatedSession.totalBreakTime.toString())
      : 0;

    const breakDuration =
      activeSession.breakStartTime && updatedSession.breakEndTime
        ? parseFloat(
            (
              (updatedSession.breakEndTime.getTime() -
                activeSession.breakStartTime.getTime()) /
              (1000 * 60 * 60)
            ).toFixed(2)
          )
        : 0;

    res.json({
      success: true,
      message: "Break ended",
      breakEndTime: updatedSession.breakEndTime?.toISOString(),
      breakDuration,
      totalBreakTime: currentTotalBreak,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to end break" });
  }
});

router.get("/today-hours", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const today = new Date();
    const sessions = await sessionService.findSessionsByEmployeeAndDate(
      employee.id,
      today
    );

    let totalMinutes = 0;
    const activeSession = sessions.find((s) => s.isActive);

    sessions.forEach((session) => {
      if (session.isActive && session.startTime) {
        const now = new Date();
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

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    res.json({
      totalMinutes,
      hours,
      minutes,
      formattedTime: `${hours}h ${minutes}m`,
      hasActiveSession: !!activeSession,
      sessionCount: sessions.length,
    });
  } catch (error) {
    console.error("Error fetching today's hours:", error);
    res.status(500).json({ error: "Failed to fetch today's hours" });
  }
});

export default router;
