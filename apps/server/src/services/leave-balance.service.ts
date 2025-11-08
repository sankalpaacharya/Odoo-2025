import db from "@my-better-t-app/db";

type LeaveType =
  | "CASUAL"
  | "SICK"
  | "EARNED"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID"
  | "COMPENSATORY";

export const leaveBalanceService = {
  async findById(id: string) {
    return db.leaveBalance.findUnique({
      where: { id },
    });
  },

  async findByEmployeeAndYear(employeeId: string, year: number) {
    return db.leaveBalance.findMany({
      where: {
        employeeId,
        year,
      },
    });
  },

  async findByEmployeeTypeYear(
    employeeId: string,
    leaveType: LeaveType,
    year: number
  ) {
    return db.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId,
          leaveType,
          year,
        },
      },
    });
  },

  async createBalance(data: {
    employeeId: string;
    leaveType: LeaveType;
    year: number;
    allocated: number;
  }) {
    return db.leaveBalance.create({
      data: {
        employeeId: data.employeeId,
        leaveType: data.leaveType,
        year: data.year,
        allocated: data.allocated,
        used: 0,
        remaining: data.allocated,
      },
    });
  },

  async updateBalance(
    id: string,
    data: {
      allocated?: number;
      used?: number;
      remaining?: number;
    }
  ) {
    return db.leaveBalance.update({
      where: { id },
      data,
    });
  },

  async upsertBalance(data: {
    employeeId: string;
    leaveType: LeaveType;
    year: number;
    allocated: number;
  }) {
    return db.leaveBalance.upsert({
      where: {
        employeeId_leaveType_year: {
          employeeId: data.employeeId,
          leaveType: data.leaveType,
          year: data.year,
        },
      },
      update: {
        allocated: data.allocated,
        remaining: data.allocated,
      },
      create: {
        employeeId: data.employeeId,
        leaveType: data.leaveType,
        year: data.year,
        allocated: data.allocated,
        used: 0,
        remaining: data.allocated,
      },
    });
  },

  async deductBalance(
    employeeId: string,
    leaveType: LeaveType,
    year: number,
    days: number
  ) {
    const balance = await this.findByEmployeeTypeYear(
      employeeId,
      leaveType,
      year
    );

    if (!balance) {
      throw new Error("Leave balance not found");
    }

    const newUsed = parseFloat(balance.used.toString()) + days;
    const newRemaining = parseFloat(balance.allocated.toString()) - newUsed;

    return db.leaveBalance.update({
      where: { id: balance.id },
      data: {
        used: newUsed,
        remaining: newRemaining,
      },
    });
  },

  async restoreBalance(
    employeeId: string,
    leaveType: LeaveType,
    year: number,
    days: number
  ) {
    const balance = await this.findByEmployeeTypeYear(
      employeeId,
      leaveType,
      year
    );

    if (!balance) {
      throw new Error("Leave balance not found");
    }

    const newUsed = Math.max(0, parseFloat(balance.used.toString()) - days);
    const newRemaining = parseFloat(balance.allocated.toString()) - newUsed;

    return db.leaveBalance.update({
      where: { id: balance.id },
      data: {
        used: newUsed,
        remaining: newRemaining,
      },
    });
  },

  async deleteBalance(id: string) {
    return db.leaveBalance.delete({
      where: { id },
    });
  },

  async initializeEmployeeBalances(
    employeeId: string,
    year: number,
    defaults: { leaveType: LeaveType; allocated: number }[]
  ) {
    return db.$transaction(
      defaults.map((def) =>
        db.leaveBalance.upsert({
          where: {
            employeeId_leaveType_year: {
              employeeId,
              leaveType: def.leaveType,
              year,
            },
          },
          update: {},
          create: {
            employeeId,
            leaveType: def.leaveType,
            year,
            allocated: def.allocated,
            used: 0,
            remaining: def.allocated,
          },
        })
      )
    );
  },
};
