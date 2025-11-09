"use client";

import { UserListTable } from "./components/user-list-table";
import { UserAccessRightsCard } from "./components/user-access-rights-card";
import { Can } from "@/components/ability-provider";

export default function SettingsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage users and configure access rights
        </p>
      </div>

      <Can I="View" a="Settings">
        <UserListTable />
        <UserAccessRightsCard />
      </Can>
    </div>
  );
}
