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
          status: "PROCESSING",
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
    organizationId?: string,
    forceRegenerate: boolean = false
  ) {
    const employees = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
        ...(organizationId && { organizationId }),
      },
      select: {
        id: true,
        basicSalary: true,
        pfContribution: true,
        professionalTax: true,
        hraPercentage: true,
        standardAllowanceAmount: true,
        performanceBonusPercentage: true,
        leaveTravelPercentage: true,
        pfPercentage: true,
        salaryComponents: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            type: true,
            amount: true,
            isPercentage: true,
            isActive: true,
          },
        },
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

        if (existingPayslip && !forceRegenerate) {
          return existingPayslip;
        }

        // If forcing regenerate and payslip exists, delete it first
        if (existingPayslip && forceRegenerate) {
          await db.payslip.delete({
            where: { id: existingPayslip.id },
          });
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

        // Monthly wage is stored in basicSalary
        const monthlyWage = employee.basicSalary
          ? parseFloat(employee.basicSalary.toString())
          : 0;

        // Calculate actual basic salary (50% of monthly wage)
        const basicSalary = monthlyWage * 0.5;

        // Calculate all salary components based on stored percentages
        const hraPercentage = parseFloat(employee.hraPercentage.toString());
        const houseRentAllowance = (basicSalary * hraPercentage) / 100;

        const standardAllowance = parseFloat(
          employee.standardAllowanceAmount.toString()
        );

        const performanceBonusPercentage = parseFloat(
          employee.performanceBonusPercentage.toString()
        );
        const performanceBonus =
          (basicSalary * performanceBonusPercentage) / 100;

        const leaveTravelPercentage = parseFloat(
          employee.leaveTravelPercentage.toString()
        );
        const leaveTravelAllowance =
          (basicSalary * leaveTravelPercentage) / 100;

        const totalPredefinedComponents =
          basicSalary +
          houseRentAllowance +
          standardAllowance +
          performanceBonus +
          leaveTravelAllowance;

        const fixedAllowance = Math.max(
          0,
          monthlyWage - totalPredefinedComponents
        );

        // Add custom salary components (if any)
        const customAllowances = employee.salaryComponents
          .filter((c) => c.type === "EARNING" && c.isActive)
          .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

        const grossSalary = monthlyWage + customAllowances;

        // Calculate deductions
        const customDeductions = employee.salaryComponents
          .filter((c) => c.type === "DEDUCTION" && c.isActive)
          .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

        const pfPercentage = parseFloat(employee.pfPercentage.toString());
        const pfDeduction = (basicSalary * pfPercentage) / 100;

        const professionalTax = parseFloat(employee.professionalTax.toString());

        const totalDeductions =
          customDeductions + pfDeduction + professionalTax;
        const netSalary = grossSalary - totalDeductions;

        const totalEarnings = grossSalary;

        console.log(`[Payroll] Employee ${employee.id}:`, {
          monthlyWage,
          basicSalary,
          houseRentAllowance,
          standardAllowance,
          performanceBonus,
          leaveTravelAllowance,
          fixedAllowance,
          grossSalary,
          pfDeduction,
          professionalTax,
          totalDeductions,
          netSalary,
        });

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
            otherDeductions: customDeductions,
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

    if (payrun.status === "COMPLETED") {
      throw new Error("Payrun is already completed");
    }

    await db.$transaction([
      db.payslip.updateMany({
        where: { payrunId },
        data: { status: "PROCESSED" },
      }),
      db.payrun.update({
        where: { id: payrunId },
        data: {
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

  async getPayrollWarnings(organizationId?: string) {
    const warnings = [];

    const employeesWithoutBankAccount = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
        OR: [
          { accountNumber: null },
          { accountNumber: "" },
          { bankName: null },
          { bankName: "" },
          { ifscCode: null },
          { ifscCode: "" },
        ],
        ...(organizationId && { organizationId }),
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: true,
        designation: true,
        accountNumber: true,
        bankName: true,
        ifscCode: true,
      },
    });

    if (employeesWithoutBankAccount.length > 0) {
      warnings.push({
        id: "bank_account",
        type: "bank_account",
        message: "Employee without Bank A/c",
        count: employeesWithoutBankAccount.length,
        employees: employeesWithoutBankAccount,
      });
    }

    const employeesWithoutPAN = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
        OR: [{ panNumber: null }, { panNumber: "" }],
        ...(organizationId && { organizationId }),
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: true,
        designation: true,
        panNumber: true,
      },
    });

    if (employeesWithoutPAN.length > 0) {
      warnings.push({
        id: "pan_number",
        type: "pan_number",
        message: "Employee without PAN Number",
        count: employeesWithoutPAN.length,
        employees: employeesWithoutPAN,
      });
    }

    const employeesWithoutUAN = await db.employee.findMany({
      where: {
        employmentStatus: "ACTIVE",
        OR: [{ uanNumber: null }, { uanNumber: "" }],
        ...(organizationId && { organizationId }),
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        department: true,
        designation: true,
        uanNumber: true,
      },
    });

    if (employeesWithoutUAN.length > 0) {
      warnings.push({
        id: "uan_number",
        type: "uan_number",
        message: "Employee without UAN Number",
        count: employeesWithoutUAN.length,
        employees: employeesWithoutUAN,
      });
    }

    return warnings;
  },

  async getRecentPayruns(organizationId?: string, limit: number = 5) {
    return db.payrun.findMany({
      where: {
        status: { in: ["COMPLETED", "PROCESSING"] },
      },
      select: {
        id: true,
        month: true,
        year: true,
        status: true,
        totalAmount: true,
        processedAt: true,
        _count: {
          select: {
            payslips: true,
          },
        },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: limit,
    });
  },
};
