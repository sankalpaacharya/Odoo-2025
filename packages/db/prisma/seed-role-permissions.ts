import { PrismaClient } from "../prisma/generated/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../../../apps/server/.env") });

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:password@localhost:5432/my-better-t-app";
}

const prisma = new PrismaClient();

const defaultPermissions = {
  EMPLOYEE: {
    Dashboard: [],
    Employees: [],
    Attendance: ["View", "Create"],
    "Time Off": ["View", "Create"],
    Payroll: ["View"],
    Reports: [],
    Profile: ["View", "Edit"],
  },
  HR_OFFICER: {
    Dashboard: [],
    Employees: [],
    Attendance: ["View", "Create", "Edit", "Approve", "Export"],
    "Time Off": ["View", "Create", "Edit", "Approve", "Export"],
    Payroll: ["View", "Create", "Edit", "Process", "Export"],
    Reports: [],
    Settings: [],
    Profile: ["View", "Edit"],
  },
  PAYROLL_OFFICER: {
    Dashboard: [],
    Employees: [],
    Attendance: ["View", "Export"],
    "Time Off": ["View", "Export"],
    Payroll: ["View", "Create", "Edit", "Process", "Export"],
    Reports: [],
    Settings: [],
    Profile: ["View", "Edit"],
  },
  ADMIN: {
    Dashboard: ["View", "Export Data"],
    Employees: ["View", "Create", "Edit", "Delete", "Export"],
    Attendance: ["View", "Create", "Edit", "Delete", "Approve", "Export"],
    "Time Off": ["View", "Create", "Edit", "Delete", "Approve", "Export"],
    Payroll: ["View", "Create", "Edit", "Delete", "Process", "Export"],
    Reports: ["View", "Generate", "Export", "Schedule"],
    Settings: ["View", "Edit", "Manage Users", "System Configuration"],
    Profile: ["View", "Edit"],
  },
};

async function main() {
  console.log("Seeding role permissions...");

  // Clear existing permissions
  await prisma.rolePermission.deleteMany({});

  const permissionRecords = [];
  for (const [role, modules] of Object.entries(defaultPermissions)) {
    for (const [module, perms] of Object.entries(modules)) {
      for (const permission of perms) {
        permissionRecords.push({
          role,
          module,
          permission,
        });
      }
    }
  }

  await prisma.rolePermission.createMany({
    data: permissionRecords,
  });

  console.log(`✅ Seeded ${permissionRecords.length} role permissions`);
}

main()
  .catch((e) => {
    console.error("Error seeding role permissions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
