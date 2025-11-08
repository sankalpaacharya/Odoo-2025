import { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClient();

const defaultPermissions = {
  EMPLOYEE: {
    Dashboard: [],
    Employees: [],
    Attendance: ["View", "Create"],
    "Time Off": ["View", "Create"],
    Payroll: ["View"],
    Reports: [],
  },
  HR_OFFICER: {
    Dashboard: ["View", "Export Data"],
    Employees: ["View", "Create", "Edit", "Export"],
    Attendance: ["View", "Create", "Edit", "Approve", "Export"],
    "Time Off": ["View", "Create", "Edit", "Approve", "Export"],
    Payroll: ["View"],
    Reports: ["View", "Generate", "Export"],
    Settings: ["View"],
  },
  PAYROLL_OFFICER: {
    Dashboard: ["View", "Export Data"],
    Employees: ["View", "Export"],
    Attendance: ["View", "Export"],
    "Time Off": ["View", "Export"],
    Payroll: ["View", "Create", "Edit", "Process", "Export"],
    Reports: ["View", "Generate", "Export"],
    Settings: ["View"],
  },
  ADMIN: {
    Dashboard: ["View", "Export Data"],
    Employees: ["View", "Create", "Edit", "Delete", "Export"],
    Attendance: ["View", "Create", "Edit", "Delete", "Approve", "Export"],
    "Time Off": ["View", "Create", "Edit", "Delete", "Approve", "Export"],
    Payroll: ["View", "Create", "Edit", "Delete", "Process", "Export"],
    Reports: ["View", "Generate", "Export", "Schedule"],
    Settings: ["View", "Edit", "Manage Users", "System Configuration"],
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
