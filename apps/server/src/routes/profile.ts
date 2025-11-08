import { auth } from "@my-better-t-app/auth";
import db, {
  UPLOADS_CONFIG,
  getUploadPath,
  getUploadUrl,
  type Gender,
} from "@my-better-t-app/db";
import type { Router as RouterType } from "express";
import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { authenticateUser } from "../middleware/auth";

const router: RouterType = Router();

// Use centralized uploads configuration
const profileImagesDir = UPLOADS_CONFIG.PROFILE_IMAGES;
if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profileImagesDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, and WebP files are allowed."
        )
      );
    }
  },
});

router.use(authenticateUser);

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Old password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters long" });
    }

    // Get user's email for authentication
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify old password using better-auth's signIn method (same verification as login)
    try {
      const signInResult = await auth.api.signInEmail({
        body: {
          email: user.email,
          password: oldPassword,
        },
      });

      if (!signInResult?.user) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
    } catch (error) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Use better-auth's internal password hashing by creating a new signup with the new password
    // Then we'll copy that hashed password to the existing account
    // This ensures we use the exact same hashing method as better-auth

    // Create a temporary unique email to get the password hash
    const tempEmail = `temp_${Date.now()}_${Math.random()}@temp.local`;
    const tempSignup = await auth.api.signUpEmail({
      body: {
        email: tempEmail,
        password: newPassword,
        name: "Temp User",
      },
    });

    if (!tempSignup?.user) {
      throw new Error("Failed to hash password");
    }

    // Get the hashed password from the temporary account
    const tempAccount = await db.account.findFirst({
      where: {
        userId: tempSignup.user.id,
        providerId: "credential",
      },
      select: {
        password: true,
      },
    });

    if (!tempAccount?.password) {
      throw new Error("Failed to get hashed password");
    }

    const hashedPassword = tempAccount.password;

    // Delete the temporary user and account
    await db.account.deleteMany({
      where: { userId: tempSignup.user.id },
    });
    await db.user.delete({
      where: { id: tempSignup.user.id },
    });

    // Get the real account record
    const account = await db.account.findFirst({
      where: {
        userId,
        providerId: "credential",
      },
    });

    if (!account) {
      return res
        .status(404)
        .json({ error: "Password authentication not found for this user" });
    }

    // Update password in account table with the properly hashed password
    await db.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Get complete profile data
