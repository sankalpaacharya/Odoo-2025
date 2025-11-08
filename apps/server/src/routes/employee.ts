import { Router } from "express";
import type { Router as RouterType } from "express";
import db from "@my-better-t-app/db";
import { authenticateUser } from "../middleware/auth";
import { createEmployee } from "@my-better-t-app/auth/services/employee.service";
import { generateEmployeeCode } from "@my-better-t-app/auth/utils/generate-employee-code";
import { sendNewEmployeeEmail } from "../services/email.service";

const router: RouterType = Router();

// Helper function to map attendance status to UI status
const mapAttendanceStatus = (dbStatus?: string): string => {
  if (!dbStatus) return "absent";

  switch (dbStatus) {
    case "PRESENT":
    case "LATE":
    case "HALF_DAY":
      return "present";
    case "ON_LEAVE":
      return "on_leave";
    case "ABSENT":
    case "HOLIDAY":
    case "WEEKEND":
    default:
      return "absent";
  }
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
      // Get today's attendance for current employee
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAttendance = await db.attendance.findFirst({
        where: {
          employeeId: currentEmployee.id,
          date: today,
        },
      });

      return res.json([
        {
          id: currentEmployee.id,
          name: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
          role: currentEmployee.role.toLowerCase(),
          status: mapAttendanceStatus(todayAttendance?.status),
          employeeCode: currentEmployee.employeeCode,
          department: currentEmployee.department,
          designation: currentEmployee.designation,
          employmentStatus: currentEmployee.employmentStatus,
        },
      ]);
    }

    // Fetch all employees with only ACTIVE employment status
    const employees = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
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
      },
      orderBy: {
        firstName: "asc",
      },
    });

    // Get today's attendance for all employees
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await db.attendance.findMany({
      where: {
        date: today,
        employeeId: {
          in: employees.map((e) => e.id),
        },
      },
    });

    // Create a map of employee ID to attendance status
    const attendanceMap = new Map(attendances.map((a) => [a.employeeId, a.status]));

    // Format the response
    const formattedEmployees = employees.map((emp) => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      role: emp.role.toLowerCase(),
      status: mapAttendanceStatus(attendanceMap.get(emp.id)),
      employeeCode: emp.employeeCode,
      department: emp.department,
      designation: emp.designation,
      employmentStatus: emp.employmentStatus,
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
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
