"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable, type Column } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string | null;
  designation: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  ifscCode?: string | null;
  panNumber?: string | null;
  uanNumber?: string | null;
}

interface Warning {
  id: string;
  type: string;
  message: string;
  count: number;
  employees: Employee[];
}

interface PayrollWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warning: Warning | null;
}

export function PayrollWarningModal({
  open,
  onOpenChange,
  warning,
}: PayrollWarningModalProps) {
  if (!warning) return null;

  const getColumns = (): Column<Employee>[] => {
    const baseColumns: Column<Employee>[] = [
      {
        key: "employeeCode",
        label: "Employee Code",
        sortable: true,
      },
      {
        key: "name",
        label: "Name",
        sortable: true,
        render: (employee) => `${employee.firstName} ${employee.lastName}`,
      },
    ];

    if (warning.type === "bank_account") {
      baseColumns.push(
        {
          key: "accountNumber",
          label: "Account Number",
          sortable: false,
          render: (employee) =>
            employee.accountNumber ? (
              <Badge variant="secondary">{employee.accountNumber}</Badge>
            ) : (
              <Badge variant="destructive">Missing</Badge>
            ),
        },
        {
          key: "bankName",
          label: "Bank Name",
          sortable: false,
          render: (employee) =>
            employee.bankName ? (
              <span>{employee.bankName}</span>
            ) : (
              <Badge variant="destructive">Missing</Badge>
            ),
        },
        {
          key: "ifscCode",
          label: "IFSC Code",
          sortable: false,
          render: (employee) =>
            employee.ifscCode ? (
              <span>{employee.ifscCode}</span>
            ) : (
              <Badge variant="destructive">Missing</Badge>
            ),
        }
      );
    } else if (warning.type === "pan_number") {
      baseColumns.push({
        key: "panNumber",
        label: "PAN Number",
        sortable: false,
        render: (employee) =>
          employee.panNumber ? (
            <Badge variant="secondary">{employee.panNumber}</Badge>
          ) : (
            <Badge variant="destructive">Missing</Badge>
          ),
      });
    } else if (warning.type === "uan_number") {
      baseColumns.push({
        key: "uanNumber",
        label: "UAN Number",
        sortable: false,
        render: (employee) =>
          employee.uanNumber ? (
            <Badge variant="secondary">{employee.uanNumber}</Badge>
          ) : (
            <Badge variant="destructive">Missing</Badge>
          ),
      });
    }

    return baseColumns;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{warning.message}</DialogTitle>
          <DialogDescription>
            {warning.count} employee{warning.count !== 1 ? "s" : ""} with
            incomplete information
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <DataTable
            data={warning.employees}
            columns={getColumns()}
            keyExtractor={(employee) => employee.id}
            emptyMessage="No employees found"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
