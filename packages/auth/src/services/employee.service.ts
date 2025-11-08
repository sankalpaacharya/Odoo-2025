import prisma from "@my-better-t-app/db";
import { generateEmployeeCode, generateRandomPassword } from "../utils/generate-employee-code";
import { auth } from "../index";

type Role = "ADMIN" | "EMPLOYEE" | "HR_OFFICER" | "PAYROLL_OFFICER";
type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

interface CreateEmployeeInput {
  // Personal Info
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date | string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Company Info
  companyName: string;
  department?: string;
  designation?: string;
  dateOfJoining: Date | string; // Accept both Date and string (ISO format)
  role?: Role;

  // Salary Info
  basicSalary: number;
  pfContribution?: number;
  professionalTax?: number;

  // Optional
  reportingManagerId?: string;
  organizationId?: string;
}

export async function createEmployee(input: CreateEmployeeInput) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error(`User with email ${input.email} already exists`);
    }

    // Convert string dates to Date objects if needed
    const dateOfJoining = typeof input.dateOfJoining === "string" ? new Date(input.dateOfJoining) : input.dateOfJoining;
    const dateOfBirth = input.dateOfBirth ? (typeof input.dateOfBirth === "string" ? new Date(input.dateOfBirth) : input.dateOfBirth) : undefined;
    // Generate employee code
    const employeeCode = await generateEmployeeCode(input.firstName, input.lastName, input.companyName, dateOfJoining);

    // Generate random password
    const generatedPassword = generateRandomPassword(12);

    // Create user account using better-auth
    const signupResult = await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: generatedPassword,
        name: `${input.firstName} ${input.lastName}`,
      },
    });

    if (!signupResult || !signupResult.user) {
      throw new Error("Failed to create user account");
    }

    // Update user with additional fields
    await prisma.user.update({
      where: { id: signupResult.user.id },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        companyName: input.companyName,
      },
    });

    // Find or create organization
    let organizationId = input.organizationId;

    if (!organizationId) {
      // Try to find existing organization by company name
      let organization = await prisma.organization.findUnique({
        where: { companyName: input.companyName },
      });

      // If organization doesn't exist, create it
      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            companyName: input.companyName,
          },
        });
      }

      organizationId = organization.id;
    }

    // Create employee record
    const employee = await prisma.employee.create({
      data: {
        userId: signupResult.user.id,
        employeeCode,
        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        dateOfBirth: dateOfBirth,
        gender: input.gender,
        phone: input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        country: input.country,
        postalCode: input.postalCode,
        role: input.role || "EMPLOYEE",
        department: input.department,
        designation: input.designation,
        dateOfJoining: dateOfJoining,
        basicSalary: input.basicSalary,
        pfContribution: input.pfContribution || 0,
        professionalTax: input.professionalTax || 0,
        reportingManagerId: input.reportingManagerId,
        employmentStatus: "ACTIVE",
        organizationId,
      },
    });

    const result = { user: signupResult.user, employee };

    return {
      success: true,
      data: {
        employeeCode,
        email: input.email,
        name: `${input.firstName} ${input.lastName}`,
        temporaryPassword: generatedPassword,
        userId: result.user.id,
        employeeId: result.employee.id,
        companyName: input.companyName,
      },
    };
  } catch (error) {
    console.error("Error creating employee:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create employee");
  }
}
