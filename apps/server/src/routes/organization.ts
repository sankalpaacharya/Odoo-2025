import { Router } from "express";
import type { Router as RouterType } from "express";
import prisma from "@my-better-t-app/db";
import { authenticateUser } from "../middleware/auth";

const router: RouterType = Router();

router.get("/me", authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: "Unauthorized",
          statusText: "Unauthorized",
        },
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        organization: true,
      },
    });

    if (!employee?.organization) {
      return res.status(404).json({
        error: {
          message: "Organization not found",
          statusText: "Not Found",
        },
      });
    }

    res.json({
      id: employee.organization.id,
      companyName: employee.organization.companyName,
      logo: employee.organization.logo,
    });
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({
      error: {
        message: "Failed to fetch organization",
        statusText: "Internal Server Error",
      },
    });
  }
});

export default router;
