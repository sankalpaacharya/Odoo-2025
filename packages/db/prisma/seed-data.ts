import { PrismaClient } from "../prisma/generated/client";
import {
  Role,
  LeaveType,
  LeaveStatus,
  EmploymentStatus,
  Gender,
  ComponentType,
} from "../prisma/generated/enums";
import { config } from "dotenv";
import { resolve } from "path";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// Load environment variables from the server app
config({ path: resolve(__dirname, "../../../apps/server/.env") });

// Set default DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://postgres:password@localhost:5432/my-better-t-app";
}

const prisma = new PrismaClient();

// Create Better Auth instance for seeding
const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: false,
      },
      lastName: {
        type: "string",
        required: false,
      },
      companyName: {
        type: "string",
        required: false,
      },
    },
  },
});

const ORGANIZATION_NAME = "TechCorp Solutions";
const TOTAL_USERS = 100;
const USERS_PER_ROLE = 25;
const DEFAULT_PASSWORD = "Welcome@123"; // Default password for all seeded employees

// Notionists API endpoint for avatars
const NOTIONISTS_API = "https://api.dicebear.com/7.x/notionists/svg";

// Departments and designations
const DEPARTMENTS = [
  "Engineering",
  "HR",
  "Finance",
  "Operations",
  "Marketing",
  "Sales",
];
const DESIGNATIONS: Record<Role, string[]> = {
  ADMIN: ["CEO", "CTO", "CFO", "Director"],
  HR_OFFICER: ["HR Manager", "HR Executive", "Talent Acquisition Lead"],
  PAYROLL_OFFICER: [
    "Payroll Manager",
    "Payroll Specialist",
    "Finance Executive",
  ],
  EMPLOYEE: [
    "Software Engineer",
    "Senior Engineer",
    "Marketing Executive",
    "Sales Executive",
    "Operations Manager",
    "Analyst",
  ],
};

const FIRST_NAMES = [
  "Amit",
  "Priya",
  "Rahul",
  "Sneha",
  "Arjun",
  "Pooja",
  "Vikram",
  "Ananya",
  "Karan",
  "Divya",
  "Rohan",
  "Meera",
  "Aditya",
  "Kavya",
  "Sanjay",
  "Riya",
  "Nikhil",
  "Ishita",
  "Varun",
  "Shreya",
  "Manish",
  "Nisha",
  "Rajesh",
  "Swati",
  "Kunal",
  "Tanvi",
  "Abhishek",
  "Sakshi",
  "Deepak",
  "Pallavi",
  "Suresh",
  "Anjali",
];

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Kumar",
  "Singh",
  "Reddy",
  "Gupta",
  "Mehta",
  "Rao",
  "Joshi",
  "Nair",
  "Verma",
  "Kapoor",
  "Desai",
  "Bhat",
  "Iyer",
  "Menon",
  "Kulkarni",
  "Agarwal",
  "Malhotra",
  "Shetty",
  "Pandey",
  "Chopra",
  "Bansal",
  "Shah",
];

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

