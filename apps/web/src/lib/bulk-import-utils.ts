import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface EmployeeImportRow {
  fullName?: string; // Input field that gets split
  firstName: string; // Derived from fullName or provided directly
  lastName: string; // Derived from fullName or provided directly
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  department?: string;
  designation?: string;
  dateOfJoining: string;
  role?: "ADMIN" | "EMPLOYEE" | "HR_OFFICER" | "PAYROLL_OFFICER";
  basicSalary: number;
  pfContribution?: number;
  professionalTax?: number;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ParsedImportData {
  data: EmployeeImportRow[];
  errors: ValidationError[];
  warnings: string[];
}

const REQUIRED_FIELDS = ["email", "dateOfJoining", "basicSalary"];

const REQUIRED_FIELD_LABELS = {
  fullName: "Full Name",
  email: "Email",
  dateOfJoining: "Date of Joining",
  basicSalary: "Basic Salary",
};

const FIELD_LABELS: Record<keyof EmployeeImportRow, string> = {
  fullName: "Full Name",
  firstName: "First Name",
  lastName: "Last Name",
  middleName: "Middle Name",
  email: "Email",
  phone: "Phone",
  dateOfBirth: "Date of Birth",
  gender: "Gender",
  address: "Address",
  city: "City",
  state: "State",
  country: "Country",
  postalCode: "Postal Code",
  department: "Department",
  designation: "Designation",
  dateOfJoining: "Date of Joining",
  role: "Role",
  basicSalary: "Basic Salary",
  pfContribution: "PF Contribution",
  professionalTax: "Professional Tax",
};

export const SAMPLE_TEMPLATE_HEADERS = Object.keys(REQUIRED_FIELD_LABELS);

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function validateRow(row: any, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if either fullName or (firstName AND lastName) is provided
  const hasFullName = row.fullName && row.fullName.toString().trim() !== "";
  const hasFirstName = row.firstName && row.firstName.toString().trim() !== "";
  const hasLastName = row.lastName && row.lastName.toString().trim() !== "";

  if (!hasFullName && !(hasFirstName && hasLastName)) {
    errors.push({
      row: rowIndex,
      field: "fullName",
      message: "Either Full Name OR (First Name AND Last Name) is required",
    });
  }

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!row[field] || row[field].toString().trim() === "") {
      errors.push({
        row: rowIndex,
        field,
        message: `${
          FIELD_LABELS[field as keyof EmployeeImportRow]
        } is required`,
      });
    }
  }

  // Validate email format
  if (row.email && !validateEmail(row.email)) {
    errors.push({
      row: rowIndex,
      field: "email",
      message: "Invalid email format",
    });
  }

  // Validate dates
  if (row.dateOfJoining && !validateDate(row.dateOfJoining)) {
    errors.push({
      row: rowIndex,
      field: "dateOfJoining",
      message: "Invalid date format. Use YYYY-MM-DD",
    });
  }

  if (row.dateOfBirth && !validateDate(row.dateOfBirth)) {
    errors.push({
      row: rowIndex,
      field: "dateOfBirth",
      message: "Invalid date format. Use YYYY-MM-DD",
    });
  }

  // Validate basic salary
  if (row.basicSalary) {
    const salary = parseFloat(row.basicSalary);
    if (isNaN(salary) || salary <= 0) {
      errors.push({
        row: rowIndex,
        field: "basicSalary",
        message: "Basic salary must be a positive number",
      });
    }
  }

  // Validate gender
  if (
    row.gender &&
    !["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"].includes(row.gender)
  ) {
    errors.push({
      row: rowIndex,
      field: "gender",
      message: "Gender must be MALE, FEMALE, OTHER, or PREFER_NOT_TO_SAY",
    });
  }

  // Validate role
  if (
    row.role &&
    !["ADMIN", "EMPLOYEE", "HR_OFFICER", "PAYROLL_OFFICER"].includes(row.role)
  ) {
    errors.push({
      row: rowIndex,
      field: "role",
      message: "Role must be ADMIN, EMPLOYEE, HR_OFFICER, or PAYROLL_OFFICER",
    });
  }

  return errors;
}

function parseFullName(fullName: string): {
  firstName: string;
  lastName: string;
  middleName?: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] }; // Use same name if only one word
  } else if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  } else {
    // 3 or more parts: first is firstName, last is lastName, middle parts are middleName
    return {
      firstName: parts[0],
      middleName: parts.slice(1, -1).join(" "),
      lastName: parts[parts.length - 1],
    };
  }
}

