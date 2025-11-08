"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ROLES } from "../constants";
import { RolePermissions } from "./role-permissions";
import { useState } from "react";

export function UserAccessRightsCard() {
  const [openRoles, setOpenRoles] = useState<Record<string, boolean>>({});

  const toggleRole = (role: string) => {
    setOpenRoles((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Access Rights</CardTitle>
        <CardDescription>
          Configure module-based permissions for each user role. Access rights
          define what users are allowed to access and what they are restricted
          from accessing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ROLES.map((role) => (
            <Collapsible
              key={role}
              open={openRoles[role]}
              onOpenChange={() => toggleRole(role)}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 hover:bg-accent">
                <div className="text-left">
                  <h3 className="text-base font-semibold">{role}</h3>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    openRoles[role] ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <RolePermissions role={role} />
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