function getNotionistsAvatar(seed: string): string {
  return `${NOTIONISTS_API}?seed=${encodeURIComponent(seed)}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getWorkingDaysInMonth(year: number, month: number): number {
  const daysInMonth = getDaysInMonth(year, month);
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (!isWeekend(date)) {
      workingDays++;
    }
  }
  return workingDays;
}

async function main() {
  console.log("Starting data seeding...");

  // Clear existing data (be careful with this in production!)
  console.log("Cleaning existing data...");
  await prisma.payslip.deleteMany({});
  await prisma.payrun.deleteMany({});
  await prisma.salaryComponent.deleteMany({});
  await prisma.workSession.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.leaveBalance.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  // Create Organization
  console.log("Creating organization...");
  const organization = await prisma.organization.create({
    data: {
      companyName: ORGANIZATION_NAME,
      logo: null,
    },
  });
  console.log(`✅ Created organization: ${organization.companyName}`);

  // Calculate dates
  const now = new Date();
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const joiningDateStart = new Date(twoMonthsAgo);
  joiningDateStart.setMonth(joiningDateStart.getMonth() - 12); // Joined 1 year before the 2-month period

  const currentYear = now.getFullYear();

  // Generate users with employees
  console.log(`Creating ${TOTAL_USERS} users and employees...`);
  const employees: any[] = [];
  const roles = [
    Role.ADMIN,
    Role.HR_OFFICER,
    Role.PAYROLL_OFFICER,
    Role.EMPLOYEE,
  ];

  let employeeCount = 1;

  for (let roleIndex = 0; roleIndex < roles.length; roleIndex++) {
    const role = roles[roleIndex] || "ADMIN";

    for (let i = 0; i < USERS_PER_ROLE; i++) {
      const firstName = getRandomElement(FIRST_NAMES);
      const lastName = getRandomElement(LAST_NAMES);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${employeeCount}@techcorp.com`;
      const employeeCode = `EMP${String(employeeCount).padStart(4, "0")}`;
      const profileImageUrl = getNotionistsAvatar(email);

      // Create user with Better Auth
      console.log(`  Creating user ${employeeCount}/${TOTAL_USERS}: ${email}`);
      const signupResult = await auth.api.signUpEmail({
        body: {
          email: email,
          password: DEFAULT_PASSWORD,
          name: `${firstName} ${lastName}`,
          // @ts-ignore - additional fields
          firstName: firstName,
          lastName: lastName,
          companyName: ORGANIZATION_NAME,
        },
      });

      if (!signupResult || !signupResult.user) {
        throw new Error(`Failed to create user account for ${email}`);
      }

      const employee = await prisma.employee.create({
        data: {
          userId: signupResult.user.id,
          organizationId: organization.id,
          employeeCode: employeeCode,
          firstName: firstName,
          middleName:
            Math.random() > 0.7 ? getRandomElement(FIRST_NAMES) : null,
          lastName: lastName,
          profileImage: profileImageUrl,
          dateOfBirth: new Date(
            1985 + Math.floor(Math.random() * 15),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          gender: getRandomElement([Gender.MALE, Gender.FEMALE, Gender.OTHER]),
          phone: `+91${Math.floor(7000000000 + Math.random() * 2999999999)}`,
          address: `${Math.floor(Math.random() * 999) + 1}, ${getRandomElement([
            "MG Road",
            "Park Street",
            "Main Road",
            "High Street",
          ])}`,
          city: getRandomElement(CITIES),
          state: getRandomElement([
            "Maharashtra",
            "Karnataka",
            "Delhi",
            "Tamil Nadu",
          ]),
          country: "India",
          postalCode: `${Math.floor(100000 + Math.random() * 899999)}`,
          role: role,
          department: getRandomElement(DEPARTMENTS),
          designation: getRandomElement(DESIGNATIONS[role]),
          dateOfJoining: joiningDateStart,
          employmentStatus: EmploymentStatus.ACTIVE,
          basicSalary:
            role === Role.ADMIN
              ? 150000
              : role === Role.HR_OFFICER
              ? 80000
              : role === Role.PAYROLL_OFFICER
              ? 85000
              : 40000 + Math.floor(Math.random() * 60000),
          pfContribution: 1800,
          professionalTax: 200,
          accountNumber: `${Math.floor(
            10000000000 + Math.random() * 89999999999
          )}`,
          bankName: getRandomElement([
            "HDFC Bank",
            "ICICI Bank",
            "SBI",
            "Axis Bank",
            "Kotak Bank",
          ]),
          ifscCode: `${getRandomElement([
            "HDFC",
            "ICIC",
            "SBIN",
            "UTIB",
            "KKBK",
          ])}0001234`,
          panNumber: `${String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )}${String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )}${String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )}${String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )}${String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )}${Math.floor(1000 + Math.random() * 8999)}${String.fromCharCode(
            65 + Math.floor(Math.random() * 26)
          )}`,
          uanNumber: `${Math.floor(
            100000000000 + Math.random() * 899999999999
          )}`,
        },
      });

      // Create leave balances for the current year
      await prisma.leaveBalance.createMany({
        data: [
          {
            employeeId: employee.id,
            leaveType: LeaveType.PAID_TIME_OFF,
            year: currentYear,
            allocated: 20,
            used: 0,
            remaining: 20,
          },
          {
            employeeId: employee.id,
            leaveType: LeaveType.SICK_LEAVE,
            year: currentYear,
            allocated: 12,
            used: 0,
            remaining: 12,
          },
          {
            employeeId: employee.id,
            leaveType: LeaveType.UNPAID_LEAVE,
            year: currentYear,
            allocated: 10,
            used: 0,
            remaining: 10,
          },
        ],
      });

      employees.push(employee);
      employeeCount++;
    }
  }

  console.log(`✅ Created ${employees.length} employees with all roles`);

  // Generate leave requests
  console.log("Creating leave requests...");
  const approverIds = employees
    .filter((e) => e.role === Role.ADMIN || e.role === Role.HR_OFFICER)
    .map((e) => e.id);
  const leaveRequestsData: Array<{
    employeeId: string;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    status: LeaveStatus;
    approvedBy?: string;
    approvedAt?: Date;
    rejectionReason?: string;
  }> = [];

  for (const employee of employees) {
    // Each employee gets 3-8 leave requests
    const numLeaves = 3 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numLeaves; i++) {
      const leaveType = getRandomElement([
        LeaveType.PAID_TIME_OFF,
        LeaveType.SICK_LEAVE,
        LeaveType.UNPAID_LEAVE,
      ]);
      const startDate = getRandomDate(twoMonthsAgo, now);
      const duration = 1 + Math.floor(Math.random() * 5); // 1-5 days
      const endDate = addDays(startDate, duration - 1);

      // 70% approved, 20% rejected, 10% pending
      const rand = Math.random();
      let status: LeaveStatus;
      let approvedBy: string | undefined;
      let approvedAt: Date | undefined;
      let rejectionReason: string | undefined;

      if (rand < 0.7) {
        status = LeaveStatus.APPROVED;
        approvedBy = getRandomElement(approverIds);
        approvedAt = addDays(startDate, -Math.floor(Math.random() * 3) - 1);
      } else if (rand < 0.9) {
        status = LeaveStatus.REJECTED;
        approvedBy = getRandomElement(approverIds);
        approvedAt = addDays(startDate, -Math.floor(Math.random() * 3) - 1);
        rejectionReason = getRandomElement([
          "Insufficient leave balance",
          "Peak work period, cannot approve",
          "Multiple team members already on leave",
          "Need to complete pending tasks first",
        ]);
      } else {
        status = LeaveStatus.PENDING;
      }

      leaveRequestsData.push({
        employeeId: employee.id,
        leaveType,
        startDate,
        endDate,
        status,
        approvedBy,
        approvedAt,
        rejectionReason,
      });
    }
  }

  // Create leave requests in batches
  for (const leaveData of leaveRequestsData) {
    await prisma.leave.create({
      data: {
        employeeId: leaveData.employeeId,
        leaveType: leaveData.leaveType,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        totalDays:
          Math.ceil(
            (leaveData.endDate.getTime() - leaveData.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1,
        reason: getRandomElement([
          "Personal work",
          "Family function",
          "Medical appointment",
          "Vacation",
          "Not feeling well",
          "Emergency at home",
        ]),
        status: leaveData.status,
        approvedBy: leaveData.approvedBy,
        approvedAt: leaveData.approvedAt,
        rejectionReason: leaveData.rejectionReason,
      },
    });
  }

  console.log(`✅ Created ${leaveRequestsData.length} leave requests`);

  // Get approved leaves for each employee to avoid creating work sessions
  const approvedLeaves = await prisma.leave.findMany({
    where: { status: LeaveStatus.APPROVED },
  });

  const employeeApprovedLeaves = new Map<
    string,
    Array<{ start: Date; end: Date }>
  >();
  for (const leave of approvedLeaves) {
    if (!employeeApprovedLeaves.has(leave.employeeId)) {
      employeeApprovedLeaves.set(leave.employeeId, []);
    }
    employeeApprovedLeaves.get(leave.employeeId)!.push({
      start: leave.startDate,
      end: leave.endDate,
    });
  }

  // Generate work sessions for past 2 months
  console.log("Creating work sessions for the past 2 months...");
  const workSessionsData: any[] = [];

  for (const employee of employees) {
    const employeeLeaves = employeeApprovedLeaves.get(employee.id) || [];

    let currentDate = new Date(twoMonthsAgo);
    while (currentDate <= now) {
      // Skip weekends
      if (isWeekend(currentDate)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      // Check if on approved leave
      const isOnLeave = employeeLeaves.some((leave) => {
        return currentDate >= leave.start && currentDate <= leave.end;
      });

      if (isOnLeave) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      // 90% attendance rate (10% random absences)
      if (Math.random() < 0.9) {
        // Work hours: 9 AM to 6 PM with variations
        const startHour = 8 + Math.random() * 2; // 8-10 AM
        const workDuration = 8 + Math.random() * 2; // 8-10 hours

        const sessionDate = new Date(currentDate);
        sessionDate.setHours(0, 0, 0, 0);

        const startTime = new Date(currentDate);
        startTime.setHours(
          Math.floor(startHour),
          Math.floor((startHour % 1) * 60),
          0,
          0
        );

        const endTime = addHours(startTime, workDuration);

        // Break time: 30-60 minutes
        const breakDuration = 0.5 + Math.random() * 0.5;
        const breakStart = addHours(startTime, 4 + Math.random() * 2);
        const breakEnd = addHours(breakStart, breakDuration);

        const actualWorkHours = workDuration - breakDuration;
        const overtimeHours = actualWorkHours > 9 ? actualWorkHours - 9 : 0;

        workSessionsData.push({
          employeeId: employee.id,
          date: sessionDate,
          startTime: startTime,
          endTime: endTime,
          isActive: false,
          breakStartTime: breakStart,
          breakEndTime: breakEnd,
          totalBreakTime: breakDuration,
          workingHours: actualWorkHours - overtimeHours,
          overtimeHours: overtimeHours,
        });
      }

      currentDate = addDays(currentDate, 1);
    }
  }

  // Create work sessions in batches of 1000
  console.log(`Creating ${workSessionsData.length} work sessions...`);
  const batchSize = 1000;
  for (let i = 0; i < workSessionsData.length; i += batchSize) {
    const batch = workSessionsData.slice(i, i + batchSize);
    await prisma.workSession.createMany({
      data: batch,
    });
    console.log(
      `  Inserted ${Math.min(i + batchSize, workSessionsData.length)}/${
        workSessionsData.length
      } work sessions`
    );
  }

  console.log(`✅ Created ${workSessionsData.length} work sessions`);

  // Update leave balances based on approved leaves
  console.log("Updating leave balances...");
  for (const employee of employees) {
    const approvedEmployeeLeaves = approvedLeaves.filter(
      (l) => l.employeeId === employee.id
    );

    const leaveTypeUsage = {
      [LeaveType.PAID_TIME_OFF]: 0,
      [LeaveType.SICK_LEAVE]: 0,
      [LeaveType.UNPAID_LEAVE]: 0,
    };

    for (const leave of approvedEmployeeLeaves) {
      leaveTypeUsage[leave.leaveType] += Number(leave.totalDays);
    }

    for (const [leaveType, used] of Object.entries(leaveTypeUsage)) {
      if (used > 0) {
        const balance = await prisma.leaveBalance.findFirst({
          where: {
            employeeId: employee.id,
            leaveType: leaveType as LeaveType,
            year: currentYear,
          },
        });

        if (balance) {
          await prisma.leaveBalance.update({
            where: { id: balance.id },
            data: {
              used: used,
              remaining: Number(balance.allocated) - used,
            },
          });
        }
      }
    }
  }

  console.log("✅ Updated leave balances");

  // Generate Payroll Data for past 3 months
  console.log("\nGenerating payroll data for past 3 months...");
  const payrunMonths = [];

  // Calculate the 3 months to generate payroll for
  for (let i = 2; i >= 0; i--) {
    const targetDate = new Date(now);
    targetDate.setMonth(targetDate.getMonth() - i - 1); // -1 because payroll is for previous month
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    payrunMonths.push({ month, year });
  }

  console.log(
    `Creating payruns and payslips for: ${payrunMonths
      .map((m) => `${m.month}/${m.year}`)
      .join(", ")}`
  );

  let totalPayslipsCreated = 0;

  for (const { month, year } of payrunMonths) {
    console.log(`\n  Processing payrun for ${month}/${year}...`);

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    // Create payrun
    const payrun = await prisma.payrun.create({
      data: {
        month,
        year,
        periodStart,
        periodEnd,
        status: "COMPLETED",
        processedAt: new Date(year, month, 5), // Processed on 5th of next month
        totalAmount: 0, // Will be updated after creating payslips
      },
    });

    const workingDaysInMonth = getWorkingDaysInMonth(year, month);
    const payslipsForMonth: any[] = [];

    // Create payslip for each employee
    for (const employee of employees) {
      // Get work sessions for this employee in this month
      const workSessions = await prisma.workSession.findMany({
        where: {
          employeeId: employee.id,
          date: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        select: {
          workingHours: true,
          overtimeHours: true,
        },
      });

      // Get approved leaves for this month
      const approvedLeaves = await prisma.leave.findMany({
        where: {
          employeeId: employee.id,
          status: LeaveStatus.APPROVED,
          startDate: {
            lte: periodEnd,
          },
          endDate: {
            gte: periodStart,
          },
        },
        select: {
          leaveType: true,
          startDate: true,
          endDate: true,
          totalDays: true,
        },
      });

      // Calculate attendance metrics
      const presentDays = workSessions.length;

      // Calculate leave days in this month
      let paidLeaveDays = 0;
      let unpaidLeaveDays = 0;

      for (const leave of approvedLeaves) {
        const leaveStart =
          leave.startDate > periodStart ? leave.startDate : periodStart;
        const leaveEnd = leave.endDate < periodEnd ? leave.endDate : periodEnd;

        let daysInMonth = 0;
        let currentDate = new Date(leaveStart);

        while (currentDate <= leaveEnd) {
          if (!isWeekend(currentDate)) {
            daysInMonth++;
          }
          currentDate = addDays(currentDate, 1);
        }

        if (leave.leaveType === LeaveType.UNPAID_LEAVE) {
          unpaidLeaveDays += daysInMonth;
        } else {
          paidLeaveDays += daysInMonth;
        }
      }

      const totalLeaveDays = paidLeaveDays + unpaidLeaveDays;
      const absentDays = Math.max(
        0,
        workingDaysInMonth - presentDays - totalLeaveDays
      );

      // Calculate overtime
      const overtimeHours = workSessions.reduce((sum, session) => {
        return (
          sum + (session.overtimeHours ? Number(session.overtimeHours) : 0)
        );
      }, 0);

      // Calculate salary components
      const basicSalary = Number(employee.basicSalary) * 0.5;
      const houseRentAllowance = basicSalary * 0.5; // 50% HRA
      const standardAllowance = 4167;
      const performanceBonus = basicSalary * 0.0833;
      const leaveTravelAllowance = basicSalary * 0.08333;
      const fixedAllowance =
        Number(employee.basicSalary) -
        (basicSalary +
          houseRentAllowance +
          standardAllowance +
          performanceBonus +
          leaveTravelAllowance);

      const grossSalary = Number(employee.basicSalary);

      // Calculate deductions
      const pfDeduction = basicSalary * 0.12; // 12% of basic
      const professionalTax = Number(employee.professionalTax);

      // LOP (Loss of Pay) deduction for absent and unpaid leave days
      const lopDays = Math.max(0, absentDays + unpaidLeaveDays);
      const lopDeduction =
        lopDays > 0
          ? Math.min(
              (grossSalary / workingDaysInMonth) * lopDays,
              grossSalary * 0.5
            )
          : 0; // Cap LOP at 50% of gross

      const totalDeductions = pfDeduction + professionalTax + lopDeduction;
      const netSalary = Math.max(0, grossSalary - totalDeductions); // Ensure net salary is never negative
      const totalEarnings = grossSalary;

      payslipsForMonth.push({
        employeeId: employee.id,
        payrunId: payrun.id,
        month,
        year,
        totalWorkingDays: workingDaysInMonth,
        workingDays: workingDaysInMonth,
        presentDays,
        absentDays,
        paidLeaveDays,
        unpaidLeaveDays,
        leaveDays: totalLeaveDays,
        overtimeHours,
        basicSalary,
        grossSalary,
        totalEarnings,
        totalDeductions,
        netSalary,
        pfDeduction,
        professionalTax,
        lopDeduction,
        otherDeductions: 0,
        status: "PAID",
        paidAt: new Date(year, month, 5),
      });
    }

    // Batch create payslips
    await prisma.payslip.createMany({
      data: payslipsForMonth,
    });

    // Update payrun total amount
    const totalAmount = payslipsForMonth.reduce(
      (sum, p) => sum + p.netSalary,
      0
    );
    await prisma.payrun.update({
      where: { id: payrun.id },
      data: { totalAmount },
    });

    totalPayslipsCreated += payslipsForMonth.length;
    console.log(
      `  ✅ Created ${payslipsForMonth.length} payslips for ${month}/${year}`
    );
    console.log(
      `     Total payout: ₹${totalAmount.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      })}`
    );
  }

  console.log(
    `\n✅ Created ${payrunMonths.length} payruns with ${totalPayslipsCreated} total payslips`
  );

  // Create some salary components for random employees
  console.log("\nCreating custom salary components...");
  const salaryComponentsData: any[] = [];

  // Give 20% of employees some custom components
  const employeesWithComponents = employees
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(employees.length * 0.2));

  for (const employee of employeesWithComponents) {
    // Add 1-3 components per employee
    const numComponents = 1 + Math.floor(Math.random() * 3);

    for (let i = 0; i < numComponents; i++) {
      const isEarning = Math.random() > 0.3; // 70% earnings, 30% deductions

      if (isEarning) {
        const component = getRandomElement([
          {
            name: "Special Allowance",
            amount: 2000 + Math.floor(Math.random() * 5000),
          },
          {
            name: "Transport Allowance",
            amount: 1500 + Math.floor(Math.random() * 2500),
          },
          {
            name: "Mobile Allowance",
            amount: 500 + Math.floor(Math.random() * 1500),
          },
          {
            name: "Meal Allowance",
            amount: 1000 + Math.floor(Math.random() * 2000),
          },
          {
            name: "Incentive",
            amount: 3000 + Math.floor(Math.random() * 7000),
          },
        ]);

        salaryComponentsData.push({
          employeeId: employee.id,
          name: component.name,
          type: "EARNING",
          amount: component.amount,
          isPercentage: false,
          isRecurring: true,
          isActive: true,
        });
      } else {
        const component = getRandomElement([
          {
            name: "Loan Repayment",
            amount: 2000 + Math.floor(Math.random() * 8000),
          },
          {
            name: "Insurance Premium",
            amount: 1000 + Math.floor(Math.random() * 3000),
          },
          {
            name: "Other Deduction",
            amount: 500 + Math.floor(Math.random() * 2000),
          },
        ]);

        salaryComponentsData.push({
          employeeId: employee.id,
          name: component.name,
          type: "DEDUCTION",
          amount: component.amount,
          isPercentage: false,
          isRecurring: true,
          isActive: true,
        });
      }
    }
  }

  await prisma.salaryComponent.createMany({
    data: salaryComponentsData,
  });

  console.log(
    `✅ Created ${salaryComponentsData.length} custom salary components for ${employeesWithComponents.length} employees`
  );

  // Summary
  console.log("\n=== Seeding Summary ===");
  console.log(`Organizations: 1`);
  console.log(`Users: ${TOTAL_USERS}`);
  console.log(`Employees by role:`);
  console.log(`  - ADMIN: ${USERS_PER_ROLE}`);
  console.log(`  - HR_OFFICER: ${USERS_PER_ROLE}`);
  console.log(`  - PAYROLL_OFFICER: ${USERS_PER_ROLE}`);
  console.log(`  - EMPLOYEE: ${USERS_PER_ROLE}`);
  console.log(`Leave Requests: ${leaveRequestsData.length}`);
  console.log(
    `  - Approved: ${
      leaveRequestsData.filter((l) => l.status === LeaveStatus.APPROVED).length
    }`
  );
  console.log(
    `  - Rejected: ${
      leaveRequestsData.filter((l) => l.status === LeaveStatus.REJECTED).length
    }`
  );
  console.log(
    `  - Pending: ${
      leaveRequestsData.filter((l) => l.status === LeaveStatus.PENDING).length
    }`
  );
  console.log(`Work Sessions: ${workSessionsData.length}`);
  console.log(`Payruns: ${payrunMonths.length}`);
  console.log(`Payslips: ${totalPayslipsCreated}`);
  console.log(`Custom Salary Components: ${salaryComponentsData.length}`);
  console.log(`\n🔐 Login Credentials:`);
  console.log(
    `  All users can login with their email and password: ${DEFAULT_PASSWORD}`
  );
  console.log(`  Example: amit.sharma1@techcorp.com / ${DEFAULT_PASSWORD}`);
  console.log(`\n🖼️  Profile Pictures:`);
  console.log(`  All users have profile pictures from Notionists avatars`);
  console.log(`\n✅ Seeding completed successfully!`);
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
