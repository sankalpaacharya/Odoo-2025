"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/loader";
import { useTodayAttendance } from "../hooks";
import { formatTime, formatStatus, getStatusColor } from "../utils";
import { toast } from "sonner";
import type { EmployeeAttendance } from "../types";

export function AdminAttendanceView() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: attendances = [], isLoading, error } = useTodayAttendance();

  if (error) {
    toast.error("Failed to load today's attendance");
  }

  const filteredAttendances = attendances.filter(
    (record: EmployeeAttendance) =>
      record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEmployees = attendances.length;
  const presentToday = attendances.filter(
    (e: EmployeeAttendance) => e.status === "PRESENT" || e.status === "LATE"
  ).length;
  const onLeave = attendances.filter(
    (e: EmployeeAttendance) => e.status === "ON_LEAVE"
  ).length;
  const absent = attendances.filter(
    (e: EmployeeAttendance) => e.status === "ABSENT"
  ).length;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
            <SelectItem value="late">Late</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {presentToday}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalEmployees > 0
                ? ((presentToday / totalEmployees) * 100).toFixed(1)
                : 0}
              % attendance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{onLeave}</div>
            <p className="text-xs text-muted-foreground">Employees on leave</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absent}</div>
            <p className="text-xs text-muted-foreground">Absent employees</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg">
        <div className="py-4">
          <h2 className="text-lg font-semibold">Today's Attendance</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendances.length > 0 ? (
              filteredAttendances.map((record: EmployeeAttendance) => (
                <TableRow key={record.employeeId}>
                  <TableCell className="font-medium">
                    {record.employeeCode}
                  </TableCell>
                  <TableCell>{record.employeeName}</TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell>{record.designation || "N/A"}</TableCell>
                  <TableCell>{formatTime(record.checkIn)}</TableCell>
                  <TableCell>{formatTime(record.checkOut)}</TableCell>
                  <TableCell>
                    {record.workingHours > 0
                      ? `${record.workingHours.toFixed(2)}h`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(record.status)}>
                      {formatStatus(record.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  No employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
