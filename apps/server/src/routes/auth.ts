import { Router } from "express";
import type { Router as RouterType } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "@my-better-t-app/db";
import { auth } from "@my-better-t-app/auth";
import { generateEmployeeCode } from "@my-better-t-app/auth/utils/generate-employee-code";

const router: RouterType = Router();

const uploadsDir = path.join(__dirname, "../../uploads/logos");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|svg|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, SVG, and WebP files are allowed."
        )
      );
    }
  },
});

// Employee lookup endpoint - converts employee code to email
router.post("/employee-lookup", async (req, res) => {
  try {
    const { employeeCode } = req.body;

    if (!employeeCode) {
      return res.status(400).json({
        error: {
          message: "Employee code is required",
          statusText: "Bad Request",
        },
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeCode: employeeCode.toUpperCase() },
      include: { user: true },
    });

    if (!employee) {
      return res.status(404).json({
        error: {
          message: "Employee not found",
          statusText: "Not Found",
        },
      });
    }

    res.json({
      email: employee.user.email,
      name: employee.user.name,
    });
  } catch (error) {
    console.error("Employee lookup error:", error);
    res.status(500).json({
      error: {
        message: "Failed to lookup employee",
        statusText: "Internal Server Error",
      },
    });
  }
});

// Signup endpoint with employee creation
router.post("/signup", upload.single("logo"), async (req, res) => {
  try {
    const { email, firstName, lastName, companyName, password } = req.body;

    if (!email || !firstName || !lastName || !companyName || !password) {
      return res.status(400).json({
        error: {
          message: "All fields are required",
          statusText: "Bad Request",
        },
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: {
          message: "User with this email already exists",
          statusText: "Bad Request",
        },
      });
    }

    let organization = await prisma.organization.findUnique({
      where: { companyName },
    });

    if (!organization) {
      const logoPath = req.file ? `/uploads/logos/${req.file.filename}` : null;

      console.log("Logo upload info:", {
        hasFile: !!req.file,
        filename: req.file?.filename,
        logoPath,
      });

      organization = await prisma.organization.create({
        data: {
          companyName,
          logo: logoPath,
        },
      });
    }

    const employeeCode = await generateEmployeeCode(
      firstName,
      lastName,
      companyName,
      new Date()
    );

    const signupResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: `${firstName} ${lastName}`,
        // @ts-ignore - additional fields
        firstName,
        lastName,
        companyName,
      },
    });

    if (!signupResult || !signupResult.user) {
      throw new Error("Failed to create account");
    }

    const employee = await prisma.employee.create({
      data: {
        userId: signupResult.user.id,
        organizationId: organization.id,
        employeeCode,
        firstName,
        lastName,
        dateOfJoining: new Date(),
        role: "ADMIN",
        employmentStatus: "ACTIVE",
        basicSalary: 0,
        pfContribution: 0,
        professionalTax: 0,
      },
    });

    res.json({
      success: true,
      message: "Account created successfully! Logging you in...",
      data: {
        userId: signupResult.user.id,
        email: signupResult.user.email,
        employeeCode: employee.employeeCode,
        organization: {
          id: organization.id,
          companyName: organization.companyName,
          logo: organization.logo,
        },
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : "Failed to create account",
        statusText: "Internal Server Error",
      },
    });
  }
});

export default router;
