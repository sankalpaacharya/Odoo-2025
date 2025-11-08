import { sessionService } from "./session.service";
import { leaveService } from "./leave.service";

function calculateWorkingHoursFromSessions(
  sessions: any[],
  now: Date = new Date()
): number {
  let totalMinutes = 0;

  sessions.forEach((session) => {
    if (session.isActive) {
      const sessionMinutes = Math.floor(
        (now.getTime() - session.startTime.getTime()) / (1000 * 60)
      );
      const breakMinutes = session.totalBreakTime
        ? parseFloat(session.totalBreakTime.toString()) * 60
        : 0;
      totalMinutes += Math.max(0, sessionMinutes - breakMinutes);
    } else if (session.workingHours) {
      totalMinutes += parseFloat(session.workingHours.toString()) * 60;
    }
  });

  return parseFloat((totalMinutes / 60).toFixed(2));
}

export const attendanceCalculationService = {
  calculateTotalWorkingDays(month: number, year: number): number {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const today = new Date();

    let workingDays = 0;

    for (
      let d = new Date(startDate);
      d <= endDate && d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  },

  async calculatePresentDays(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const workSessions = await sessionService.findSessionsByDateRange(
      employeeId,
      startDate,
      endDate
    );

    const sessionsByDate = workSessions.reduce((acc, session) => {
      const dateKey = session.date.toISOString().split("T")[0];
      if (dateKey) {
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(session);
      }
      return acc;
    }, {} as Record<string, typeof workSessions>);

    const datesInMonth: Date[] = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      datesInMonth.push(new Date(d));
    }

    const now = new Date();
    let presentDays = 0;

    datesInMonth.forEach((date) => {
      const dateKey = date.toISOString().split("T")[0];
      const sessions = (dateKey && sessionsByDate[dateKey]) || [];
      const workingHours = calculateWorkingHoursFromSessions(sessions, now);

      if (workingHours >= 4) {
        presentDays += workingHours >= 9 ? 1 : 0.5;
      }
    });

    return presentDays;
  },

  async calculatePaidLeaveDays(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const leaves = await leaveService.findApprovedLeavesByDateRange(
      employeeId,
      startDate,
      endDate
    );

    const paidLeaveTypes = ["PAID_TIME_OFF", "SICK_LEAVE"];

    return leaves
      .filter((l) => paidLeaveTypes.includes(l.leaveType))
      .reduce((sum, l) => sum + parseFloat(l.totalDays.toString()), 0);
  },

  async calculateUnpaidLeaveDays(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const leaves = await leaveService.findApprovedLeavesByDateRange(
      employeeId,
      startDate,
      endDate
    );

    return leaves
      .filter((l) => l.leaveType === "UNPAID_LEAVE")
      .reduce((sum, l) => sum + parseFloat(l.totalDays.toString()), 0);
  },

  async calculateAbsentDays(
    employeeId: string,
    month: number,
    year: number
  ): Promise<{
    totalWorkingDays: number;
    presentDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    absentDays: number;
  }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const totalWorkingDays = this.calculateTotalWorkingDays(month, year);

    const [presentDays, paidLeaveDays, unpaidLeaveDays] = await Promise.all([
      this.calculatePresentDays(employeeId, startDate, endDate),
      this.calculatePaidLeaveDays(employeeId, startDate, endDate),
      this.calculateUnpaidLeaveDays(employeeId, startDate, endDate),
    ]);

    const absentDays = Math.max(
      0,
      totalWorkingDays - presentDays - paidLeaveDays - unpaidLeaveDays
    );

    return {
      totalWorkingDays,
      presentDays,
      paidLeaveDays,
      unpaidLeaveDays,
      absentDays,
    };
  },

  calculateLOPDeduction(
    grossSalary: number,
    totalWorkingDays: number,
    absentDays: number,
    unpaidLeaveDays: number
  ): number {
    if (totalWorkingDays === 0) return 0;

    const perDayRate = grossSalary / totalWorkingDays;
    const totalDeductionDays = absentDays + unpaidLeaveDays;
    const lopDeduction = perDayRate * totalDeductionDays;

    return parseFloat(lopDeduction.toFixed(2));
  },
};
