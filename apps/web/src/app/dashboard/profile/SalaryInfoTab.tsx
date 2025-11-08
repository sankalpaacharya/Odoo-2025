"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SalaryInfoTabProps {
  isEditing: boolean;
}

interface SalaryFieldProps {
  title: string;
  amount: number;
  percentage?: number;
  unit?: string;
  description?: string;
  isEditing: boolean;
}

function SalaryField({
  title,
  amount,
  percentage,
  unit = "₹ / month",
  description,
  isEditing,
}: SalaryFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={amount.toFixed(2)}
            readOnly={!isEditing}
            className="h-10"
          />
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {percentage !== undefined && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={percentage.toFixed(2)}
              readOnly={!isEditing}
              className="h-10"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

interface SimpleFieldProps {
  title: string;
  value: number;
  unit: string;
  isEditing: boolean;
  readOnly?: boolean;
}

function SimpleField({
  title,
  value,
  unit,
  isEditing,
  readOnly = false,
}: SimpleFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">
        {title}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value.toFixed(2)}
          readOnly={readOnly || !isEditing}
          className={`h-10 ${readOnly ? "bg-muted/50" : ""}`}
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export default function SalaryInfoTab({ isEditing }: SalaryInfoTabProps) {
  const basicSalary = 25000;
  const yearlyWage = basicSalary * 12;

  const houseRentAllowance = basicSalary * 0.5;
  const standardAllowance = 4167;
  const performanceBonus = basicSalary * 0.0833;
  const leaveTravelAllowance = basicSalary * 0.0833;
  const fixedAllowance = 2919;

  const hraPercentage = 50;
  const standardAllowancePercentage = (standardAllowance / basicSalary) * 100;
  const performanceBonusPercentage = 8.33;
  const leaveTravelPercentage = 8.33;
  const fixedAllowancePercentage = (fixedAllowance / basicSalary) * 100;

  const pfEmployeeContribution = basicSalary * 0.12;
  const pfEmployerContribution = basicSalary * 0.12;
  const pfPercentage = 12;

  const professionalTax = 200;

  return (
    <div className="space-y-8">
      {/* Wage Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <SimpleField
          title="Month Wage"
          value={basicSalary}
          unit="₹ / month"
          isEditing={isEditing}
        />
        <SimpleField
          title="No of working days in a week:"
          value={5}
          unit="days"
          isEditing={isEditing}
        />
        <SimpleField
          title="Yearly wage"
          value={yearlyWage}
          unit="₹ / Yearly"
          isEditing={isEditing}
          readOnly
        />
        <SimpleField
          title="Break Time:"
          value={1}
          unit="/hrs"
          isEditing={isEditing}
        />
      </div>

      {/* Salary Components */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Salary Components</h3>
        <div className="space-y-4">
          <SalaryField
            title="Basic Salary"
            amount={basicSalary}
            percentage={50}
            isEditing={isEditing}
            description="Define Basic salary from company cost compute it based on monthly Wages"
          />
          <SalaryField
            title="House Rent Allowance"
            amount={houseRentAllowance}
            percentage={hraPercentage}
            isEditing={isEditing}
            description="HRA provided to employees. 50% of the basic salary"
          />
          <SalaryField
            title="Standard Allowance"
            amount={standardAllowance}
            percentage={standardAllowancePercentage}
            isEditing={isEditing}
            description="A standard allowance is a predetermined, fixed amount provided to employee as part of their salary"
          />
          <SalaryField
            title="Performance Bonus"
            amount={performanceBonus}
            percentage={performanceBonusPercentage}
            isEditing={isEditing}
            description="Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary"
          />
          <SalaryField
            title="Leave Travel Allowance"
            amount={leaveTravelAllowance}
            percentage={leaveTravelPercentage}
            isEditing={isEditing}
            description="LTA is paid by the company to employees to cover their travel expenses. and calculated as a % of the basic salary"
          />
          <SalaryField
            title="Fixed Allowance"
            amount={fixedAllowance}
            percentage={fixedAllowancePercentage}
            isEditing={isEditing}
            description="Fixed allowance portion of wages is determined after calculating all salary components"
          />
        </div>
      </div>

      <div>
        {/* Provident Fund Contribution */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Provident Fund (PF) Contribution
          </h3>
          <div className="space-y-4">
            <SalaryField
              title="Employee"
              amount={pfEmployeeContribution}
              percentage={pfPercentage}
              isEditing={isEditing}
              description="Employee contribution to the basic salary"
            />
            <SalaryField
              title="Employer"
              amount={pfEmployerContribution}
              percentage={pfPercentage}
              isEditing={isEditing}
              description="PF is calculated based on the basic salary"
            />
          </div>
        </div>

        {/* Tax Deductions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tax Deductions</h3>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Professional Tax</Label>
            <div className="flex items-center gap-2 max-w-md">
              <Input
                type="number"
                value={professionalTax.toFixed(2)}
                readOnly={!isEditing}
                className="h-10"
              />
              <span className="text-sm text-muted-foreground">₹ / month</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional Tax deducted from the Gross salary
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
