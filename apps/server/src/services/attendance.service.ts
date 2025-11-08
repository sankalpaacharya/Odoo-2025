import db from "@my-better-t-app/db";
import type { Prisma } from "@my-better-t-app/db";

type AttendanceStatus = "PRESENT" | "ABSENT" | "HALF_DAY" | "LATE" | "ON_LEAVE" | "HOLIDAY" | "WEEKEND";

export const attendanceService = {
  async findById(id: string) {
    return db.attendance.findUnique({
      where: { id },
    });
  },

  async findByEmployeeAndDate(employeeId: string, date: Date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return db.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: startOfDay,
        },
      },
    });
  },

  async findByEmployeeAndDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ) {
    return db.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });
  },

  async findByDateWithEmployees(date: Date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return db.attendance.findMany({
      where: { date: startOfDay },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: true,
            designation: true,
          },
        },
      },
    });
  },

  async findAllWithFilters(filters: {
    startDate?: Date;
    endDate?: Date;
    department?: string;
    status?: AttendanceStatus;
    employeeCode?: string;
    page?: number;
    limit?: number;
  }) {
    const { startDate, endDate, department, status, employeeCode, page = 1, limit = 50 } = filters;
    
    const skip = (page - 1) * limit;
    const where: Prisma.AttendanceWhereInput = {};

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    if (status) {
      where.status = status;
    }

    const employeeWhere: Prisma.EmployeeWhereInput = {};
    if (department) {
      employeeWhere.department = department;
    }
    if (employeeCode) {
      employeeWhere.employeeCode = {
        contains: employeeCode,
        mode: "insensitive",
      };
    }

    if (Object.keys(employeeWhere).length > 0) {
      where.employee = employeeWhere;
    }

    const [attendances, total] = await Promise.all([
      db.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              department: true,
              designation: true,
            },
          },
        },
        orderBy: [{ date: "desc" }, { employee: { employeeCode: "asc" } }],
        skip,
        take: limit,
      }),
      db.attendance.count({ where }),
    ]);

    return { attendances, total, page, limit };
  },

  async createAttendance(data: {
    employeeId: string;
    date: Date;
    checkIn?: Date;
    checkOut?: Date;
    status: AttendanceStatus;
    workingHours?: number;
    overtimeHours?: number;
    notes?: string;
  }) {
    return db.attendance.create({
      data: {
        employeeId: data.employeeId,
        date: data.date,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        status: data.status,
        workingHours: data.workingHours,
        overtimeHours: data.overtimeHours || 0,
        notes: data.notes,
      },
    });
  },

  async updateAttendance(
    employeeId: string,
    date: Date,
    data: Prisma.AttendanceUpdateInput
  ) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return db.attendance.update({
      where: {
        employeeId_date: {
          employeeId,
          date: startOfDay,
        },
      },
      data,
    });
  },

  async upsertAttendance(
    employeeId: string,
    date: Date,
    createData: {
      checkIn?: Date;
      checkOut?: Date;
      status: AttendanceStatus;
      workingHours?: number;
      overtimeHours?: number;
      notes?: string;
    },
    updateData: {
      checkOut?: Date;
      workingHours?: number;
      overtimeHours?: number;
      status?: AttendanceStatus;
      notes?: string;
    }
  ) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return db.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: startOfDay,
        },
      },
      update: updateData,
      create: {
        employeeId,
        date: startOfDay,
        ...createData,
      },
    });
  },

  async deleteAttendance(employeeId: string, date: Date) {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    return db.attendance.delete({
      where: {
        employeeId_date: {
          employeeId,
          date: startOfDay,
        },
      },
    });
  },

  determineAttendanceStatus(workingHours: number, checkInTime: Date): AttendanceStatus {
    if (workingHours < 4) {
      return "HALF_DAY";
    } else if (checkInTime.getHours() > 10) {
      return "LATE";
    }
    return "PRESENT";
  },

  async calculateMonthlySummary(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await this.findByEmployeeAndDateRange(
      employeeId,
      startDate,
      endDate
    );

    const summary = {
      totalWorkingDays: attendances.filter((a) =>
        ["PRESENT", "LATE", "HALF_DAY"].includes(a.status)
      ).length,
      totalPresentDays: attendances.filter(
        (a) => a.status === "PRESENT" || a.status === "LATE"
      ).length,
      totalAbsentDays: attendances.filter((a) => a.status === "ABSENT").length,
      totalLeaveDays: attendances.filter((a) => a.status === "ON_LEAVE").length,
      totalHalfDays: attendances.filter((a) => a.status === "HALF_DAY").length,
      totalLateDays: attendances.filter((a) => a.status === "LATE").length,
      totalWorkingHours: attendances.reduce((sum, a) => {
        return sum + (a.workingHours ? parseFloat(a.workingHours.toString()) : 0);
      }, 0),
      totalOvertimeHours: attendances.reduce((sum, a) => {
        return sum + (a.overtimeHours ? parseFloat(a.overtimeHours.toString()) : 0);
      }, 0),
    };

    return {
      ...summary,
      totalWorkingHours: parseFloat(summary.totalWorkingHours.toFixed(2)),
      totalOvertimeHours: parseFloat(summary.totalOvertimeHours.toFixed(2)),
    };
  },

  async calculateOrganizationSummary(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await db.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
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

    const employeeMap = new Map<
      string,
      {
        employeeCode: string;
        name: string;
        department: string;
        presentDays: number;
        absentDays: number;
        leaveDays: number;
        halfDays: number;
        lateDays: number;
        totalWorkingHours: number;
        totalOvertimeHours: number;
      }
    >();

    attendances.forEach((att) => {
      const empId = att.employeeId;
      if (!employeeMap.has(empId)) {
        employeeMap.set(empId, {
          employeeCode: att.employee.employeeCode,
          name: `${att.employee.firstName} ${att.employee.lastName}`,
          department: att.employee.department || "N/A",
          presentDays: 0,
          absentDays: 0,
          leaveDays: 0,
          halfDays: 0,
          lateDays: 0,
          totalWorkingHours: 0,
          totalOvertimeHours: 0,
        });
      }

      const empData = employeeMap.get(empId)!;

      if (att.status === "PRESENT") empData.presentDays++;
      if (att.status === "ABSENT") empData.absentDays++;
      if (att.status === "ON_LEAVE") empData.leaveDays++;
      if (att.status === "HALF_DAY") empData.halfDays++;
      if (att.status === "LATE") empData.lateDays++;

      empData.totalWorkingHours += att.workingHours
        ? parseFloat(att.workingHours.toString())
        : 0;
      empData.totalOvertimeHours += att.overtimeHours
        ? parseFloat(att.overtimeHours.toString())
        : 0;
    });

    return Array.from(employeeMap.entries()).map(([id, data]) => ({
      employeeId: id,
      ...data,
      totalWorkingHours: parseFloat(data.totalWorkingHours.toFixed(2)),
      totalOvertimeHours: parseFloat(data.totalOvertimeHours.toFixed(2)),
    }));
  },
};
