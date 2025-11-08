import { config } from "dotenv";
import { resolve } from "path";
import prisma from "../src/index";

// Load environment variables from server/.env
config({ path: resolve(process.cwd(), "../../apps/server/.env") });

async function migrateOrganizations() {
  try {
    console.log("Starting organization migration...");

    // Get all employees without organizationId
    const employeesWithoutOrg = await prisma.employee.findMany({
      where: {
        organizationId: null,
      },
      include: {
        user: {
          select: {
            companyName: true,
          },
        },
      },
    });

    console.log(`Found ${employeesWithoutOrg.length} employees without organization`);

    // Group employees by company name
    const employeesByCompany = new Map<string, typeof employeesWithoutOrg>();

    for (const employee of employeesWithoutOrg) {
      const companyName = employee.user.companyName || "Default Company";
      if (!employeesByCompany.has(companyName)) {
        employeesByCompany.set(companyName, []);
      }
      employeesByCompany.get(companyName)!.push(employee);
    }

    // Create organizations and update employees
    for (const [companyName, employees] of employeesByCompany.entries()) {
      console.log(`\nProcessing company: ${companyName}`);

      // Find or create organization
      let organization = await prisma.organization.findUnique({
        where: { companyName },
      });

      if (!organization) {
        organization = await prisma.organization.create({
          data: {
            companyName,
          },
        });
        console.log(`Created organization: ${companyName} (${organization.id})`);
      } else {
        console.log(`Found existing organization: ${companyName} (${organization.id})`);
      }

      // Update all employees for this company
      const employeeIds = employees.map((e) => e.id);
      const result = await prisma.employee.updateMany({
        where: {
          id: {
            in: employeeIds,
          },
        },
        data: {
          organizationId: organization.id,
        },
      });

      console.log(`Updated ${result.count} employees for ${companyName}`);
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateOrganizations();
