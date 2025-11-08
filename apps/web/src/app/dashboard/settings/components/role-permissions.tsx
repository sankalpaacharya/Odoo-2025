"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MODULES, DEFAULT_PERMISSIONS, ROLE_DESCRIPTIONS } from "../constants";

interface RolePermissionsProps {
  role: string;
}

export function RolePermissions({ role }: RolePermissionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-lg font-semibold">{role}</h3>
          <p className="text-sm text-muted-foreground">
            {ROLE_DESCRIPTIONS[role]}
          </p>
        </div>
        <Button variant="outline" size="sm">
          Edit Role
        </Button>
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
                  DEFAULT_PERMISSIONS[role]?.[module.name]?.includes(
                    permission
                  ) ?? false;
                return (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${role}-${module.name}-${permission}`}
                      defaultChecked={isChecked}
                      disabled={role === "Admin"}
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
