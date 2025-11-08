import { Router } from "express";
import type { Router as RouterType } from "express";
import db from "@my-better-t-app/db";
import { authenticateUser } from "../middleware/auth";
import { createEmployee } from "@my-better-t-app/auth/services/employee.service";
import { generateEmployeeCode } from "@my-better-t-app/auth/utils/generate-employee-code";
import { sendNewEmployeeEmail } from "../services/email.service";
import { sessionService } from "../services/session.service";

const router: RouterType = Router();

// Helper to calculate status from sessions and leaves
const calculateEmployeeStatus = async (employeeId: string, sessions: any[], today: Date): Promise<string> => {
  // Check if employee has approved leave for today
  const approvedLeave = await db.leave.findFirst({
    where: {
      employeeId,
      status: "APPROVED",
      startDate: { lte: today },
      endDate: { gte: today },
    },
  });

  if (approvedLeave) {
    return "on_leave";
  }

  if (sessions.length === 0) return "absent";

  const now = new Date();
  let totalMinutes = 0;
  let hasActiveSession = false;

  sessions.forEach((session) => {
    if (session.isActive) {
      hasActiveSession = true;
      const sessionMinutes = Math.floor((now.getTime() - session.startTime.getTime()) / (1000 * 60));
      const breakMinutes = session.totalBreakTime ? parseFloat(session.totalBreakTime.toString()) * 60 : 0;
      totalMinutes += Math.max(0, sessionMinutes - breakMinutes);
    } else if (session.workingHours) {
      totalMinutes += parseFloat(session.workingHours.toString()) * 60;
    }
  });

  const workingHours = totalMinutes / 60;

  // If they have an active session or worked today, they're present
  if (hasActiveSession || workingHours > 0) {
    return "present";
  }

  return "absent";
};

router.use(authenticateUser);

router.get("/me", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const employee = await db.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        middleName: true,
        role: true,
        department: true,
        designation: true,
        dateOfJoining: true,
        employmentStatus: true,
        phone: true,
        profileImage: true,
        user: {
          select: {
            email: true,
            image: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName,
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      dateOfJoining: employee.dateOfJoining.toISOString(),
      employmentStatus: employee.employmentStatus,
      phone: employee.phone,
      email: employee.user.email,
      image: employee.user.image,
      profileImage: employee.profileImage,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});

// Get all employees with their latest attendance status
router.get("/", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Get the current user's employee record to check permissions
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        department: true,
        designation: true,
        employmentStatus: true,
        organizationId: true,
      },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Roles that can see all employees
    const allowedRoles = ["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER"];
    const canViewAll = allowedRoles.includes(currentEmployee.role);

    // If user can't view all, return only their own data
    if (!canViewAll) {
      // Get today's sessions for current employee
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySessions = await sessionService.findSessionsByEmployeeAndDate(currentEmployee.id, today);

      return res.json([
        {
          id: currentEmployee.id,
          name: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
          role: currentEmployee.role.toLowerCase(),
          status: await calculateEmployeeStatus(currentEmployee.id, todaySessions, today),
          employeeCode: currentEmployee.employeeCode,
          department: currentEmployee.department,
          designation: currentEmployee.designation,
          employmentStatus: currentEmployee.employmentStatus,
        },
      ]);
    }

    // Fetch all employees with only ACTIVE employment status from the same organization
    const employees = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
        organizationId: currentEmployee.organizationId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        employeeCode: true,
        department: true,
        designation: true,
        employmentStatus: true,
        organizationId: true,
        profileImage: true,
      },
      orderBy: {
        firstName: "asc",
      },
    });

    // Get today's sessions for all employees
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allSessionsToday = await Promise.all(employees.map((emp) => sessionService.findSessionsByEmployeeAndDate(emp.id, today)));

    // Create a map of employee ID to sessions
    const sessionsMap = new Map(employees.map((emp, idx) => [emp.id, allSessionsToday[idx] || []]));

    // Format the response
    const formattedEmployees = await Promise.all(
      employees.map(async (emp) => {
        const sessions = sessionsMap.get(emp.id) || [];

        return {
          id: emp.id,
          name: `${emp.firstName} ${emp.lastName}`,
          role: emp.role.toLowerCase(),
          status: await calculateEmployeeStatus(emp.id, sessions, today),
          employeeCode: emp.employeeCode,
          department: emp.department,
          designation: emp.designation,
          employmentStatus: emp.employmentStatus,
          profileImage: emp.profileImage,
        };
      })
    );

    res.json(formattedEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

router.get("/active-list", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const employees = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
        organizationId: currentEmployee.organizationId,
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: true,
        designation: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    const formatted = employees.map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department || "N/A",
      designation: emp.designation || "N/A",
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching active employees:", error);
    res.status(500).json({ error: "Failed to fetch active employees" });
  }
});

// Create employee endpoint (for HR/Admin)
router.post("/create", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Fetch the logged-in user's company information
    const currentUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        companyName: true,
      },
    });

    if (!currentUser || !currentUser.companyName) {
      return res.status(400).json({
        success: false,
        error: "Your account doesn't have a company name set. Please contact your administrator.",
      });
    }

    // Add company name from the current user's session
    const employeeData = {
      ...req.body,
      companyName: currentUser.companyName,
    };

    const result = await createEmployee(employeeData);

    if (result.success && result.data) {
      // Send welcome email with credentials
      const emailResult = await sendNewEmployeeEmail({
        employeeName: result.data.name,
        email: result.data.email,
        employeeCode: result.data.employeeCode,
        temporaryPassword: result.data.temporaryPassword,
        companyName: result.data.companyName,
      });

      if (!emailResult.success) {
        console.warn("Failed to send welcome email:", emailResult.error);
        // Don't fail the entire request if email fails
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to create employee",
    });
  }
});

// Generate employee code endpoint (for preview/testing)
router.post("/generate-code", async (req, res) => {
  try {
    const { firstName, lastName, companyName, dateOfJoining } = req.body;
    const code = await generateEmployeeCode(firstName, lastName, companyName, new Date(dateOfJoining));
    res.json({ success: true, employeeCode: code });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate code",
    });
  }
});

export default router;
