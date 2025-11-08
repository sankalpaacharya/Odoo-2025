import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import { employeeService } from "../services/employee.service";
import { payrollService } from "../services/payroll.service";

const router: Router = Router();

router.use(authenticateUser);

router.get("/payrun/:month/:year", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee || !(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 2000) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    const payrun = await payrollService.getPayrunWithPayslips(month, year);

    res.json(payrun);
  } catch (error) {
    console.error("Error fetching payrun:", error);
    res.status(500).json({ error: "Failed to fetch payrun" });
  }
});

router.post("/payrun/generate", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee || !(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { month, year } = req.body;

    if (
      !month ||
      !year ||
      month < 1 ||
      month > 12 ||
      year < 2000 ||
      year > 2100
    ) {
      return res.status(400).json({ error: "Invalid month or year" });
    }

    const payrun = await payrollService.getOrCreatePayrun(month, year);

    if (payrun.payslips.length > 0) {
      const result = await payrollService.getPayrunWithPayslips(month, year);
      return res.json(result);
    }

    await payrollService.generatePayslips(
      payrun.id,
      month,
      year,
      employee.organizationId || undefined
    );

    const result = await payrollService.getPayrunWithPayslips(month, year);

    res.json(result);
  } catch (error) {
    console.error("Error generating payrun:", error);
    res.status(500).json({ error: "Failed to generate payrun" });
  }
});

router.post("/payrun/:payrunId/validate", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee || !(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { payrunId } = req.params;

    const result = await payrollService.validatePayrun(
      payrunId,
      employee.employeeCode
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error validating payrun:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to validate payrun" });
  }
});

router.post("/payrun/:payrunId/done", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee || !(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { payrunId } = req.params;

    const result = await payrollService.markPayrunAsDone(payrunId);

    res.json(result);
  } catch (error: any) {
    console.error("Error marking payrun as done:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to mark payrun as done" });
  }
});

router.get("/payslips/my", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const year = req.query.year
      ? parseInt(req.query.year as string)
      : undefined;

    const payslips = await payrollService.getPayslipsByEmployee(
      employee.id,
      year
    );

    res.json(payslips);
  } catch (error) {
    console.error("Error fetching payslips:", error);
    res.status(500).json({ error: "Failed to fetch payslips" });
  }
});

router.get("/warnings", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee || !(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const warnings = await payrollService.getPayrollWarnings(
      employee.organizationId || undefined
    );

    res.json(warnings);
  } catch (error) {
    console.error("Error fetching payroll warnings:", error);
    res.status(500).json({ error: "Failed to fetch payroll warnings" });
  }
});

router.get("/payruns/recent", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee || !(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;

    const payruns = await payrollService.getRecentPayruns(
      employee.organizationId || undefined,
      limit
    );

    res.json(payruns);
  } catch (error) {
    console.error("Error fetching recent payruns:", error);
    res.status(500).json({ error: "Failed to fetch recent payruns" });
  }
});

router.get("/statistics", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee || !(await employeeService.isAdmin(userId))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const view = (req.query.view as "monthly" | "annually") || "monthly";

    const statistics = await payrollService.getPayrollStatistics(
      employee.organizationId || undefined,
      view
    );

    res.json(statistics);
  } catch (error) {
    console.error("Error fetching payroll statistics:", error);
    res.status(500).json({ error: "Failed to fetch payroll statistics" });
  }
});

export default router;
