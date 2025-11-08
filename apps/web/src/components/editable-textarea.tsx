"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface EditableTextareaProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function EditableTextarea({ label, value, onSave, placeholder, className = "", rows = 5 }: EditableTextareaProps) {
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

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <Textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none transition-colors"
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanged || isSaving} size="sm" variant={hasChanged ? "default" : "secondary"} className="px-4">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
