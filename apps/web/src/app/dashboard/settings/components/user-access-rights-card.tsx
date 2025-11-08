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
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export function UserAccessRightsCard() {
  const [openRoles, setOpenRoles] = useState<Record<string, boolean>>({});
  const [isResetting, setIsResetting] = useState(false);

  const toggleRole = (role: string) => {
    setOpenRoles((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const handleResetToDefault = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(`${API_URL}/api/permissions/initialize`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Permissions reset to default successfully");
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.error?.message || "Failed to reset permissions");
      }
    } catch (error) {
      toast.error("Failed to reset permissions. Please check your connection.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <CardTitle>User Access Rights</CardTitle>
        <CardDescription>
          Configure module-based permissions for each user role. Access rights
          define what users are allowed to access and what they are restricted
          from accessing.
        </CardDescription>
      </div>
      <>
        <div className="space-y-2">
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
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            disabled={isResetting}
          >
            {isResetting ? "Resetting..." : "Reset to Default"}
          </Button>
        </div>
      </>
    </div>
  );
}
