import { generateEmployeeCode, generateRandomPassword } from "../utils/generate-employee-code";

type Role = "ADMIN" | "EMPLOYEE" | "HR_OFFICER" | "PAYROLL_OFFICER";
type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

interface CreateEmployeeInput {
  // Personal Info
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
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
  dateOfJoining: Date;
  role?: Role;
  
  // Salary Info
  basicSalary: number;
  pfContribution?: number;
  professionalTax?: number;
  
  // Optional
  reportingManagerId?: string;
}

export async function createEmployee(input: CreateEmployeeInput) {
  try {
    // Generate employee code
    const employeeCode = await generateEmployeeCode(
      input.firstName,
      input.lastName,
      input.companyName,
      input.dateOfJoining
    );

    // Generate random password
    const generatedPassword = generateRandomPassword(12);

    return {
      success: true,
      data: {
        employeeCode,
        email: input.email,
        name: `${input.firstName} ${input.lastName}`,
        temporaryPassword: generatedPassword,
        employeeData: input,
      },
    };
  } catch (error) {
    console.error("Error creating employee:", error);
    throw new Error("Failed to create employee");
  }
}
