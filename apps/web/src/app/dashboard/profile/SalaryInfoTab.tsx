"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileData } from "@/types/profile";
import { useMemo } from "react";

interface SalaryInfoTabProps {
  profile: ProfileData;
}

interface SalaryFieldProps {
  title: string;
  amount: number;
  percentage?: number;
  unit?: string;
  description?: string;
}

function SalaryField({ title, amount, percentage, unit = "₹ / month", description }: SalaryFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Input type="number" value={amount.toFixed(2)} readOnly className="h-10 bg-muted/50" />
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {percentage !== undefined && (
          <div className="flex items-center gap-2">
            <Input type="number" value={percentage.toFixed(2)} readOnly className="h-10 bg-muted/50" />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

interface SimpleFieldProps {
  title: string;
  value: number;
  unit: string;
  readOnly?: boolean;
}

function SimpleField({ title, value, unit, readOnly = false }: SimpleFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-muted-foreground">{title}</Label>
      <div className="flex items-center gap-2">
        <Input type="number" value={value.toFixed(2)} readOnly className="h-10 bg-muted/50" />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export default function SalaryInfoTab({ profile }: SalaryInfoTabProps) {
  const basicSalary = useMemo(() => Number(profile.salary.basicSalary), [profile.salary.basicSalary]);
  const yearlyWage = useMemo(() => basicSalary * 12, [basicSalary]);

  // Get salary components or use defaults
  const components = useMemo(() => {
    const comps = profile.salary.components;

    // Helper function to find component
    const findComponent = (name: string) => comps.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));

    // HRA - House Rent Allowance
    const hra = findComponent("house rent") || findComponent("hra");
    const houseRentAllowance = hra ? Number(hra.amount) : basicSalary * 0.5;
    const hraPercentage = hra?.isPercentage ? Number(hra.amount) : (houseRentAllowance / basicSalary) * 100;

    // Standard Allowance
    const sa = findComponent("standard");
    const standardAllowance = sa ? Number(sa.amount) : 4167;
    const standardAllowancePercentage = sa?.isPercentage ? Number(sa.amount) : (standardAllowance / basicSalary) * 100;

    // Performance Bonus
    const pb = findComponent("performance") || findComponent("bonus");
    const performanceBonus = pb ? Number(pb.amount) : basicSalary * 0.0833;
    const performanceBonusPercentage = pb?.isPercentage ? Number(pb.amount) : (performanceBonus / basicSalary) * 100;

    // Leave Travel Allowance
    const lta = findComponent("leave travel") || findComponent("lta");
    const leaveTravelAllowance = lta ? Number(lta.amount) : basicSalary * 0.0833;
    const leaveTravelPercentage = lta?.isPercentage ? Number(lta.amount) : (leaveTravelAllowance / basicSalary) * 100;

    // Fixed Allowance
    const fa = findComponent("fixed");
    const fixedAllowance = fa ? Number(fa.amount) : 2919;
    const fixedAllowancePercentage = fa?.isPercentage ? Number(fa.amount) : (fixedAllowance / basicSalary) * 100;

    return {
      houseRentAllowance,
      hraPercentage,
      standardAllowance,
      standardAllowancePercentage,
      performanceBonus,
      performanceBonusPercentage,
      leaveTravelAllowance,
      leaveTravelPercentage,
      fixedAllowance,
      fixedAllowancePercentage,
    };
  }, [profile.salary.components, basicSalary]);

  const pfEmployeeContribution = useMemo(() => Number(profile.salary.pfContribution), [profile.salary.pfContribution]);
  const pfEmployerContribution = useMemo(() => Number(profile.salary.pfContribution), [profile.salary.pfContribution]);
  const pfPercentage = useMemo(() => (pfEmployeeContribution / basicSalary) * 100, [pfEmployeeContribution, basicSalary]);

  const professionalTax = useMemo(() => Number(profile.salary.professionalTax), [profile.salary.professionalTax]);

  return (
    <div className="space-y-8">
      {/* Wage Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <SimpleField title="Month Wage" value={basicSalary} unit="₹ / month" />
        <SimpleField title="No of working days in a week:" value={5} unit="days" />
        <SimpleField title="Yearly wage" value={yearlyWage} unit="₹ / Yearly" readOnly />
        <SimpleField title="Break Time:" value={1} unit="/hrs" />
      </div>

      {/* Salary Components */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Salary Components</h3>
        <div className="space-y-4">
          <SalaryField
            title="Basic Salary"
            amount={basicSalary}
            percentage={50}
            description="Define Basic salary from company cost compute it based on monthly Wages"
          />
          <SalaryField
            title="House Rent Allowance"
            amount={components.houseRentAllowance}
            percentage={components.hraPercentage}
            description="HRA provided to employees. 50% of the basic salary"
          />
          <SalaryField
            title="Standard Allowance"
            amount={components.standardAllowance}
            percentage={components.standardAllowancePercentage}
            description="A standard allowance is a predetermined, fixed amount provided to employee as part of their salary"
          />
          <SalaryField
            title="Performance Bonus"
            amount={components.performanceBonus}
            percentage={components.performanceBonusPercentage}
            description="Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary"
          />
          <SalaryField
            title="Leave Travel Allowance"
            amount={components.leaveTravelAllowance}
            percentage={components.leaveTravelPercentage}
            description="LTA is paid by the company to employees to cover their travel expenses. and calculated as a % of the basic salary"
          />
          <SalaryField
            title="Fixed Allowance"
            amount={components.fixedAllowance}
            percentage={components.fixedAllowancePercentage}
            description="Fixed allowance portion of wages is determined after calculating all salary components"
          />
        </div>
      </div>

      <div>
        {/* Provident Fund Contribution */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Provident Fund (PF) Contribution</h3>
          <div className="space-y-4">
            <SalaryField
              title="Employee"
              amount={pfEmployeeContribution}
              percentage={pfPercentage}
              description="Employee contribution to the basic salary"
            />
            <SalaryField
              title="Employer"
              amount={pfEmployerContribution}
              percentage={pfPercentage}
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
              <Input type="number" value={professionalTax.toFixed(2)} readOnly className="h-10 bg-muted/50" />
              <span className="text-sm text-muted-foreground">₹ / month</span>
            </div>
            <p className="text-sm text-muted-foreground">Professional Tax deducted from the Gross salary</p>
          </div>
        </div>
      </div>
    </div>
  );
}