router.get("/", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const targetEmployeeId = req.query.employeeId as string | undefined;

    // Get current user's employee record
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: { id: true, role: true },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Check if requesting another employee's profile
    const isViewingOtherProfile =
      targetEmployeeId && targetEmployeeId !== currentEmployee.id;

    // If viewing other profile, check permissions
    if (isViewingOtherProfile) {
      const allowedRoles = ["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER"];
      if (!allowedRoles.includes(currentEmployee.role)) {
        return res.status(403).json({
          error: "You don't have permission to view other employees' profiles",
        });
      }
    }

    const employeeIdToFetch = targetEmployeeId || currentEmployee.id;

    const employee = await db.employee.findUnique({
      where: { id: employeeIdToFetch },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        alternatePhone: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        profileImage: true,
        about: true,
        jobLove: true,
        interests: true,
        skills: true,
        certifications: true,
        accountNumber: true,
        bankName: true,
        ifscCode: true,
        panNumber: true,
        uanNumber: true,
        role: true,
        department: true,
        designation: true,
        dateOfJoining: true,
        dateOfLeaving: true,
        employmentStatus: true,
        basicSalary: true,
        pfContribution: true,
        professionalTax: true,
        hraPercentage: true,
        standardAllowanceAmount: true,
        performanceBonusPercentage: true,
        leaveTravelPercentage: true,
        pfPercentage: true,
        reportingManagerId: true,
        reportingManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            designation: true,
          },
        },
        organization: {
          select: {
            id: true,
            companyName: true,
            logo: true,
          },
        },
        user: {
          select: {
            email: true,
            image: true,
          },
        },
        salaryComponents: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            type: true,
            amount: true,
            isPercentage: true,
            isRecurring: true,
            description: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Format the response
    const profileData = {
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName,
      email: employee.user.email,
      phone: employee.phone,
      alternatePhone: employee.alternatePhone,
      image: employee.user.image,
      profileImage: employee.profileImage,

      // Personal Information
      dateOfBirth: employee.dateOfBirth?.toISOString(),
      gender: employee.gender,
      address: employee.address,
      city: employee.city,
      state: employee.state,
      country: employee.country,
      postalCode: employee.postalCode,

      // Resume Information
      about: employee.about,
      jobLove: employee.jobLove,
      interests: employee.interests,
      skills: employee.skills as any,
      certifications: employee.certifications as any,

      // Bank Details
      accountNumber: employee.accountNumber,
      bankName: employee.bankName,
      ifscCode: employee.ifscCode,
      panNumber: employee.panNumber,
      uanNumber: employee.uanNumber,

      // Employment Details
      role: employee.role,
      department: employee.department,
      designation: employee.designation,
      dateOfJoining: employee.dateOfJoining.toISOString(),
      dateOfLeaving: employee.dateOfLeaving?.toISOString(),
      employmentStatus: employee.employmentStatus,

      // Organization
      organization: employee.organization
        ? {
            id: employee.organization.id,
            companyName: employee.organization.companyName,
            logo: employee.organization.logo,
          }
        : null,

      // Reporting Manager
      reportingManager: employee.reportingManager
        ? {
            id: employee.reportingManager.id,
            name: `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}`,
            employeeCode: employee.reportingManager.employeeCode,
            designation: employee.reportingManager.designation,
          }
        : null,

      // Salary Information - Only include if user has permission
      salary: {
        basicSalary: employee.basicSalary.toString(),
        pfContribution: employee.pfContribution.toString(),
        professionalTax: employee.professionalTax.toString(),
        hraPercentage: employee.hraPercentage.toString(),
        standardAllowanceAmount: employee.standardAllowanceAmount.toString(),
        performanceBonusPercentage:
          employee.performanceBonusPercentage.toString(),
        leaveTravelPercentage: employee.leaveTravelPercentage.toString(),
        pfPercentage: employee.pfPercentage.toString(),
        components: employee.salaryComponents.map((comp) => ({
          id: comp.id,
          name: comp.name,
          type: comp.type,
          amount: comp.amount.toString(),
          isPercentage: comp.isPercentage,
          isRecurring: comp.isRecurring,
          description: comp.description,
        })),
      },

      // Include role info for permission checks on frontend
      currentUserRole: currentEmployee.role,
      canEditSalary: ["ADMIN", "PAYROLL_OFFICER"].includes(
        currentEmployee.role
      ),
    };

    res.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update profile data
router.put("/", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const {
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      phone,
      alternatePhone,
      address,
      city,
      state,
      country,
      postalCode,
      department,
      designation,
      accountNumber,
      bankName,
      ifscCode,
      panNumber,
      uanNumber,
      about,
      jobLove,
      interests,
      skills,
      certifications,
    } = req.body;

    // Find employee first
    const employee = await db.employee.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Update employee data
    const updatedEmployee = await db.employee.update({
      where: { id: employee.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(middleName !== undefined && { middleName }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender: gender as Gender }),
        ...(phone !== undefined && { phone }),
        ...(alternatePhone !== undefined && { alternatePhone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(country !== undefined && { country }),
        ...(postalCode !== undefined && { postalCode }),
        ...(department !== undefined && { department }),
        ...(designation !== undefined && { designation }),
        ...(accountNumber !== undefined && { accountNumber }),
        ...(bankName !== undefined && { bankName }),
        ...(ifscCode !== undefined && { ifscCode }),
        ...(panNumber !== undefined && { panNumber }),
        ...(uanNumber !== undefined && { uanNumber }),
        ...(about !== undefined && { about }),
        ...(jobLove !== undefined && { jobLove }),
        ...(interests !== undefined && { interests }),
        ...(skills !== undefined && { skills }),
        ...(certifications !== undefined && { certifications }),
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        middleName: true,
        dateOfBirth: true,
        gender: true,
        phone: true,
        alternatePhone: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
        department: true,
        designation: true,
        accountNumber: true,
        bankName: true,
        ifscCode: true,
        panNumber: true,
        uanNumber: true,
        about: true,
        jobLove: true,
        interests: true,
        skills: true,
        certifications: true,
      },
    });

    res.json({
      success: true,
      data: {
        ...updatedEmployee,
        dateOfBirth: updatedEmployee.dateOfBirth?.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Update salary information (Admin/HR/Payroll only)
router.put("/salary", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const {
      monthlyWage,
      pfPercentage,
      professionalTax,
      hraPercentage,
      standardAllowanceAmount,
      performanceBonusPercentage,
      leaveTravelPercentage,
    } = req.body;

    // Check if user has permission
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: { id: true, role: true },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const allowedRoles = ["ADMIN", "PAYROLL_OFFICER"];
    if (!allowedRoles.includes(currentEmployee.role)) {
      return res.status(403).json({
        error: "You don't have permission to update salary information",
      });
    }

    // Get target employee ID from query param or use current user
    const targetEmployeeId =
      (req.query.employeeId as string) || currentEmployee.id;

    // Calculate pfContribution if pfPercentage is provided
    let pfContributionValue = undefined;
    if (monthlyWage !== undefined && pfPercentage !== undefined) {
      const basicSalary = Number(monthlyWage) * 0.5;
      pfContributionValue = (basicSalary * Number(pfPercentage)) / 100;
    }

    // Update salary data
    const updatedEmployee = await db.employee.update({
      where: { id: targetEmployeeId },
      data: {
        ...(monthlyWage !== undefined && { basicSalary: Number(monthlyWage) }),
        ...(pfContributionValue !== undefined && {
          pfContribution: pfContributionValue,
        }),
        ...(professionalTax !== undefined && {
          professionalTax: Number(professionalTax),
        }),
        ...(hraPercentage !== undefined && {
          hraPercentage: Number(hraPercentage),
        }),
        ...(standardAllowanceAmount !== undefined && {
          standardAllowanceAmount: Number(standardAllowanceAmount),
        }),
        ...(performanceBonusPercentage !== undefined && {
          performanceBonusPercentage: Number(performanceBonusPercentage),
        }),
        ...(leaveTravelPercentage !== undefined && {
          leaveTravelPercentage: Number(leaveTravelPercentage),
        }),
        ...(pfPercentage !== undefined && {
          pfPercentage: Number(pfPercentage),
        }),
      },
      select: {
        id: true,
        basicSalary: true,
        pfContribution: true,
        professionalTax: true,
        hraPercentage: true,
        standardAllowanceAmount: true,
        performanceBonusPercentage: true,
        leaveTravelPercentage: true,
        pfPercentage: true,
      },
    });

    res.json({
      success: true,
      data: {
        ...updatedEmployee,
        basicSalary: updatedEmployee.basicSalary.toString(),
        pfContribution: updatedEmployee.pfContribution.toString(),
        professionalTax: updatedEmployee.professionalTax.toString(),
        hraPercentage: updatedEmployee.hraPercentage.toString(),
        standardAllowanceAmount:
          updatedEmployee.standardAllowanceAmount.toString(),
        performanceBonusPercentage:
          updatedEmployee.performanceBonusPercentage.toString(),
        leaveTravelPercentage: updatedEmployee.leaveTravelPercentage.toString(),
        pfPercentage: updatedEmployee.pfPercentage.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating salary:", error);
    res.status(500).json({ error: "Failed to update salary information" });
  }
});

// Get salary components
router.get("/salary-components", async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const employee = await db.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        salaryComponents: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            type: true,
            amount: true,
            isPercentage: true,
            isRecurring: true,
            description: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const components = employee.salaryComponents.map((comp) => ({
      id: comp.id,
      name: comp.name,
      type: comp.type,
      amount: comp.amount.toString(),
      isPercentage: comp.isPercentage,
      isRecurring: comp.isRecurring,
      description: comp.description,
    }));

    res.json(components);
  } catch (error) {
    console.error("Error fetching salary components:", error);
    res.status(500).json({ error: "Failed to fetch salary components" });
  }
});

// Upload profile image
router.post(
  "/upload-image",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const userId = (req as any).user.id;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Generate the URL path using the helper function
      const imagePath = getUploadUrl(req.file.filename, "profile");

      // Find employee first
      const employee = await db.employee.findUnique({
        where: { userId },
        select: { id: true, profileImage: true },
      });

      if (!employee) {
        // Delete uploaded file if employee not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: "Employee not found" });
      }

      // Delete old profile image if exists
      if (employee.profileImage) {
        try {
          const oldImagePath = getUploadPath(employee.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.warn("Failed to delete old profile image:", err);
          // Continue anyway - don't fail the upload if we can't delete the old image
        }
      }

      // Update employee profile image
      await db.employee.update({
        where: { id: employee.id },
        data: { profileImage: imagePath },
      });

      res.json({
        success: true,
        profileImage: imagePath,
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      // Delete uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  }
);

// Upload profile image
router.post(
  "/upload-image",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const userId = (req as any).user.id;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Generate the URL path using the helper function
      const imagePath = getUploadUrl(req.file.filename, "profile");

      // Find employee first
      const employee = await db.employee.findUnique({
        where: { userId },
        select: { id: true, profileImage: true },
      });

      if (!employee) {
        // Delete uploaded file if employee not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: "Employee not found" });
      }

      // Delete old profile image if exists
      if (employee.profileImage) {
        try {
          const oldImagePath = getUploadPath(employee.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.warn("Failed to delete old profile image:", err);
          // Continue anyway - don't fail the upload if we can't delete the old image
        }
      }

      // Update employee profile image
      await db.employee.update({
        where: { id: employee.id },
        data: { profileImage: imagePath },
      });

      res.json({
        success: true,
        profileImage: imagePath,
      });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      // Delete uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  }
);

router.post("/salary-components", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const {
      employeeId,
      name,
      type,
      amount,
      isPercentage,
      isRecurring,
      description,
    } = req.body;

    // Check if user has permission
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: { id: true, role: true },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const allowedRoles = ["ADMIN", "PAYROLL_OFFICER"];
    if (!allowedRoles.includes(currentEmployee.role)) {
      return res.status(403).json({
        error: "You don't have permission to manage salary components",
      });
    }

    const targetEmployeeId = employeeId || currentEmployee.id;

    const component = await db.salaryComponent.create({
      data: {
        employeeId: targetEmployeeId,
        name,
        type,
        amount: Number(amount),
        isPercentage: isPercentage ?? false,
        isRecurring: isRecurring ?? true,
        description,
      },
    });

    res.json({
      success: true,
      data: {
        ...component,
        amount: component.amount.toString(),
      },
    });
  } catch (error) {
    console.error("Error creating salary component:", error);
    res.status(500).json({ error: "Failed to create salary component" });
  }
});

// Update salary component (Admin/Payroll only)
router.put("/salary-components/:componentId", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { componentId } = req.params;
    const { name, type, amount, isPercentage, isRecurring, description } =
      req.body;

    // Check if user has permission
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: { id: true, role: true },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const allowedRoles = ["ADMIN", "PAYROLL_OFFICER"];
    if (!allowedRoles.includes(currentEmployee.role)) {
      return res.status(403).json({
        error: "You don't have permission to update salary components",
      });
    }

    const component = await db.salaryComponent.update({
      where: { id: componentId },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(isPercentage !== undefined && { isPercentage }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({
      success: true,
      data: {
        ...component,
        amount: component.amount.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating salary component:", error);
    res.status(500).json({ error: "Failed to update salary component" });
  }
});

// Delete salary component (Admin/Payroll only)
router.delete("/salary-components/:componentId", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { componentId } = req.params;

    // Check if user has permission
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: { id: true, role: true },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const allowedRoles = ["ADMIN", "PAYROLL_OFFICER"];
    if (!allowedRoles.includes(currentEmployee.role)) {
      return res.status(403).json({
        error: "You don't have permission to delete salary components",
      });
    }

    await db.salaryComponent.update({
      where: { id: componentId },
      data: { isActive: false },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting salary component:", error);
    res.status(500).json({ error: "Failed to delete salary component" });
  }
});

// Get salary report data for an employee
router.get("/salary-report/:employeeId", async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { employeeId } = req.params;
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : new Date().getFullYear();

    // Check if user has permission
    const currentEmployee = await db.employee.findUnique({
      where: { userId },
      select: { id: true, role: true },
    });

    if (!currentEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const allowedRoles = ["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER"];
    if (
      !allowedRoles.includes(currentEmployee.role) &&
      currentEmployee.id !== employeeId
    ) {
      return res.status(403).json({
        error: "You don't have permission to view salary reports",
      });
    }

    const employee = await db.employee.findUnique({
      where: { id: employeeId },
      select: {
        firstName: true,
        lastName: true,
        designation: true,
        dateOfJoining: true,
        basicSalary: true,
        hraPercentage: true,
        standardAllowanceAmount: true,
        performanceBonusPercentage: true,
        leaveTravelPercentage: true,
        pfPercentage: true,
        professionalTax: true,
        organization: {
          select: {
            companyName: true,
          },
        },
        salaryComponents: {
          where: {
            isActive: true,
          },
          select: {
            name: true,
            type: true,
            amount: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const monthlyWage = parseFloat(employee.basicSalary.toString());
    const basicSalary = monthlyWage * 0.5;

    // Calculate earnings
    const hraPercentage = parseFloat(employee.hraPercentage.toString());
    const houseRentAllowance = (basicSalary * hraPercentage) / 100;

    const standardAllowance = parseFloat(
      employee.standardAllowanceAmount.toString()
    );

    const performanceBonusPercentage = parseFloat(
      employee.performanceBonusPercentage.toString()
    );
    const performanceBonus = (basicSalary * performanceBonusPercentage) / 100;

    const leaveTravelPercentage = parseFloat(
      employee.leaveTravelPercentage.toString()
    );
    const leaveTravelAllowance = (basicSalary * leaveTravelPercentage) / 100;

    const totalPredefinedComponents =
      basicSalary +
      houseRentAllowance +
      standardAllowance +
      performanceBonus +
      leaveTravelAllowance;

    const fixedAllowance = Math.max(0, monthlyWage - totalPredefinedComponents);

    const earnings = [
      {
        name: "Basic Salary",
        monthlyAmount: basicSalary,
        yearlyAmount: basicSalary * 12,
      },
      {
        name: "House Rent Allowance",
        monthlyAmount: houseRentAllowance,
        yearlyAmount: houseRentAllowance * 12,
      },
      {
        name: "Standard Allowance",
        monthlyAmount: standardAllowance,
        yearlyAmount: standardAllowance * 12,
      },
      {
        name: "Performance Bonus",
        monthlyAmount: performanceBonus,
        yearlyAmount: performanceBonus * 12,
      },
      {
        name: "Leave Travel Allowance",
        monthlyAmount: leaveTravelAllowance,
        yearlyAmount: leaveTravelAllowance * 12,
      },
      {
        name: "Fixed Allowance",
        monthlyAmount: fixedAllowance,
        yearlyAmount: fixedAllowance * 12,
      },
    ];

    // Add custom earnings
    employee.salaryComponents
      .filter((c) => c.type === "EARNING")
      .forEach((comp) => {
        const amount = parseFloat(comp.amount.toString());
        earnings.push({
          name: comp.name,
          monthlyAmount: amount,
          yearlyAmount: amount * 12,
        });
      });

    // Calculate deductions
    const pfPercentage = parseFloat(employee.pfPercentage.toString());
    const pfDeduction = (basicSalary * pfPercentage) / 100;
    const professionalTax = parseFloat(employee.professionalTax.toString());

    const deductions = [
      {
        name: "PF Deduction",
        monthlyAmount: pfDeduction,
        yearlyAmount: pfDeduction * 12,
      },
      {
        name: "Professional Tax",
        monthlyAmount: professionalTax,
        yearlyAmount: professionalTax * 12,
      },
    ];

    // Add custom deductions
    employee.salaryComponents
      .filter((c) => c.type === "DEDUCTION")
      .forEach((comp) => {
        const amount = parseFloat(comp.amount.toString());
        deductions.push({
          name: comp.name,
          monthlyAmount: amount,
          yearlyAmount: amount * 12,
        });
      });

    const reportData = {
      companyName: employee.organization?.companyName || "Company Name",
      employeeName: `${employee.firstName} ${employee.lastName}`,
      designation: employee.designation || "N/A",
      dateOfJoining: new Date(employee.dateOfJoining).toLocaleDateString(
        "en-GB"
      ),
      salaryEffectiveFrom: `01/01/${year}`,
      earnings,
      deductions,
    };

    res.json(reportData);
  } catch (error) {
    console.error("Error fetching salary report:", error);
    res.status(500).json({ error: "Failed to fetch salary report" });
  }
});

export default router;
