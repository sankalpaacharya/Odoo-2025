import { Router } from "express";
import type { Router as RouterType } from "express";
import prisma from "@my-better-t-app/db";
import { authenticateUser } from "../middleware/auth";

const router: RouterType = Router();

// Get all permissions for a role
router.get("/:role", authenticateUser, async (req, res) => {
  try {
    const { role } = req.params;

    const permissions = await prisma.rolePermission.findMany({
      where: { role },
    });

    // Group permissions by module
    const groupedPermissions: Record<string, string[]> = {};
    permissions.forEach((perm) => {
      if (!groupedPermissions[perm.module]) {
        groupedPermissions[perm.module] = [];
      }
      groupedPermissions[perm.module].push(perm.permission);
    });

    res.json(groupedPermissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    res.status(500).json({
      error: {
        message: "Failed to fetch permissions",
        statusText: "Internal Server Error",
      },
    });
  }
});

// Update permissions for a role
router.put("/:role", authenticateUser, async (req, res) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body; // { "Dashboard": ["View", "Export"], ... }

    // Validate input
    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({
        error: {
          message: "Invalid permissions data",
          statusText: "Bad Request",
        },
      });
    }

    // Validate role exists
    const validRoles = ["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER", "EMPLOYEE"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        error: {
          message: "Invalid role",
          statusText: "Bad Request",
        },
      });
    }

    // Create new permissions records
    const permissionRecords: Array<{ role: string; module: string; permission: string }> = [];
    for (const [module, perms] of Object.entries(permissions)) {
      if (!Array.isArray(perms)) continue;
      for (const permission of perms as string[]) {
        if (permission && typeof permission === "string") {
          permissionRecords.push({
            role,
            module,
            permission,
          });
        }
      }
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete existing permissions for this role
      await tx.rolePermission.deleteMany({
        where: { role },
      });

      // Create new permissions if any
      if (permissionRecords.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionRecords,
        });
      }
    });

    res.json({
      success: true,
      message: "Permissions updated successfully",
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    res.status(500).json({
      error: {
        message: "Failed to update permissions",
        details: error instanceof Error ? error.message : "Unknown error",
        statusText: "Internal Server Error",
      },
    });
  }
});

// Initialize default permissions (can be called once to seed)
router.post("/initialize", authenticateUser, async (_req, res) => {
  try {
    const defaultPermissions = {
      EMPLOYEE: {
        Dashboard: ["View"],
        Employees: ["View"],
        Attendance: ["View", "Create"],
        "Time Off": ["View", "Create"],
        Payroll: ["View"],
        Reports: ["View"],
        Profile: ["View", "Edit"],
      },
      HR_OFFICER: {
        Dashboard: ["View", "Export Data"],
        Employees: ["View", "Create", "Edit", "Export"],
        Attendance: ["View", "Create", "Edit", "Approve", "Export"],
        "Time Off": ["View", "Create", "Edit", "Approve", "Export"],
        Payroll: ["View"],
        Reports: ["View", "Generate", "Export"],
        Settings: ["View"],
        Profile: ["View", "Edit"],
      },
      PAYROLL_OFFICER: {
        Dashboard: ["View", "Export Data"],
        Employees: ["View", "Export"],
        Attendance: ["View", "Export"],
        "Time Off": ["View", "Export"],
        Payroll: ["View", "Create", "Edit", "Process", "Export"],
        Reports: ["View", "Generate", "Export"],
        Settings: ["View"],
        Profile: ["View", "Edit"],

      },
      ADMIN: {
        Dashboard: ["View", "Export Data"],
        Employees: ["View", "Create", "Edit", "Delete", "Export"],
        Attendance: ["View", "Create", "Edit", "Delete", "Approve", "Export"],
        "Time Off": ["View", "Create", "Edit", "Delete", "Approve", "Export"],
        Payroll: ["View", "Create", "Edit", "Delete", "Process", "Export"],
        Reports: ["View", "Generate", "Export", "Schedule"],
        Settings: ["View", "Edit", "Manage Users", "System Configuration"],
        Profile: ["View", "Edit"],

      },
    };

    const permissionRecords = [];
    for (const [role, modules] of Object.entries(defaultPermissions)) {
      for (const [module, perms] of Object.entries(modules)) {
        for (const permission of perms) {
          permissionRecords.push({
            role: role as any,
            module,
            permission,
          });
        }
      }
    }

    // Clear existing permissions
    await prisma.rolePermission.deleteMany({});

    // Insert default permissions
    await prisma.rolePermission.createMany({
      data: permissionRecords,
    });

    res.json({
      success: true,
      message: "Default permissions initialized successfully",
    });
  } catch (error) {
    console.error("Error initializing permissions:", error);
    res.status(500).json({
      error: {
        message: "Failed to initialize permissions",
        statusText: "Internal Server Error",
      },
    });
  }
});

export default router;