import type { Request, Response, NextFunction } from "express";
import prisma from "@my-better-t-app/db";

/**
 * Middleware to check if user has required permission for a specific module and action
 * @param module - The module name (e.g., "Employees", "Dashboard", "Attendance")
 * @param permission - The required permission (e.g., "View", "Create", "Edit", "Delete")
 */
export function requirePermission(module: string, permission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "User not authenticated" 
        });
      }

      // Get the user's employee record to find their role
      const employee = await prisma.employee.findUnique({
        where: { userId },
        select: { role: true },
      });

      if (!employee) {
        return res.status(403).json({ 
          error: "Forbidden",
          message: "Employee record not found" 
        });
      }

      const userRole = employee.role;

      // Check if the user's role has the required permission for the module
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          role: userRole,
          module: module,
          permission: permission,
        },
      });

      if (!rolePermission) {
        console.warn(
          `Permission denied: ${userRole} does not have "${permission}" permission for "${module}"`
        );
        return res.status(403).json({ 
          error: "Forbidden",
          message: `You don't have permission to ${permission.toLowerCase()} ${module.toLowerCase()}` 
        });
      }

      // User has permission, continue to next middleware/route handler
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ 
        error: "Internal Server Error",
        message: "Failed to check permissions" 
      });
    }
  };
}

/**
 * Middleware to check if user has ANY of the required permissions (OR logic)
 */
export function requireAnyPermission(checks: Array<{ module: string; permission: string }>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ 
          error: "Unauthorized",
          message: "User not authenticated" 
        });
      }

      const employee = await prisma.employee.findUnique({
        where: { userId },
        select: { role: true },
      });

      if (!employee) {
        return res.status(403).json({ 
          error: "Forbidden",
          message: "Employee record not found" 
        });
      }

      const userRole = employee.role;

      // Check if user has ANY of the required permissions
      for (const check of checks) {
        const rolePermission = await prisma.rolePermission.findFirst({
          where: {
            role: userRole,
            module: check.module,
            permission: check.permission,
          },
        });

        if (rolePermission) {
          // User has at least one required permission
          next();
          return;
        }
      }

      // User doesn't have any of the required permissions
      return res.status(403).json({ 
        error: "Forbidden",
        message: "You don't have the required permissions for this action" 
      });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ 
        error: "Internal Server Error",
        message: "Failed to check permissions" 
      });
    }
  };
}
