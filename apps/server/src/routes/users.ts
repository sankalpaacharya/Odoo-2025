import { Router } from "express";
import type { Router as RouterType } from "express";
import db from "@my-better-t-app/db";
import { authenticateUser } from "../middleware/auth";

const router: RouterType = Router();

router.use(authenticateUser);

// Get all users with their employee details
router.get("/", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Get the current user's employee record to check permissions
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: {
        role: true,
      },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Only admins and HR officers can view all users
    if (!["ADMIN", "HR_OFFICER"].includes(currentEmployee.role)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Fetch all employees with their user details
    const employees = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    // Format the response
    const formattedUsers = employees.map((emp) => ({
      id: emp.id,
      userId: emp.userId,
      username: `${emp.firstName} ${emp.lastName}`,
      loginId: emp.employeeCode,
      email: emp.user.email,
      role: emp.role,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user role
router.patch("/:employeeId/role", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { employeeId } = req.params;
    const { role } = req.body;

    // Get the current user's employee record to check permissions
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: {
        role: true,
        organizationId: true,
      },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Only admins can change roles
    if (currentEmployee.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can change user roles" });
    }

    // Validate the role
    const validRoles = ["ADMIN", "EMPLOYEE", "HR_OFFICER", "PAYROLL_OFFICER"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check if the employee exists and belongs to the same organization
    const targetEmployee = await db.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        organizationId: true,
      },
    });

    if (!targetEmployee) {
      return res.status(404).json({ error: "Target employee not found" });
    }

    if (targetEmployee.organizationId !== currentEmployee.organizationId) {
      return res.status(403).json({ error: "Cannot modify employees from other organizations" });
    }

    // Update the employee role
    const updatedEmployee = await db.employee.update({
      where: { id: employeeId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      employee: {
        id: updatedEmployee.id,
        userId: updatedEmployee.userId,
        username: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
        loginId: updatedEmployee.employeeCode,
        email: updatedEmployee.user.email,
        role: updatedEmployee.role,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

export default router;
