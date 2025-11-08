import db from "@my-better-t-app/db";
import type { Prisma } from "@my-better-t-app/db";

export const sessionService = {
  async findActiveSession(employeeId: string) {
    return db.workSession.findFirst({
      where: {
        employeeId,
        isActive: true,
      },
      orderBy: { startTime: "desc" },
    });
  },

  async findSessionById(id: string) {
    return db.workSession.findUnique({
      where: { id },
    });
  },

  async findSessionsByEmployeeAndDate(employeeId: string, date: Date) {
    const endOfDay = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
    );

    return db.workSession.findMany({
      where: {
        employeeId,
        date: {
          gte: date,
          lt: endOfDay,
        },
      },
      orderBy: { startTime: "asc" },
    });
  },

  async findSessionsByDateRange(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ) {
    return db.workSession.findMany({
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

  async createSession(data: {
    employeeId: string;
    date: Date;
    startTime: Date;
  }) {
    return db.workSession.create({
      data: {
        employeeId: data.employeeId,
        date: data.date,
        startTime: data.startTime,
        isActive: true,
      },
    });
  },

  async updateSession(id: string, data: Prisma.WorkSessionUpdateInput) {
    return db.workSession.update({
      where: { id },
      data,
    });
  },

  async deleteSession(id: string) {
    return db.workSession.delete({
      where: { id },
    });
  },

  async calculateWorkingHours(
    startTime: Date,
    endTime: Date,
    totalBreakMinutes: number
  ) {
    const totalMinutes = Math.floor(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60)
    );
    const workingMinutes = Math.max(0, totalMinutes - totalBreakMinutes);
    return parseFloat((workingMinutes / 60).toFixed(2));
  },

  async calculateOvertime(workingHours: number, standardHours: number = 9) {
    return Math.max(0, workingHours - standardHours);
  },

  async startBreak(sessionId: string) {
    const session = await db.workSession.findUnique({
      where: { id: sessionId },
    });

    if (!session?.isActive) {
      throw new Error("No active session found");
    }

    if (session.breakStartTime && !session.breakEndTime) {
      throw new Error("Break already in progress");
    }

    return db.workSession.update({
      where: { id: sessionId },
      data: {
        breakStartTime: new Date(),
        breakEndTime: null,
      },
    });
  },

  async endBreak(sessionId: string) {
    const session = await db.workSession.findUnique({
      where: { id: sessionId },
    });

    if (!session?.isActive) {
      throw new Error("No active session found");
    }

    if (!session.breakStartTime) {
      throw new Error("No break to end");
    }

    if (session.breakEndTime) {
      throw new Error("Break already ended");
    }

    const now = new Date();
    const breakDurationMinutes = Math.floor(
      (now.getTime() - session.breakStartTime.getTime()) / (1000 * 60)
    );
    const breakDurationHours = parseFloat(
      (breakDurationMinutes / 60).toFixed(2)
    );

    const currentTotalBreak = session.totalBreakTime
      ? parseFloat(session.totalBreakTime.toString())
      : 0;
    const newTotalBreak = currentTotalBreak + breakDurationHours;

    return db.workSession.update({
      where: { id: sessionId },
      data: {
        breakEndTime: now,
        totalBreakTime: newTotalBreak,
      },
    });
  },
};
