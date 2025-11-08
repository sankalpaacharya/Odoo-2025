import db from "@my-better-t-app/db";

export const employeeService = {
  async findById(id: string) {
    return db.employee.findUnique({
      where: { id },
    });
  },

  async findByUserId(userId: string) {
    return db.employee.findUnique({
      where: { userId },
    });
  },

  async findByEmployeeCode(employeeCode: string) {
    return db.employee.findUnique({
      where: { employeeCode },
    });
  },

  async findActiveEmployees(organizationId?: string) {
    return db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
        ...(organizationId && { organizationId }),
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: true,
        designation: true,
        organizationId: true,
      },
    });
  },

  async isAdmin(userId: string) {
    const employee = await db.employee.findUnique({
      where: { userId },
      select: { role: true },
    });

    return employee && ["ADMIN", "HR_OFFICER", "PAYROLL_OFFICER"].includes(employee.role);
  },

  async hasRole(userId: string, roles: string[]) {
    const employee = await db.employee.findUnique({
      where: { userId },
      select: { role: true },
    });

    return employee && roles.includes(employee.role);
  },
};
