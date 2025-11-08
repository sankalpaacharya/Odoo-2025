import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { UserAccessRightsCard } from "./components/user-access-rights-card";
import { SystemConfigurationCard } from "./components/system-configuration-card";

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
          Configure user access rights and system settings
        </p>
      </div>

      <UserAccessRightsCard />
      <SystemConfigurationCard />
    </div>
  );
}

