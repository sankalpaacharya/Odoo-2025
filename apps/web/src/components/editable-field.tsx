"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

export function EditableField({
  label,
  value,
  onSave,
  type = "text",
  placeholder,
  readOnly = false,
  className = "",
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanged = localValue !== value;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSave = async () => {
    if (!hasChanged) return;

    setIsSaving(true);
    try {
      await onSave(localValue);
    } catch (error) {
      console.error("Error saving field:", error);
      setLocalValue(value); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasChanged) {
      handleSave();
    }
    if (e.key === "Escape") {
      setLocalValue(value);
    }
  };

  // If no label, render inline (for use in profile page)
  if (!label) {
    return (
      <div className={`flex gap-2 items-center ${className}`}>
        <Input
          type={type}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`h-9 text-sm font-mono border-0 bg-transparent text-right focus-visible:ring-1 transition-all ${
            readOnly ? "cursor-not-allowed" : ""
          }`}
        />
        {!readOnly && (
          <Button
            onClick={handleSave}
            disabled={!hasChanged || isSaving}
            size="sm"
            variant={hasChanged ? "default" : "ghost"}
            className="h-7 w-7 p-0 shrink-0"
          >
            <Save className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          type={type}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`h-10 flex-1 transition-colors ${
            readOnly ? "bg-muted/50 cursor-not-allowed" : ""
          }`}
        />
        {!readOnly && (
          <Button
            onClick={handleSave}
            disabled={!hasChanged || isSaving}
            size="sm"
            variant={hasChanged ? "default" : "secondary"}
            className="px-3"
          >
            <Save className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
