import db from "@my-better-t-app/db";
import { sessionService } from "./session.service";

// type PayrunStatus = "DRAFT" | "PROCESSING" | "COMPLETED" | "CANCELLED";
// type PayslipStatus = "PENDING" | "PROCESSED" | "PAID" | "CANCELLED";

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

export const payrollService = {
  async getOrCreatePayrun(month: number, year: number) {
    const existing = await db.payrun.findUnique({
      where: { month_year: { month, year } },
      include: { payslips: true },
    });

    if (existing) {
      return existing;
    }

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    try {
      return await db.payrun.create({
        data: {
          month,
          year,
          periodStart,
          periodEnd,
          status: "DRAFT",
        },
        include: { payslips: true },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        return (await db.payrun.findUnique({
          where: { month_year: { month, year } },
          include: { payslips: true },
        })) as any;
      }
      throw error;
    }
  },

  async generatePayslips(
    payrunId: string,
    month: number,
    year: number,
    organizationId?: string
  ) {
    const employees = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
        ...(organizationId && { organizationId }),
      },
      include: {
        salaryComponents: true,
      },
    });

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    const payslips = await Promise.all(
      employees.map(async (employee) => {
        const existingPayslip = await db.payslip.findUnique({
          where: {
            employeeId_month_year: {
              employeeId: employee.id,
              month,
              year,
            },
          },
        });

        if (existingPayslip) {
          return existingPayslip;
        }

        const workSessions = await sessionService.findSessionsByDateRange(
          employee.id,
          periodStart,
          periodEnd
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
          let d = new Date(periodStart);
          d <= periodEnd;
          d.setDate(d.getDate() + 1)
        ) {
          datesInMonth.push(new Date(d));
        }

        const now = new Date();
        let presentDays = 0;
        let totalWorkingHours = 0;
        let overtimeHours = 0;

        datesInMonth.forEach((date) => {
          const dateKey = date.toISOString().split("T")[0];
          const sessions = (dateKey && sessionsByDate[dateKey]) || [];
          const workingHours = calculateWorkingHoursFromSessions(sessions, now);

          if (workingHours >= 4) {
            presentDays += workingHours >= 9 ? 1 : 0.5;
            totalWorkingHours += workingHours;
            overtimeHours += Math.max(0, workingHours - 9);
          }
        });

        const workingDays = datesInMonth.length;
        const absentDays = workingDays - presentDays;

        const basicSalary = employee.basicSalary
          ? parseFloat(employee.basicSalary.toString())
          : 0;

        const allowances = employee.salaryComponents
          .filter((c) => c.type === "EARNING" && c.isActive)
          .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

        const grossSalary = basicSalary + allowances;

        const deductions = employee.salaryComponents
          .filter((c) => c.type === "DEDUCTION" && c.isActive)
          .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

        const pfDeduction = basicSalary * 0.12;
        const professionalTax = grossSalary > 20000 ? 200 : 0;

        const totalDeductions = deductions + pfDeduction + professionalTax;
        const netSalary = grossSalary - totalDeductions;

        const totalEarnings = grossSalary;

        return db.payslip.create({
          data: {
            employeeId: employee.id,
            payrunId,
            month,
            year,
            workingDays,
            presentDays,
            absentDays,
            leaveDays: 0,
            overtimeHours,
            basicSalary,
            grossSalary,
            totalEarnings,
            totalDeductions,
            netSalary,
            pfDeduction,
            professionalTax,
            otherDeductions: deductions,
            status: "PENDING",
          },
        });
      })
    );

    const totalAmount = payslips.reduce(
      (sum, p) => sum + parseFloat(p.netSalary.toString()),
      0
    );

    await db.payrun.update({
      where: { id: payrunId },
      data: { totalAmount },
    });

    return payslips;
  },

  async getPayrunWithPayslips(month: number, year: number) {
    return db.payrun.findUnique({
      where: { month_year: { month, year } },
      include: {
        payslips: {
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
        },
      },
    });
  },

  async validatePayrun(payrunId: string, processedBy: string) {
    const payrun = await db.payrun.findUnique({
      where: { id: payrunId },
      include: { payslips: true },
    });

    if (!payrun) {
      throw new Error("Payrun not found");
    }

    if (payrun.status !== "DRAFT") {
      throw new Error("Payrun is not in draft status");
    }

    await db.$transaction([
      db.payslip.updateMany({
        where: { payrunId },
        data: { status: "PROCESSED" },
      }),
      db.payrun.update({
        where: { id: payrunId },
        data: {
          status: "PROCESSING",
          processedBy,
          processedAt: new Date(),
        },
      }),
    ]);

    return this.getPayrunWithPayslips(payrun.month, payrun.year);
  },

  async markPayrunAsDone(payrunId: string) {
    const payrun = await db.payrun.findUnique({
      where: { id: payrunId },
      include: { payslips: true },
    });

    if (!payrun) {
      throw new Error("Payrun not found");
    }

    if (payrun.status !== "PROCESSING") {
      throw new Error("Payrun must be validated first");
    }

    await db.$transaction([
      db.payslip.updateMany({
        where: { payrunId },
        data: { status: "PAID", paidAt: new Date() },
      }),
      db.payrun.update({
        where: { id: payrunId },
        data: { status: "COMPLETED" },
      }),
    ]);

    return this.getPayrunWithPayslips(payrun.month, payrun.year);
  },

  async getPayslipsByEmployee(employeeId: string, year?: number) {
    const where: any = { employeeId };
    if (year) {
      where.year = year;
    }

    return db.payslip.findMany({
      where,
      include: {
        payrun: {
          select: {
            status: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
  },
};
