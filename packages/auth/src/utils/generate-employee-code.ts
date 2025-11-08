import prisma from "@my-better-t-app/db";

/**
 * Generate Employee Code in format: [Company Initials][Name Initials][Year][Serial]
 * Example: OIJDOD20220001
 * - OI = Odoo India (Company Name - first two letters of each word)
 * - JDOD = John Doe (First two letters of first and last name)
 * - 2022 = Year of Joining
 * - 0001 = Serial Number for that year
 */
export async function generateEmployeeCode(
  firstName: string,
  lastName: string,
  companyName: string,
  dateOfJoining: Date
): Promise<string> {
  // Get company initials (first 2 letters of each word, uppercase)
  const companyInitials = companyName
    .split(" ")
    .map(word => word.substring(0, 2).toUpperCase())
    .join("")
    .substring(0, 4); // Max 4 characters for company

  // Get name initials (first 2 letters of first and last name)
  const nameInitials = (
    firstName.substring(0, 2) + lastName.substring(0, 2)
  ).toUpperCase();

  // Get year of joining
  const year = dateOfJoining.getFullYear();

  // Get the count of employees joined in that year to generate serial number
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59);

  const employeeCount = await prisma.employee.count({
    where: {
      dateOfJoining: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  });

  // Generate serial number (4 digits, zero-padded)
  const serialNumber = String(employeeCount + 1).padStart(4, "0");

  // Combine all parts
  const employeeCode = `${companyInitials}${nameInitials}${year}${serialNumber}`;

  return employeeCode;
}

/**
 * Generate a random password with specified length
 */
export function generateRandomPassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