export function parseCSV(file: File): Promise<ParsedImportData> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log("CSV Parse results:", results);
        const errors: ValidationError[] = [];
        const warnings: string[] = [];
        const validData: EmployeeImportRow[] = [];

        if (results.errors && results.errors.length > 0) {
          results.errors.forEach((err: any) => {
            errors.push({
              row: err.row || 0,
              field: "file",
              message: err.message || "Parse error",
            });
          });
        }

        results.data.forEach((row: any, index: number) => {
          console.log(`Processing row ${index + 2}:`, row);
          const rowErrors = validateRow(row, index + 2); // +2 because row 1 is header
          errors.push(...rowErrors);

          if (rowErrors.length === 0) {
            // Parse name - use fullName if provided, otherwise use firstName/lastName
            let firstName: string,
              lastName: string,
              middleName: string | undefined;

            if (row.fullName && row.fullName.trim()) {
              const parsed = parseFullName(row.fullName);
              firstName = parsed.firstName;
              lastName = parsed.lastName;
              middleName = parsed.middleName || row.middleName?.trim();
            } else {
              firstName = row.firstName?.trim();
              lastName = row.lastName?.trim();
              middleName = row.middleName?.trim();
            }

            validData.push({
              firstName,
              lastName,
              middleName: middleName || undefined,
              email: row.email?.trim().toLowerCase(),
              phone: row.phone?.trim() || undefined,
              dateOfBirth: row.dateOfBirth?.trim() || undefined,
              gender: row.gender?.trim() || undefined,
              address: row.address?.trim() || undefined,
              city: row.city?.trim() || undefined,
              state: row.state?.trim() || undefined,
              country: row.country?.trim() || undefined,
              postalCode: row.postalCode?.trim() || undefined,
              department: row.department?.trim() || undefined,
              designation: row.designation?.trim() || undefined,
              dateOfJoining: row.dateOfJoining?.trim(),
              role: row.role?.trim() || "EMPLOYEE",
              basicSalary: parseFloat(row.basicSalary),
              pfContribution: row.pfContribution
                ? parseFloat(row.pfContribution)
                : undefined,
              professionalTax: row.professionalTax
                ? parseFloat(row.professionalTax)
                : undefined,
            });
          }
        });

        if (results.data.length === 0) {
          warnings.push("File is empty");
        }

        console.log("CSV Parse summary:", {
          validData: validData.length,
          errors: errors.length,
          warnings,
        });
        resolve({ data: validData, errors, warnings });
      },
      error: (error) => {
        console.error("CSV Parse error:", error);
        resolve({
          data: [],
          errors: [{ row: 0, field: "file", message: error.message }],
          warnings: [],
        });
      },
    });
  });
}

export function parseExcel(file: File): Promise<ParsedImportData> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        console.log("Excel Parse data:", jsonData);

        const errors: ValidationError[] = [];
        const warnings: string[] = [];
        const validData: EmployeeImportRow[] = [];

        jsonData.forEach((row: any, index: number) => {
          console.log(`Processing Excel row ${index + 2}:`, row);
          const rowErrors = validateRow(row, index + 2);
          errors.push(...rowErrors);

          if (rowErrors.length === 0) {
            // Parse name - use fullName if provided, otherwise use firstName/lastName
            let firstName: string,
              lastName: string,
              middleName: string | undefined;

            if (row.fullName && row.fullName.toString().trim()) {
              const parsed = parseFullName(row.fullName.toString());
              firstName = parsed.firstName;
              lastName = parsed.lastName;
              middleName =
                parsed.middleName || row.middleName?.toString().trim();
            } else {
              firstName = row.firstName?.toString().trim();
              lastName = row.lastName?.toString().trim();
              middleName = row.middleName?.toString().trim();
            }

            validData.push({
              firstName,
              lastName,
              middleName: middleName || undefined,
              email: row.email?.toString().trim().toLowerCase(),
              phone: row.phone?.toString().trim() || undefined,
              dateOfBirth: row.dateOfBirth?.toString().trim() || undefined,
              gender: row.gender?.toString().trim() || undefined,
              address: row.address?.toString().trim() || undefined,
              city: row.city?.toString().trim() || undefined,
              state: row.state?.toString().trim() || undefined,
              country: row.country?.toString().trim() || undefined,
              postalCode: row.postalCode?.toString().trim() || undefined,
              department: row.department?.toString().trim() || undefined,
              designation: row.designation?.toString().trim() || undefined,
              dateOfJoining: row.dateOfJoining?.toString().trim(),
              role: row.role?.toString().trim() || "EMPLOYEE",
              basicSalary: parseFloat(row.basicSalary),
              pfContribution: row.pfContribution
                ? parseFloat(row.pfContribution)
                : undefined,
              professionalTax: row.professionalTax
                ? parseFloat(row.professionalTax)
                : undefined,
            });
          }
        });

        if (jsonData.length === 0) {
          warnings.push("File is empty");
        }

        console.log("Excel Parse summary:", {
          validData: validData.length,
          errors: errors.length,
          warnings,
        });
        resolve({ data: validData, errors, warnings });
      } catch (error) {
        console.error("Excel Parse error:", error);
        resolve({
          data: [],
          errors: [
            {
              row: 0,
              field: "file",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to parse Excel file",
            },
          ],
          warnings: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        data: [],
        errors: [{ row: 0, field: "file", message: "Failed to read file" }],
        warnings: [],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

export function downloadSampleCSV() {
  const headers = Object.keys(REQUIRED_FIELD_LABELS);
  const sampleData = [
    ["John Doe", "john.doe@company.com", "2024-01-15", "50000"],
    ["Jane Marie Smith", "jane.smith@company.com", "2024-02-01", "65000"],
    ["Robert Johnson", "robert.j@company.com", "2024-03-01", "45000"],
  ];

  const csv = Papa.unparse({
    fields: headers,
    data: sampleData,
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "employee_import_template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSampleExcel() {
  const headers = Object.keys(REQUIRED_FIELD_LABELS);
  const sampleData = [
    ["John Doe", "john.doe@company.com", "2024-01-15", 50000],
    ["Jane Marie Smith", "jane.smith@company.com", "2024-02-01", 65000],
    ["Robert Johnson", "robert.j@company.com", "2024-03-01", 45000],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");

  const colWidths = headers.map((h) => ({ wch: Math.max(h.length, 15) }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, "employee_import_template.xlsx");
}
