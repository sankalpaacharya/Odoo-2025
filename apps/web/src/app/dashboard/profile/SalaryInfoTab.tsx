"use client";

import { useMemo, useState, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";
import type { ProfileData } from "@/types/profile";
import {
  useUpdateSalary,
  useAddSalaryComponent,
  useUpdateSalaryComponent,
  useDeleteSalaryComponent,
} from "@/hooks/useProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface SalaryInfoTabProps {
  profile: ProfileData;
}

interface ChangeTracker {
  basicSalary?: number;
  pfContribution?: number;
  professionalTax?: number;
  components: Record<string, { amount: number; percentage?: number }>;
}

interface SalaryFieldProps {
  title: string;
  amount: number;
  percentage?: number;
  unit?: string;
  description?: string;
  readOnly?: boolean;
  componentId?: string;
  onDelete?: (id: string) => void;
  baseSalary?: number;
  onChange?: (amount: number, percentage?: number) => void;
  isModified?: boolean;
}

const SalaryField = memo(function SalaryField({
  title,
  amount,
  percentage,
  unit = "₹ / month",
  description,
  readOnly = false,
  componentId,
  onDelete,
  baseSalary,
  onChange,
  isModified = false,
}: SalaryFieldProps) {
  const [localAmount, setLocalAmount] = useState<string>("");
  const [localPercentage, setLocalPercentage] = useState<string>("");
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [isEditingPercentage, setIsEditingPercentage] = useState(false);

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

  const handleAmountChange = (value: string) => {
    setLocalAmount(value);
  };

  const handleAmountBlur = () => {
    setIsEditingAmount(false);
    if (!localAmount || localAmount === "") {
      return;
    }
    const numValue = Number.parseFloat(localAmount);
    if (isNaN(numValue) || !onChange) {
      return;
    }
    if (baseSalary && baseSalary > 0 && percentage !== undefined) {
      const calculatedPercentage = (numValue / baseSalary) * 100;
      if (isFinite(calculatedPercentage)) {
        onChange(numValue, calculatedPercentage);
      } else {
        onChange(numValue);
      }
    } else {
      onChange(numValue);
    }
  };

  const handleAmountFocus = () => {
    setIsEditingAmount(true);
    setLocalAmount(amount.toString());
  };

  const handlePercentageChange = (value: string) => {
    setLocalPercentage(value);
  };

  const handlePercentageBlur = () => {
    setIsEditingPercentage(false);
    if (!localPercentage || localPercentage === "") {
      return;
    }
    const numValue = Number.parseFloat(localPercentage);
    if (isNaN(numValue) || !onChange) {
      return;
    }
    if (baseSalary && baseSalary > 0) {
      const calculatedAmount = (baseSalary * numValue) / 100;
      if (isFinite(calculatedAmount)) {
        onChange(calculatedAmount, numValue);
      }
    }
  };

  const handlePercentageFocus = () => {
    setIsEditingPercentage(true);
    setLocalPercentage(percentage?.toString() || "0");
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
        <div className="flex items-center gap-2">
          {!readOnly && onDelete && componentId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(componentId)}
              className="h-7 w-7 p-0"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={displayAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onFocus={handleAmountFocus}
            onBlur={handleAmountBlur}
            readOnly={readOnly}
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
              readOnly={readOnly}
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
  const addComponent = useAddSalaryComponent();
  const updateComponent = useUpdateSalaryComponent();
  const deleteComponent = useDeleteSalaryComponent();

  const [changes, setChanges] = useState<ChangeTracker>({
    components: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newComponent, setNewComponent] = useState({
    name: "",
    type: "EARNING" as const,
    amount: "",
    isPercentage: false,
    description: "",
  });

  const canEdit = profile.canEditSalary || false;

  // Wage is the total monthly salary (full amount as entered by user)
  const monthlyWage = useMemo(
    () => changes.basicSalary ?? Number(profile.salary.basicSalary),
    [changes.basicSalary, profile.salary.basicSalary]
  );

  const yearlyWage = useMemo(() => monthlyWage * 12, [monthlyWage]);

  // Basic salary is 50% of the monthly wage
  const basicSalary = useMemo(() => monthlyWage * 0.5, [monthlyWage]);

  // Check if there are any pending changes
  const hasChanges = useMemo(() => {
    return (
      changes.basicSalary !== undefined ||
      changes.pfContribution !== undefined ||
      changes.professionalTax !== undefined ||
      Object.keys(changes.components).length > 0
    );
  }, [changes]);

  // Calculate component values
  const components = useMemo(() => {
    const comps = profile.salary.components;

    const findComponent = (name: string) =>
      comps.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));

    // Basic Salary - 50% of Monthly Wage
    const basicPercentage = 50;
    const basicAmount = basicSalary; // This is already calculated as monthlyWage * 0.5

    // HRA - House Rent Allowance - 50% of Basic
    const hra = findComponent("house rent") || findComponent("hra");
    const houseRentAllowance =
      changes.components[hra?.id || ""]?.amount ??
      (hra ? Number(hra.amount) : basicSalary * 0.5);
    const hraPercentage = changes.components[hra?.id || ""]?.percentage ?? 50;

    // Standard Allowance - Fixed 4,167
    const sa = findComponent("standard");
    const standardAllowance =
      changes.components[sa?.id || ""]?.amount ??
      (sa ? Number(sa.amount) : 4167);
    const standardAllowancePercentage =
      changes.components[sa?.id || ""]?.percentage ??
      (standardAllowance / monthlyWage) * 100;

    // Performance Bonus - 8.33% of Basic
    const pb = findComponent("performance") || findComponent("bonus");
    const performanceBonus =
      changes.components[pb?.id || ""]?.amount ??
      (pb ? Number(pb.amount) : basicSalary * 0.0833);
    const performanceBonusPercentage =
      changes.components[pb?.id || ""]?.percentage ?? 8.33;

    // Leave Travel Allowance - 8.333% of Basic
    const lta = findComponent("leave travel") || findComponent("lta");
    const leaveTravelAllowance =
      changes.components[lta?.id || ""]?.amount ??
      (lta ? Number(lta.amount) : basicSalary * 0.08333);
    const leaveTravelPercentage =
      changes.components[lta?.id || ""]?.percentage ?? 8.333;

    // Fixed Allowance - Wage minus all other components
    const fa = findComponent("fixed");
    const totalComponents =
      basicAmount +
      houseRentAllowance +
      standardAllowance +
      performanceBonus +
      leaveTravelAllowance;
    const fixedAllowance =
      changes.components[fa?.id || ""]?.amount ??
      (fa ? Number(fa.amount) : Math.max(0, monthlyWage - totalComponents));
    const fixedAllowancePercentage =
      changes.components[fa?.id || ""]?.percentage ??
      (fixedAllowance / monthlyWage) * 100;

    return {
      basicPercentage,
      basicAmount,
      hra,
      houseRentAllowance,
      hraPercentage,
      sa,
      standardAllowance,
      standardAllowancePercentage,
      pb,
      performanceBonus,
      performanceBonusPercentage,
      lta,
      leaveTravelAllowance,
      leaveTravelPercentage,
      fa,
      fixedAllowance,
      fixedAllowancePercentage,
    };
  }, [profile.salary.components, basicSalary, monthlyWage, changes.components]);

  // PF is 12% of Basic Salary
  const pfPercentage = 12;
  const pfEmployeeContribution = useMemo(
    () => changes.pfContribution ?? basicSalary * 0.12,
    [changes.pfContribution, basicSalary]
  );
  const pfEmployerContribution = useMemo(
    () => changes.pfContribution ?? basicSalary * 0.12,
    [changes.pfContribution, basicSalary]
  );

  // Professional Tax defaults to 200
  const professionalTax = useMemo(
    () =>
      changes.professionalTax ??
      (profile.salary.professionalTax
        ? Number(profile.salary.professionalTax)
        : 200),
    [changes.professionalTax, profile.salary.professionalTax]
  );

  // Change handlers
  const handleBasicSalaryChange = useCallback((amount: number) => {
    setChanges((prev) => ({ ...prev, basicSalary: amount }));
  }, []);

  const handlePFChange = useCallback((amount: number) => {
    setChanges((prev) => ({ ...prev, pfContribution: amount }));
  }, []);

  const handleProfessionalTaxChange = useCallback((amount: number) => {
    setChanges((prev) => ({ ...prev, professionalTax: amount }));
  }, []);

  const handleComponentChange = useCallback(
    (componentId: string, amount: number, percentage?: number) => {
      setChanges((prev) => ({
        ...prev,
        components: {
          ...prev.components,
          [componentId]: { amount, percentage },
        },
      }));
    },
    []
  );

  // Save all changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Update basic salary, PF, and professional tax if changed
      if (
        changes.basicSalary !== undefined ||
        changes.pfContribution !== undefined ||
        changes.professionalTax !== undefined
      ) {
        await updateSalary.mutateAsync({
          employeeId: profile.id,
          data: {
            basicSalary: changes.basicSalary,
            pfContribution: changes.pfContribution,
            professionalTax: changes.professionalTax,
          },
        });
      }

      // Update all modified components
      const componentUpdates = Object.entries(changes.components).map(
        ([componentId, data]) =>
          updateComponent.mutateAsync({
            componentId,
            data: {
              amount: data.amount,
              isPercentage: data.percentage !== undefined,
            },
          })
      );

      await Promise.all(componentUpdates);

      // Clear changes after successful save
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

  const handleAddComponent = async () => {
    try {
      await addComponent.mutateAsync({
        employeeId: profile.id,
        name: newComponent.name,
        type: newComponent.type,
        amount: newComponent.amount,
        isPercentage: newComponent.isPercentage,
        description: newComponent.description || undefined,
      });
      setIsAddDialogOpen(false);
      setNewComponent({
        name: "",
        type: "EARNING",
        amount: "",
        isPercentage: false,
        description: "",
      });
    } catch (error) {
      console.error("Failed to add component:", error);
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    if (
      window.confirm("Are you sure you want to delete this salary component?")
    ) {
      await deleteComponent.mutateAsync(componentId);
    }
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
          onChange={canEdit ? handleBasicSalaryChange : undefined}
          isModified={changes.basicSalary !== undefined}
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
            {canEdit && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Salary Component</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Component Name</Label>
                      <Input
                        value={newComponent.name}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Transport Allowance"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newComponent.type}
                        onValueChange={(value: any) =>
                          setNewComponent({ ...newComponent, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EARNING">Earning</SelectItem>
                          <SelectItem value="DEDUCTION">Deduction</SelectItem>
                          <SelectItem value="BENEFIT">Benefit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Computation Type</Label>
                      <Select
                        value={
                          newComponent.isPercentage ? "percentage" : "fixed"
                        }
                        onValueChange={(value) =>
                          setNewComponent({
                            ...newComponent,
                            isPercentage: value === "percentage",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">
                            Percentage of Wage
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {newComponent.isPercentage
                          ? "Percentage (%)"
                          : "Amount (₹)"}
                      </Label>
                      <Input
                        type="number"
                        value={newComponent.amount}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            amount: e.target.value,
                          })
                        }
                        placeholder={
                          newComponent.isPercentage ? "e.g., 10" : "e.g., 5000"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (Optional)</Label>
                      <Textarea
                        value={newComponent.description}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            description: e.target.value,
                          })
                        }
                        placeholder="Additional details"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddComponent}
                      disabled={!newComponent.name || !newComponent.amount}
                    >
                      Add
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="space-y-4">
            <SalaryField
              title="Basic Salary"
              amount={components.basicAmount}
              percentage={components.basicPercentage}
              description="Basic salary is 50% of the monthly wage"
              readOnly={true}
              baseSalary={monthlyWage}
            />
            <SalaryField
              title="House Rent Allowance"
              amount={components.houseRentAllowance}
              percentage={components.hraPercentage}
              description="HRA is 50% of the basic salary"
              readOnly={true}
              componentId={components.hra?.id}
              baseSalary={basicSalary}
            />
            <SalaryField
              title="Standard Allowance"
              amount={components.standardAllowance}
              percentage={components.standardAllowancePercentage}
              description="Fixed amount of ₹4,167 per month"
              readOnly={true}
              componentId={components.sa?.id}
              baseSalary={monthlyWage}
            />
            <SalaryField
              title="Performance Bonus"
              amount={components.performanceBonus}
              percentage={components.performanceBonusPercentage}
              description="Performance bonus is 8.33% of the basic salary"
              readOnly={true}
              componentId={components.pb?.id}
              baseSalary={basicSalary}
            />
            <SalaryField
              title="Leave Travel Allowance"
              amount={components.leaveTravelAllowance}
              percentage={components.leaveTravelPercentage}
              description="LTA is 8.333% of the basic salary"
              readOnly={true}
              componentId={components.lta?.id}
              baseSalary={basicSalary}
            />
            <SalaryField
              title="Fixed Allowance"
              amount={components.fixedAllowance}
              percentage={components.fixedAllowancePercentage}
              description="Fixed allowance = Monthly Wage - (Basic + HRA + Standard + Performance Bonus + LTA)"
              readOnly={true}
              componentId={components.fa?.id}
              baseSalary={monthlyWage}
            />

            {/* Custom components */}
            {profile.salary.components
              .filter(
                (comp) =>
                  ![
                    "house rent",
                    "hra",
                    "standard",
                    "performance",
                    "bonus",
                    "leave travel",
                    "lta",
                    "fixed",
                  ].some((keyword) => comp.name.toLowerCase().includes(keyword))
              )
              .map((comp) => (
                <SalaryField
                  key={comp.id}
                  title={comp.name}
                  amount={
                    changes.components[comp.id]?.amount ?? Number(comp.amount)
                  }
                  percentage={
                    changes.components[comp.id]?.percentage ??
                    (comp.isPercentage
                      ? Number(comp.amount)
                      : (Number(comp.amount) / basicSalary) * 100)
                  }
                  description={comp.description || undefined}
                  readOnly={!canEdit}
                  componentId={comp.id}
                  onDelete={canEdit ? handleDeleteComponent : undefined}
                  baseSalary={basicSalary}
                  onChange={
                    canEdit
                      ? (amt, pct) => handleComponentChange(comp.id, amt, pct)
                      : undefined
                  }
                  isModified={changes.components[comp.id] !== undefined}
                />
              ))}
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
                description="Employee PF contribution is 12% of basic salary"
                readOnly={true}
                baseSalary={basicSalary}
              />
              <SalaryField
                title="Employer"
                amount={pfEmployerContribution}
                percentage={pfPercentage}
                description="Employer PF contribution is 12% of basic salary"
                readOnly={true}
                baseSalary={basicSalary}
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
