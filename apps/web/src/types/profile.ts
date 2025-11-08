export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type ComponentType = "EARNING" | "DEDUCTION" | "BENEFIT";
export type Role = "ADMIN" | "EMPLOYEE" | "HR_OFFICER" | "PAYROLL_OFFICER";

export interface SalaryComponent {
  id: string;
  name: string;
  type: ComponentType;
  amount: string;
  isPercentage: boolean;
  isRecurring: boolean;
  description: string | null;
}

export interface ReportingManager {
  id: string;
  name: string;
  employeeCode: string;
  designation: string | null;
}

export interface Organization {
  id: string;
  companyName: string;
  logo: string | null;
}

export interface Salary {
  basicSalary: string;
  pfContribution: string;
  professionalTax: string;
  components: SalaryComponent[];
}

export interface ProfileData {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  phone: string | null;
  alternatePhone: string | null;
  image: string | null;
  profileImage: string | null;

  // Personal Information
  dateOfBirth: string | null;
  gender: Gender | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;

  // Resume Information
  about: string | null;
  jobLove: string | null;
  interests: string | null;

  // Bank Details
  accountNumber: string | null;
  bankName: string | null;
  ifscCode: string | null;
  panNumber: string | null;
  uanNumber: string | null;

  // Employment Details
  role: Role;
  department: string | null;
  designation: string | null;
  dateOfJoining: string;
  dateOfLeaving: string | null;
  employmentStatus: string;

  // Organization
  organization: Organization | null;

  // Reporting Manager
  reportingManager: ReportingManager | null;

  // Salary Information
  salary: Salary;

  // Permission flags
  currentUserRole?: Role;
  canEditSalary?: boolean;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  phone?: string | null;
  alternatePhone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  department?: string | null;
  designation?: string | null;
  profileImage?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  ifscCode?: string | null;
  panNumber?: string | null;
  uanNumber?: string | null;
  about?: string | null;
  jobLove?: string | null;
  interests?: string | null;
}

export interface UpdateSalaryPayload {
  basicSalary?: string | number;
  pfContribution?: string | number;
  professionalTax?: string | number;
}
