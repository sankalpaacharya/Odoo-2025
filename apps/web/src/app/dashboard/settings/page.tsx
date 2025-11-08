import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { UserListTable } from "./components/user-list-table";
import { UserAccessRightsCard } from "./components/user-access-rights-card";

export default async function SettingsPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

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

