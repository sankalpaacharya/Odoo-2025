import { Router } from "express";
import db from "@my-better-t-app/db";
import { authenticateUser } from "../middleware/auth";

const router: Router = Router();

router.use(authenticateUser);

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

    const employee = await db.employee.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const attendances = await db.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

router.get("/today", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const employee = await db.employee.findUnique({
      where: { userId },
      select: { role: true },
    });

    if (
      !employee ||
      !["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER"].includes(employee.role)
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await db.attendance.findMany({
      where: { date: today },
      include: {
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });

    const formatted = attendances.map((a) => ({
      employeeId: a.employeeId,
      employeeName: `${a.employee.firstName} ${a.employee.lastName}`,
      employeeCode: a.employee.employeeCode,
      department: a.employee.department || "N/A",
      checkIn: a.checkIn?.toISOString() || null,
      checkOut: a.checkOut?.toISOString() || null,
      workingHours: a.workingHours ? parseFloat(a.workingHours.toString()) : 0,
      status: a.status,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch today's attendance" });
  }
});

export default router;
