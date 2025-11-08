"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLES } from "../constants";
import { RolePermissions } from "./role-permissions";

export function UserAccessRightsCard() {
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
        <div className="space-y-8">
          {ROLES.map((role) => (
            <RolePermissions key={role} role={role} />
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
