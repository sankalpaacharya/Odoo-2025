"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayrollDashboard, PayrollPayrun } from "./components";
import { useSearchParams, useRouter } from "next/navigation";

export default function PayrollPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "dashboard");

  useEffect(() => {
    // Update tab when URL param changes
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without reloading the page
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/dashboard/payroll?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
        <p className="text-muted-foreground">Manage employee compensation</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="payrun">Payrun</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <PayrollDashboard />
        </TabsContent>

        <TabsContent value="payrun" className="space-y-6 mt-6">
          <PayrollPayrun />
        </TabsContent>
      </Tabs>
    </div>
  );
}
