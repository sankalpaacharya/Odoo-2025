import prisma from "@my-better-t-app/db";

export async function generateEmployeeCode(firstName: string, lastName: string, companyName: string, dateOfJoining: Date): Promise<string> {
  // Handle undefined or null companyName
  const safeCompanyName = companyName || "COMP";
  const companyInitials = safeCompanyName
    .split(" ")
    .map((word) => word.substring(0, 2).toUpperCase())
    .join("")
    .substring(0, 4); // Max 4 characters for company

  // Handle undefined or null firstName/lastName
  const safeFirstName = firstName || "FN";
  const safeLastName = lastName || "LN";
  const nameInitials = (safeFirstName.substring(0, 2) + safeLastName.substring(0, 2)).toUpperCase();

  const year = dateOfJoining.getFullYear();

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

  const serialNumber = String(employeeCount + 1).padStart(4, "0");

  const employeeCode = `${companyInitials}${nameInitials}${year}${serialNumber}`;

  return employeeCode;
}

export function generateRandomPassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";

  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Fisher-Yates shuffle algorithm (more reliable than sort)
  const chars = password.split("");
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = chars[i];
    chars[i] = chars[j]!;
    chars[j] = temp!;
  }
  return chars.join("");
}
