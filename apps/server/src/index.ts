import "dotenv/config";
import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@my-better-t-app/auth";
import attendanceRoutes from "./routes/attendance";
import employeeRoutes from "./routes/employee";
import prisma from "@my-better-t-app/db";
import { createEmployee } from "@my-better-t-app/auth/services/employee.service";
import { generateEmployeeCode } from "@my-better-t-app/auth/utils/generate-employee-code";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Employee lookup endpoint - converts employee code to email
app.post("/api/employee-lookup", async (req, res) => {
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

    // Look up the employee by employee code
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

// Better Auth handler - handles all authentication endpoints including login
app.all("/api/auth/*", toNodeHandler(auth));

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Signup endpoint with employee creation
app.post("/api/signup", async (req, res) => {
  try {
    const { email, firstName, lastName, companyName, password } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !companyName || !password) {
      return res.status(400).json({
        error: {
          message: "All fields are required",
          statusText: "Bad Request",
        },
      });
    }

    // Check if user already exists
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

    // Generate employee code
    const employeeCode = await generateEmployeeCode(
      firstName,
      lastName,
      companyName,
      new Date()
    );

    // Use Better Auth's signup to ensure proper account creation
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

    // Now create the employee record
    const employee = await prisma.employee.create({
      data: {
        userId: signupResult.user.id,
        employeeCode,
        firstName,
        lastName,
        dateOfJoining: new Date(),
        role: "ADMIN", // First user is admin
        employmentStatus: "ACTIVE",
        basicSalary: 0, // Can be updated later
        pfContribution: 0,
        professionalTax: 0,
      },
    });

    res.json({
      success: true,
      message: "Account created successfully! You can now sign in.",
      data: {
        userId: signupResult.user.id,
        email: signupResult.user.email,
        employeeCode: employee.employeeCode,
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

// Create employee endpoint (for HR/Admin)
app.post("/api/employees/create", async (req, res) => {
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
app.post("/api/employees/generate-code", async (req, res) => {
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

app.use("/api/attendance", attendanceRoutes);
app.use("/api/employee", employeeRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
