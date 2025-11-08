export const ROLES = [
  "Employee",
  "HR Officer",
  "Payroll Officer",
  "Admin",
] as const;

export const MODULES = [
  {
    name: "Dashboard",
    permissions: ["View", "Export Data"],
  },
  {
    name: "Employees",
    permissions: ["View", "Create", "Edit", "Delete", "Export"],
  },
  {
    name: "Attendance",
    permissions: ["View", "Create", "Edit", "Delete", "Approve", "Export"],
  },
  {
    name: "Time Off",
    permissions: ["View", "Create", "Edit", "Delete", "Approve", "Export"],
  },
  {
    name: "Payroll",
    permissions: ["View", "Create", "Edit", "Delete", "Process", "Export"],
  },
  {
    name: "Reports",
    permissions: ["View", "Generate", "Export", "Schedule"],
  },
  {
    name: "Settings",
    permissions: ["View", "Edit", "Manage Users", "System Configuration"],
  },
];

export const DEFAULT_PERMISSIONS: Record<string, Record<string, string[]>> = {
  Employee: {
    Dashboard: ["View"],
    Employees: ["View"],
    Attendance: ["View", "Create"],
    "Time Off": ["View", "Create"],
    Payroll: ["View"],
    Reports: ["View"],
    Settings: [],
  },
  "HR Officer": {
    Dashboard: ["View", "Export Data"],
    Employees: ["View", "Create", "Edit", "Export"],
    Attendance: ["View", "Create", "Edit", "Approve", "Export"],
    "Time Off": ["View", "Create", "Edit", "Approve", "Export"],
    Payroll: ["View"],
    Reports: ["View", "Generate", "Export"],
    Settings: ["View"],
  },
  "Payroll Officer": {
    Dashboard: ["View", "Export Data"],
    Employees: ["View", "Export"],
    Attendance: ["View", "Export"],
    "Time Off": ["View", "Export"],
    Payroll: ["View", "Create", "Edit", "Process", "Export"],
    Reports: ["View", "Generate", "Export"],
    Settings: ["View"],
  },
  Admin: {
    Dashboard: ["View", "Export Data"],
    Employees: ["View", "Create", "Edit", "Delete", "Export"],
    Attendance: ["View", "Create", "Edit", "Delete", "Approve", "Export"],
    "Time Off": ["View", "Create", "Edit", "Delete", "Approve", "Export"],
    Payroll: ["View", "Create", "Edit", "Delete", "Process", "Export"],
    Reports: ["View", "Generate", "Export", "Schedule"],
    Settings: ["View", "Edit", "Manage Users", "System Configuration"],
  },
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  Admin: "Full system access with user management capabilities",
  "HR Officer": "Manage employees, attendance, and leave requests",
  "Payroll Officer": "Process payroll and manage salary components",
  Employee: "Basic access to view personal information and submit requests",
};
