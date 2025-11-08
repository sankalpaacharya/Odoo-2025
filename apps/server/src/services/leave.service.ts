import db from "@my-better-t-app/db";

type LeaveType =
  | "CASUAL"
  | "SICK"
  | "EARNED"
  | "MATERNITY"
  | "PATERNITY"
  | "UNPAID"
  | "COMPENSATORY";
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export const leaveService = {
  async findById(id: string) {
    return db.leave.findUnique({
      where: { id },
    });
  },

  async findByIdWithEmployee(id: string) {
    return db.leave.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
    });
  },

  async findByEmployee(
    employeeId: string,
    filters?: {
      status?: LeaveStatus;
      leaveType?: LeaveType;
      year?: number;
    }
  ) {
    const where: any = { employeeId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.leaveType) {
      where.leaveType = filters.leaveType;
    }

    if (filters?.year) {
      where.startDate = {
        gte: new Date(filters.year, 0, 1),
        lte: new Date(filters.year, 11, 31),
      };
    }

    return db.leave.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });
  },

  async findAllWithFilters(filters: {
    status?: LeaveStatus;
    leaveType?: LeaveType;
    department?: string;
    year?: number;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      leaveType,
      department,
      year,
      page = 1,
      limit = 50,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (leaveType) {
      where.leaveType = leaveType;
    }

    if (year) {
      where.startDate = {
        gte: new Date(year, 0, 1),
        lte: new Date(year, 11, 31),
      };
    }

    if (department) {
      where.employee = {
        department,
      };
    }

    const [leaves, total] = await Promise.all([
      db.leave.findMany({
        where,
        include: {
          employee: {
            select: {
              employeeCode: true,
              firstName: true,
              lastName: true,
              department: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
      }),
      db.leave.count({ where }),
    ]);

    return { leaves, total, page, limit };
  },

  async createLeave(data: {
    employeeId: string;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    reason: string;
  }) {
    const totalDays = this.calculateTotalDays(data.startDate, data.endDate);

    return db.leave.create({
      data: {
        employeeId: data.employeeId,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        totalDays,
        reason: data.reason,
        status: "PENDING",
      },
    });
  },

  async updateLeave(id: string, data: any) {
    return db.leave.update({
      where: { id },
      data,
    });
  },

  async approveLeave(
    leaveId: string,
    approverCode: string,
    updateBalance: boolean = true
  ) {
    const leave = await this.findById(leaveId);

    if (!leave) {
      throw new Error("Leave request not found");
    }

    if (leave.status !== "PENDING") {
      throw new Error("Leave request is not pending");
    }

    const year = leave.startDate.getFullYear();
    const totalDays = parseFloat(leave.totalDays.toString());

    if (updateBalance) {
      return db.$transaction(async (tx) => {
        const updatedLeave = await tx.leave.update({
          where: { id: leaveId },
          data: {
            status: "APPROVED",
            approvedBy: approverCode,
            approvedAt: new Date(),
          },
        });

        const balance = await tx.leaveBalance.findUnique({
          where: {
            employeeId_leaveType_year: {
              employeeId: leave.employeeId,
              leaveType: leave.leaveType,
              year,
            },
          },
        });

        if (balance) {
          const newUsed = parseFloat(balance.used.toString()) + totalDays;
          const newRemaining =
            parseFloat(balance.allocated.toString()) - newUsed;

          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: {
              used: newUsed,
              remaining: newRemaining,
            },
          });
        }

        return updatedLeave;
      });
    }

    return db.leave.update({
      where: { id: leaveId },
      data: {
        status: "APPROVED",
        approvedBy: approverCode,
        approvedAt: new Date(),
      },
    });
  },

  async rejectLeave(
    leaveId: string,
    approverCode: string,
    rejectionReason: string
  ) {
    const leave = await this.findById(leaveId);

    if (!leave) {
      throw new Error("Leave request not found");
    }

    if (leave.status !== "PENDING") {
      throw new Error("Leave request is not pending");
    }

    return db.leave.update({
      where: { id: leaveId },
      data: {
        status: "REJECTED",
        approvedBy: approverCode,
        approvedAt: new Date(),
        rejectionReason,
      },
    });
  },

  async cancelLeave(leaveId: string) {
    const leave = await this.findById(leaveId);

    if (!leave) {
      throw new Error("Leave request not found");
    }

    if (leave.status !== "PENDING") {
      throw new Error("Only pending leave requests can be cancelled");
    }

    return db.leave.update({
      where: { id: leaveId },
      data: { status: "CANCELLED" },
    });
  },

  async deleteLeave(id: string) {
    return db.leave.delete({
      where: { id },
    });
  },

  calculateTotalDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  },

  async validateLeaveBalance(
    employeeId: string,
    leaveType: LeaveType,
    requiredDays: number,
    year: number
  ): Promise<{ isValid: boolean; remaining?: number; error?: string }> {
    const balance = await db.leaveBalance.findUnique({
      where: {
        employeeId_leaveType_year: {
          employeeId,
          leaveType,
          year,
        },
      },
    });

    if (!balance) {
      return {
        isValid: false,
        error: `No leave balance found for ${leaveType} in ${year}`,
      };
    }

    const remaining = parseFloat(balance.remaining.toString());

    if (remaining < requiredDays) {
      return {
        isValid: false,
        remaining,
        error: `Insufficient leave balance. Available: ${remaining}, Requested: ${requiredDays}`,
      };
    }

    return { isValid: true, remaining };
  },
};
