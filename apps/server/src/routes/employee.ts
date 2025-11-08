import { Router } from "express";
import type { Router as RouterType } from "express";
import db from "@my-better-t-app/db";
import { authenticateUser } from "../middleware/auth";
import { createEmployee } from "@my-better-t-app/auth/services/employee.service";
import { generateEmployeeCode } from "@my-better-t-app/auth/utils/generate-employee-code";
import { sendNewEmployeeEmail } from "../services/email.service";

const router: RouterType = Router();

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
        role: true,
        department: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch employee" });
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
