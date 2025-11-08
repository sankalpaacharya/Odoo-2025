import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateUser } from "../middleware/auth";
import { requirePermission } from "../middleware/permission";
import { employeeService } from "../services/employee.service";
import { leaveService } from "../services/leave.service";

const router: Router = Router();

// Create uploads directory if it doesn't exist
// Using the packages/db/uploads directory where all uploaded files are stored
const uploadsDir = path.join(__dirname, "../../../../../packages/db/uploads/leave-attachments");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed."));
    }
  },
});

router.use(authenticateUser);

router.get("/my-leaves", requirePermission("Time Off", "View"), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const { status, leaveType, year } = req.query;

    const leaves = await leaveService.findByEmployee(employee.id, {
      status: status as any,
      leaveType: leaveType as any,
      year: year ? parseInt(year as string) : undefined,
    });

    const formatted = leaves.map((leave) => ({
      id: leave.id,
      employeeId: leave.employeeId,
      leaveType: leave.leaveType,
      startDate: leave.startDate.toISOString(),
      endDate: leave.endDate.toISOString(),
      totalDays: parseFloat(leave.totalDays.toString()),
      reason: leave.reason,
      attachment: leave.attachment,
      status: leave.status,
      approvedBy: leave.approvedBy,
      approvedAt: leave.approvedAt?.toISOString() || null,
      rejectionReason: leave.rejectionReason,
      createdAt: leave.createdAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching my leaves:", error);
    res.status(500).json({ error: "Failed to fetch leaves" });
  }
});

router.get("/my-balances", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const { year } = req.query;
    const targetYear = year
      ? parseInt(year as string)
      : new Date().getFullYear();

    const balances = await leaveBalanceService.findByEmployeeAndYear(
      employee.id,
      targetYear
    );

    const formatted = balances.map((balance) => ({
      id: balance.id,
      leaveType: balance.leaveType,
      allocated: parseFloat(balance.allocated.toString()),
      used: parseFloat(balance.used.toString()),
      remaining: parseFloat(balance.remaining.toString()),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching leave balances:", error);
    res.status(500).json({ error: "Failed to fetch leave balances" });
  }
});

router.post("/request", requirePermission("Time Off", "Create"), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const isAdmin = await employeeService.hasRole(userId, ["ADMIN", "HR_OFFICER"]);
    const targetEmployeeId = employeeId && isAdmin ? employeeId : employee.id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    const attachmentPath = req.file ? req.file.filename : null;

    const leave = await leaveService.createLeave({
      employeeId: targetEmployeeId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      attachment: attachmentPath,
    });

    res.json({
      id: leave.id,
      employeeId: leave.employeeId,
      leaveType: leave.leaveType,
      startDate: leave.startDate.toISOString(),
      endDate: leave.endDate.toISOString(),
      totalDays: parseFloat(leave.totalDays.toString()),
      reason: leave.reason,
      status: leave.status,
      attachment: leave.attachment,
      approvedBy: leave.approvedBy,
      approvedAt: leave.approvedAt?.toISOString() || null,
      rejectionReason: leave.rejectionReason,
      createdAt: leave.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating leave request:", error);
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds 5MB limit" });
      }
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create leave request" });
  }
});

router.get("/all", requirePermission("Time Off", "View"), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const isAdmin = await employeeService.hasRole(userId, ["ADMIN", "HR_OFFICER"]);

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { status, leaveType, department, year, page = "1", limit = "50" } = req.query;

    const {
      leaves,
      total,
      page: currentPage,
      limit: currentLimit,
    } = await leaveService.findAllWithFilters({
      status: status as any,
      leaveType: leaveType as any,
      department: department as string,
      year: year ? parseInt(year as string) : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    const formatted = leaves.map((leave) => ({
      id: leave.id,
      employeeId: leave.employeeId,
      employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
      employeeCode: leave.employee.employeeCode,
      department: leave.employee.department || "N/A",
      leaveType: leave.leaveType,
      startDate: leave.startDate.toISOString(),
      endDate: leave.endDate.toISOString(),
      totalDays: parseFloat(leave.totalDays.toString()),
      reason: leave.reason,
      attachment: leave.attachment,
      status: leave.status,
      approvedBy: leave.approvedBy,
      approvedAt: leave.approvedAt?.toISOString() || null,
      rejectionReason: leave.rejectionReason,
      createdAt: leave.createdAt.toISOString(),
    }));

    res.json({
      leaves: formatted,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res.status(500).json({ error: "Failed to fetch leaves" });
  }
});

router.patch("/:leaveId/approve", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { leaveId } = req.params;
    const { leaveType, startDate, endDate, totalDays } = req.body;

    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const isAdmin = await employeeService.hasRole(userId, ["ADMIN", "HR_OFFICER"]);

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedLeave = await leaveService.approveLeave(
      leaveId,
      employee.employeeCode,
      true,
      {
        leaveType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        totalDays: totalDays ? parseFloat(totalDays) : undefined,
      }
    );

    res.json({
      id: updatedLeave.id,
      employeeId: updatedLeave.employeeId,
      leaveType: updatedLeave.leaveType,
      startDate: updatedLeave.startDate.toISOString(),
      endDate: updatedLeave.endDate.toISOString(),
      totalDays: parseFloat(updatedLeave.totalDays.toString()),
      reason: updatedLeave.reason,
      status: updatedLeave.status,
      approvedBy: updatedLeave.approvedBy,
      approvedAt: updatedLeave.approvedAt?.toISOString() || null,
      rejectionReason: updatedLeave.rejectionReason,
      createdAt: updatedLeave.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error approving leave:", error);
    const message = error instanceof Error ? error.message : "Failed to approve leave";
    res.status(400).json({ error: message });
  }
});

router.patch("/:leaveId/reject", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { leaveId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const isAdmin = await employeeService.hasRole(userId, ["ADMIN", "HR_OFFICER"]);

    if (!isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedLeave = await leaveService.rejectLeave(leaveId, employee.employeeCode, rejectionReason);

    res.json({
      id: updatedLeave.id,
      employeeId: updatedLeave.employeeId,
      leaveType: updatedLeave.leaveType,
      startDate: updatedLeave.startDate.toISOString(),
      endDate: updatedLeave.endDate.toISOString(),
      totalDays: parseFloat(updatedLeave.totalDays.toString()),
      reason: updatedLeave.reason,
      status: updatedLeave.status,
      approvedBy: updatedLeave.approvedBy,
      approvedAt: updatedLeave.approvedAt?.toISOString() || null,
      rejectionReason: updatedLeave.rejectionReason,
      createdAt: updatedLeave.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error rejecting leave:", error);
    const message = error instanceof Error ? error.message : "Failed to reject leave";
    res.status(400).json({ error: message });
  }
});

router.delete("/:leaveId", requirePermission("Time Off", "Delete"), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { leaveId } = req.params;

    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const leave = await leaveService.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    const isAdmin = await employeeService.hasRole(userId, ["ADMIN", "HR_OFFICER"]);

    if (leave.employeeId !== employee.id && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete attachment file if exists
    if (leave.attachment) {
      const filePath = path.join(uploadsDir, leave.attachment);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await leaveService.cancelLeave(leaveId);

    res.json({ message: "Leave request cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling leave:", error);
    const message = error instanceof Error ? error.message : "Failed to cancel leave";
    res.status(400).json({ error: message });
  }
});

router.get("/attachment/:filename", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { filename } = req.params;

    const employee = await employeeService.findByUserId(userId);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const filePath = path.join(uploadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Verify that the file belongs to a leave request the user can access
    const leaves = await leaveService.findByEmployee(employee.id, {});
    const isAdmin = await employeeService.hasRole(userId, ["ADMIN", "HR_OFFICER"]);

    let hasAccess = false;
    if (isAdmin) {
      // Admin can access all attachments
      hasAccess = true;
    } else {
      // Check if this attachment belongs to user's leave
      hasAccess = leaves.some((leave) => leave.attachment === filename);
    }

    if (!hasAccess) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    res.status(500).json({ error: "Failed to download attachment" });
  }
});

export default router;
