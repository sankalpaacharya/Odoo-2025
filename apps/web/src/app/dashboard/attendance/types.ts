export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LATE"
  | "ON_LEAVE"
  | "HOLIDAY"
  | "WEEKEND";

export interface AttendanceRecord {
  id: string;
  date: Date | string;
  checkIn: Date | string | null;
  checkOut: Date | string | null;
  workingHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
}

export interface EmployeeAttendance {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: AttendanceStatus;
}
