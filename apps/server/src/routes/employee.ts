import { Router } from "express";
import type { Router as RouterType } from "express";
import db from "@my-better-t-app/db";
import { authenticateUser } from "../middleware/auth";
import { createEmployee } from "@my-better-t-app/auth/services/employee.service";
import { generateEmployeeCode } from "@my-better-t-app/auth/utils/generate-employee-code";

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
    const result = await createEmployee(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create employee",
    });
  }
});

// Generate employee code endpoint (for preview/testing)
router.post("/generate-code", async (req, res) => {
  try {
    const { firstName, lastName, companyName, dateOfJoining } = req.body;
    const code = await generateEmployeeCode(
      firstName,
      lastName,
      companyName,
      new Date(dateOfJoining)
    );
    res.json({ success: true, employeeCode: code });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate code",
    });
  }
});

export default router;
