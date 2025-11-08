"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditableSalaryFieldProps {
  title: string;
  amount: number;
  percentage?: number;
  unit?: string;
  description?: string;
  onSave: (amount: number, percentage?: number) => Promise<void>;
  readOnly?: boolean;
  isPercentage?: boolean;
  showPercentage?: boolean;
  baseSalary?: number;
}

export function EditableSalaryField({
  title,
  amount,
  percentage,
  unit = "₹ / month",
  description,
  onSave,
  readOnly = false,
  isPercentage: initialIsPercentage = false,
  showPercentage = true,
  baseSalary,
}: EditableSalaryFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(amount.toString());
  const [editPercentage, setEditPercentage] = useState(
    percentage?.toString() || ""
  );
  const [isPercentageMode, setIsPercentageMode] = useState(initialIsPercentage);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isPercentageMode && baseSalary) {
        const percentValue = Number.parseFloat(editPercentage);
        const calculatedAmount = (baseSalary * percentValue) / 100;
        await onSave(calculatedAmount, percentValue);
      } else {
        const amountValue = Number.parseFloat(editAmount);
        const percentValue = baseSalary
          ? (amountValue / baseSalary) * 100
          : undefined;
        await onSave(amountValue, percentValue);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditAmount(amount.toString());
    setEditPercentage(percentage?.toString() || "");
    setIsPercentageMode(initialIsPercentage);
    setIsEditing(false);
  };

  const handlePercentageChange = (value: string) => {
    setEditPercentage(value);
    if (baseSalary) {
      const calculatedAmount = (baseSalary * Number.parseFloat(value)) / 100;
      setEditAmount(calculatedAmount.toFixed(2));
    }
  };

  const handleAmountChange = (value: string) => {
    setEditAmount(value);
    if (baseSalary) {
      const calculatedPercentage =
        (Number.parseFloat(value) / baseSalary) * 100;
      setEditPercentage(calculatedPercentage.toFixed(2));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{title}</Label>
        {!readOnly && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Amount Field */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={isEditing ? editAmount : amount.toFixed(2)}
            onChange={(e) => handleAmountChange(e.target.value)}
            readOnly={!isEditing || (isEditing && isPercentageMode)}
            className={`h-10 ${readOnly || !isEditing ? "bg-muted/50" : ""}`}
            disabled={isSaving}
          />
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>

        {/* Percentage Field */}
        {showPercentage && percentage !== undefined && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={isEditing ? editPercentage : percentage.toFixed(2)}
              onChange={(e) => handlePercentageChange(e.target.value)}
              readOnly={!isEditing || (isEditing && !isPercentageMode)}
              className={`h-10 ${readOnly || !isEditing ? "bg-muted/50" : ""}`}
              disabled={isSaving}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        )}

        {/* Computation Type Selector */}
        {isEditing && baseSalary && (
          <div className="flex items-center gap-2">
            <Select
              value={isPercentageMode ? "percentage" : "fixed"}
              onValueChange={(value) =>
                setIsPercentageMode(value === "percentage")
              }
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
