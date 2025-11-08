"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MODULES, ROLE_DESCRIPTIONS } from "../constants";
import { toast } from "sonner";

interface RolePermissionsProps {
  role: string;
}

const ROLE_ENUM_MAP: Record<string, string> = {
  Admin: "ADMIN",
  "HR Officer": "HR_OFFICER",
  "Payroll Officer": "PAYROLL_OFFICER",
  Employee: "EMPLOYEE",
};

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export function RolePermissions({ role }: RolePermissionsProps) {
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const roleEnum = ROLE_ENUM_MAP[role] || role;

  useEffect(() => {
    fetchPermissions();
  }, [role]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/permissions/${roleEnum}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPermissions(data);
      } else {
        toast.error("Failed to fetch permissions");
      }
    } catch (error) {
      toast.error("Failed to fetch permissions");
    }
  };

  const handlePermissionChange = (
    module: string,
    permission: string,
    checked: boolean
  ) => {
    setPermissions((prev) => {
      const modulePerms = prev[module] || [];
      if (checked) {
        return {
          ...prev,
          [module]: [...modulePerms, permission],
        };
      } else {
        return {
          ...prev,
          [module]: modulePerms.filter((p) => p !== permission),
        };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/permissions/${roleEnum}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ permissions }),
      });

      if (response.ok) {
        toast.success("Permissions updated successfully");
        setIsEditing(false);
        fetchPermissions();
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error?.message ||
          errorData?.error?.details ||
          "Failed to update permissions";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(
        "Failed to update permissions. Please check your connection."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchPermissions();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-semibold">{role}</h3>
          <p className="text-sm text-muted-foreground">
            {ROLE_DESCRIPTIONS[role]}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={role === "Admin"}
            >
              Edit Role
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {MODULES.map((module) => (
          <div key={module.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <Label className="text-base font-medium">{module.name}</Label>
            </div>
            <div className="ml-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {module.permissions.map((permission) => {
                const isChecked =
                  permissions[module.name]?.includes(permission) ?? false;
                return (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${role}-${module.name}-${permission}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(
                          module.name,
                          permission,
                          checked as boolean
                        )
                      }
                      disabled={!isEditing || role === "Admin"}
                    />
                    <label
                      htmlFor={`${role}-${module.name}-${permission}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
