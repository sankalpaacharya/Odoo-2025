import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/app-sidebar";

export default function Sidebar03() {
  return (
    <SidebarProvider>
      <div className="relative flex h-screen w-full">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col" />
      </div>
    </SidebarProvider>
  );
}

export { StatsCards } from "./stats-cards";
export type { StatItem } from "./stats-cards";
export { MonthlyAttendanceTrendChart } from "./monthly-attendance-trend-chart";
export { Can, useAbility } from "./ability-provider";
