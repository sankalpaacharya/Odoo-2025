"use client";

import { useMemo, useState, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import type { ProfileData } from "@/types/profile";
import { useUpdateSalary } from "@/hooks/useProfile";
import { Separator } from "@/components/ui/separator";

interface SalaryInfoTabProps {
  profile: ProfileData;
}

interface SalaryComponents {
  hraPercentage?: number;
  standardAllowanceAmount?: number;
  performanceBonusPercentage?: number;
  leaveTravelPercentage?: number;
  fixedAllowancePercentage?: number;
}

interface ChangeTracker {
  monthlyWage?: number;
  pfPercentage?: number;
  professionalTax?: number;
  components: SalaryComponents;
}

interface SalaryFieldProps {
  title: string;
  amount: number;
  percentage?: number;
  unit?: string;
  description?: string;
  readOnlyAmount?: boolean;
  readOnlyPercentage?: boolean;
  onPercentageChange?: (percentage: number) => void;
  onAmountChange?: (amount: number) => void;
  isModified?: boolean;
}

const SalaryField = memo(function SalaryField({
  title,
  amount,
  percentage,
  unit = "₹ / month",
  description,
  readOnlyAmount = true,
  readOnlyPercentage = false,
  onPercentageChange,
  onAmountChange,
  isModified = false,
}: SalaryFieldProps) {
  const [localPercentage, setLocalPercentage] = useState<string>("");
  const [localAmount, setLocalAmount] = useState<string>("");
  const [isEditingPercentage, setIsEditingPercentage] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  const displayAmount = isEditingAmount
    ? localAmount
    : isFinite(amount)
    ? amount.toFixed(2)
    : "0.00";
  const displayPercentage = isEditingPercentage
    ? localPercentage
    : percentage !== undefined && isFinite(percentage)
    ? percentage.toFixed(2)
    : "0.00";

  const handlePercentageChange = (value: string) => {
    setLocalPercentage(value);
  };

  const handlePercentageBlur = () => {
    setIsEditingPercentage(false);
    if (!onPercentageChange || !localPercentage) {
      return;
    }
    const numValue = Number.parseFloat(localPercentage);
    if (!isNaN(numValue) && isFinite(numValue)) {
      onPercentageChange(numValue);
    }
  };

  const handlePercentageFocus = () => {
    if (readOnlyPercentage) {
      return;
    }
    setIsEditingPercentage(true);
    setLocalPercentage(percentage?.toString() || "0");
  };

  const handleAmountChange = (value: string) => {
    setLocalAmount(value);
  };

  const handleAmountBlur = () => {
    setIsEditingAmount(false);
    if (!onAmountChange || !localAmount) {
      return;
    }
    const numValue = Number.parseFloat(localAmount);
    if (!isNaN(numValue) && isFinite(numValue)) {
      onAmountChange(numValue);
    }
  };

  const handleAmountFocus = () => {
    if (readOnlyAmount) {
      return;
    }
    setIsEditingAmount(true);
    setLocalAmount(amount.toString());
  };

  return (
    <div className="space-y-1 py-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          {title}
          {isModified && (
            <span className="ml-2 text-xs text-orange-500 dark:text-orange-400">
              (modified)
            </span>
          )}
        </Label>
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={displayAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onFocus={handleAmountFocus}
            onBlur={handleAmountBlur}
            readOnly={readOnlyAmount}
            className={`h-10 ${
              isModified
                ? "border-orange-500 dark:border-orange-400"
                : "bg-muted/50"
            }`}
          />
          <span className="text-sm text-muted-foreground text-nowrap">
            {unit}
          </span>
        </div>
        {percentage !== undefined && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={displayPercentage}
              onChange={(e) => handlePercentageChange(e.target.value)}
              onFocus={handlePercentageFocus}
              onBlur={handlePercentageBlur}
              readOnly={readOnlyPercentage}
              className={`h-10 ${
                isModified
                  ? "border-orange-500 dark:border-orange-400"
                  : "bg-muted/50"
              }`}
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
});

interface SimpleFieldProps {
  title: string;
  value: number;
  unit: string;
  readOnly?: boolean;
  large?: boolean;
  onChange?: (value: number) => void;
  isModified?: boolean;
}

const SimpleField = memo(function SimpleField({
  title,
  value,
  unit,
  readOnly = false,
  large = false,
  onChange,
  isModified = false,
}: SimpleFieldProps) {
  const [localValue, setLocalValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);

  const displayValue = isEditing
    ? localValue
    : isFinite(value)
    ? value.toFixed(2)
    : "0.00";

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (!localValue || localValue === "") {
      return;
    }
    const numValue = Number.parseFloat(localValue);
    if (onChange && !isNaN(numValue) && isFinite(numValue)) {
      onChange(numValue);
    }
  };

  const handleFocus = () => {
    setIsEditing(true);
    setLocalValue(value.toString());
  };

  return (
    <div
      className={`space-y-2 flex flex-col   ${
        large ? "flex-row items-center justify-between" : "flex-col"
      }`}
    >
      <div className={`flex items-center justify-between`}>
        <Label
          className={`${
            large ? "text-lg text-foreground" : "text-sm text-muted-foreground"
          }  font-medium `}
        >
          {title}
          {isModified && (
            <span className="ml-2 text-xs text-orange-500 dark:text-orange-400">
              (modified)
            </span>
          )}
        </Label>
      </div>
      <div className="flex items-center gap-2 ">
        <Input
          type="number"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={readOnly}
          className={`h-10 ${
            isModified
              ? "border-orange-500 dark:border-orange-400"
              : "bg-muted/50"
          } ${large ? "w-fit" : "w-full"}`}
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
});

export default function SalaryInfoTab({ profile }: SalaryInfoTabProps) {
  const updateSalary = useUpdateSalary();

  const [changes, setChanges] = useState<ChangeTracker>({
    components: {},
  });
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = profile.canEditSalary || false;

  // Monthly wage is stored in basicSalary field
  const monthlyWage = useMemo(
    () => changes.monthlyWage ?? Number(profile.salary.basicSalary),
    [changes.monthlyWage, profile.salary.basicSalary]
  );

  const yearlyWage = useMemo(() => monthlyWage * 12, [monthlyWage]);

  // Basic salary is 50% of the monthly wage
  const basicSalary = useMemo(() => monthlyWage * 0.5, [monthlyWage]);

  // Check if there are any pending changes
  const hasChanges = useMemo(() => {
    return (
      changes.monthlyWage !== undefined ||
      changes.pfPercentage !== undefined ||
      changes.professionalTax !== undefined ||
      Object.keys(changes.components).length > 0
    );
  }, [changes]);

  // Calculate salary components with user modifications
  const components = useMemo(() => {
    // HRA - House Rent Allowance - Default 50% of Basic
    const hraPercentage = changes.components.hraPercentage ?? 50;
    const houseRentAllowance = (basicSalary * hraPercentage) / 100;

    // Standard Allowance - Default fixed 4,167
    const standardAllowance =
      changes.components.standardAllowanceAmount ?? 4167;
    const standardAllowancePercentage = (standardAllowance / monthlyWage) * 100;

    // Performance Bonus - Default 8.33% of Basic
    const performanceBonusPercentage =
      changes.components.performanceBonusPercentage ?? 8.33;
    const performanceBonus = (basicSalary * performanceBonusPercentage) / 100;

    // Leave Travel Allowance - Default 8.333% of Basic
    const leaveTravelPercentage =
      changes.components.leaveTravelPercentage ?? 8.333;
    const leaveTravelAllowance = (basicSalary * leaveTravelPercentage) / 100;

    // Fixed Allowance - Remaining amount to match monthly wage
    const totalComponents =
      basicSalary +
      houseRentAllowance +
      standardAllowance +
      performanceBonus +
      leaveTravelAllowance;

    const fixedAllowance = Math.max(0, monthlyWage - totalComponents);
    const fixedAllowancePercentage =
      changes.components.fixedAllowancePercentage ??
      (fixedAllowance / monthlyWage) * 100;

    return {
      basicAmount: basicSalary,
      basicPercentage: 50,
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
  }, [basicSalary, monthlyWage, changes.components]);

  // PF calculation
  const pfPercentage = useMemo(
    () => changes.pfPercentage ?? 12,
    [changes.pfPercentage]
  );
  const pfEmployeeContribution = useMemo(
    () => (basicSalary * pfPercentage) / 100,
    [basicSalary, pfPercentage]
  );
  const pfEmployerContribution = pfEmployeeContribution;

  // Professional Tax defaults to 200
  const professionalTax = useMemo(
    () =>
      changes.professionalTax ?? Number(profile.salary.professionalTax || 200),
    [changes.professionalTax, profile.salary.professionalTax]
  );

  // Change handlers
  const handleMonthlyWageChange = useCallback((amount: number) => {
    setChanges((prev) => ({ ...prev, monthlyWage: amount }));
  }, []);

  const handlePFPercentageChange = useCallback((percentage: number) => {
    setChanges((prev) => ({ ...prev, pfPercentage: percentage }));
  }, []);

  const handleProfessionalTaxChange = useCallback((amount: number) => {
    setChanges((prev) => ({ ...prev, professionalTax: amount }));
  }, []);

  const handleHRAPercentageChange = useCallback((percentage: number) => {
    setChanges((prev) => ({
      ...prev,
      components: { ...prev.components, hraPercentage: percentage },
    }));
  }, []);

  const handleStandardAllowanceChange = useCallback((amount: number) => {
    setChanges((prev) => ({
      ...prev,
      components: { ...prev.components, standardAllowanceAmount: amount },
    }));
  }, []);

  const handlePerformanceBonusPercentageChange = useCallback(
    (percentage: number) => {
      setChanges((prev) => ({
        ...prev,
        components: {
          ...prev.components,
          performanceBonusPercentage: percentage,
        },
      }));
    },
    []
  );

  const handleLeaveTravelPercentageChange = useCallback(
    (percentage: number) => {
      setChanges((prev) => ({
        ...prev,
        components: { ...prev.components, leaveTravelPercentage: percentage },
      }));
    },
    []
  );

  const handleFixedAllowancePercentageChange = useCallback(
    (percentage: number) => {
      setChanges((prev) => ({
        ...prev,
        components: {
          ...prev.components,
          fixedAllowancePercentage: percentage,
        },
      }));
    },
    []
  );

  // Save all changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateSalary.mutateAsync({
        employeeId: profile.id,
        data: {
          monthlyWage: changes.monthlyWage,
          pfPercentage: changes.pfPercentage,
          professionalTax: changes.professionalTax,
          hraPercentage: changes.components.hraPercentage,
          standardAllowanceAmount: changes.components.standardAllowanceAmount,
          performanceBonusPercentage:
            changes.components.performanceBonusPercentage,
          leaveTravelPercentage: changes.components.leaveTravelPercentage,
          fixedAllowancePercentage: changes.components.fixedAllowancePercentage,
        },
      });

      setChanges({ components: {} });
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setChanges({ components: {} });
  };

  return (
    <div className="space-y-10 relative">
      {/* Floating Save Changes Button */}
      {canEdit && hasChanges && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDiscardChanges}
            disabled={isSaving}
            className="shadow-lg"
          >
            Discard
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}

      {/* Top Section: Wage Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SimpleField
          title="Month Wage"
          value={monthlyWage}
          unit="₹ / month"
          large
          readOnly={!canEdit}
          onChange={canEdit ? handleMonthlyWageChange : undefined}
          isModified={changes.monthlyWage !== undefined}
        />
        <SimpleField
          title="No of working days in a week:"
          large
          value={5}
          unit="days"
          readOnly
        />
        <SimpleField
          title="Yearly wage"
          value={yearlyWage}
          large
          unit="₹ / Yearly"
          readOnly
        />
        <SimpleField title="Break Time:" value={1} unit="/hrs" readOnly large />
      </div>

      <Separator />

      {/* Bottom Section: Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Salary Components */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Salary Components</h3>
          </div>
          <div className="space-y-4">
            <SalaryField
              title="Basic Salary"
              amount={components.basicAmount}
              percentage={components.basicPercentage}
              description="Basic salary is 50% of the monthly wage"
              readOnlyAmount={true}
              readOnlyPercentage={true}
            />
            <SalaryField
              title="House Rent Allowance"
              amount={components.houseRentAllowance}
              percentage={components.hraPercentage}
              description="HRA is calculated as a percentage of the basic salary"
              readOnlyAmount={true}
              readOnlyPercentage={!canEdit}
              onPercentageChange={
                canEdit ? handleHRAPercentageChange : undefined
              }
              isModified={changes.components.hraPercentage !== undefined}
            />
            <SalaryField
              title="Standard Allowance"
              amount={components.standardAllowance}
              percentage={components.standardAllowancePercentage}
              description="Standard fixed allowance per month"
              readOnlyAmount={!canEdit}
              readOnlyPercentage={true}
              onAmountChange={
                canEdit ? handleStandardAllowanceChange : undefined
              }
              isModified={
                changes.components.standardAllowanceAmount !== undefined
              }
            />
            <SalaryField
              title="Performance Bonus"
              amount={components.performanceBonus}
              percentage={components.performanceBonusPercentage}
              description="Performance bonus as a percentage of basic salary"
              readOnlyAmount={true}
              readOnlyPercentage={!canEdit}
              onPercentageChange={
                canEdit ? handlePerformanceBonusPercentageChange : undefined
              }
              isModified={
                changes.components.performanceBonusPercentage !== undefined
              }
            />
            <SalaryField
              title="Leave Travel Allowance"
              amount={components.leaveTravelAllowance}
              percentage={components.leaveTravelPercentage}
              description="LTA as a percentage of basic salary"
              readOnlyAmount={true}
              readOnlyPercentage={!canEdit}
              onPercentageChange={
                canEdit ? handleLeaveTravelPercentageChange : undefined
              }
              isModified={
                changes.components.leaveTravelPercentage !== undefined
              }
            />
            <SalaryField
              title="Fixed Allowance"
              amount={components.fixedAllowance}
              percentage={components.fixedAllowancePercentage}
              description="Remaining allowance to match total monthly wage"
              readOnlyAmount={true}
              readOnlyPercentage={true}
            />
          </div>
        </div>

        {/* Right Column: PF and Tax */}
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
                description="Employee PF contribution as percentage of basic salary"
                readOnlyAmount={true}
                readOnlyPercentage={!canEdit}
                onPercentageChange={
                  canEdit ? handlePFPercentageChange : undefined
                }
                isModified={changes.pfPercentage !== undefined}
              />
              <SalaryField
                title="Employer"
                amount={pfEmployerContribution}
                percentage={pfPercentage}
                description="Employer PF contribution matches employee contribution"
                readOnlyAmount={true}
                readOnlyPercentage={true}
              />
            </div>
          </div>

          {/* Tax Deductions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Tax Deductions</h3>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Professional Tax
                {changes.professionalTax !== undefined && (
                  <span className="ml-2 text-xs text-orange-500 dark:text-orange-400">
                    (modified)
                  </span>
                )}
              </Label>
              <div className="flex items-center gap-2 max-w-md">
                <Input
                  type="number"
                  value={professionalTax.toFixed(2)}
                  readOnly={!canEdit}
                  onChange={(e) =>
                    canEdit &&
                    handleProfessionalTaxChange(Number(e.target.value))
                  }
                  className={`h-10 ${
                    changes.professionalTax !== undefined
                      ? "border-orange-500 dark:border-orange-400"
                      : "bg-muted/50"
                  }`}
                />
                <span className="text-sm text-muted-foreground text-nowrap">
                  ₹ / month
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional Tax deducted from the Gross salary
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
