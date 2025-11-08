import { UserListTable } from "./components/user-list-table";
import { UserAccessRightsCard } from "./components/user-access-rights-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage users and configure access rights
        </p>
      </div>

      <UserListTable />
      <UserAccessRightsCard />
    </div>
  );
}
