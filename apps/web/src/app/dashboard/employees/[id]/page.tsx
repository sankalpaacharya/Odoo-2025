"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft } from "lucide-react";
import PrivateInfoTab from "../../profile/PrivateInfoTab";
import ResumeTab from "../../profile/ResumeTab";
import SalaryInfoTab from "../../profile/SalaryInfoTab";
import Loader from "@/components/loader";
import { getProfileImageUrl } from "@/lib/image-utils";
import { EditableField } from "@/components/editable-field";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { use } from "react";

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: profile, isLoading } = useProfile(id);

  console.log("Employee ID from params:", id);
  console.log("Profile data:", profile);

  if (isLoading) {
    return <Loader />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Employee not found</p>
          <Button onClick={() => router.push("/dashboard/employees")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/employees")} title="Back to Employees">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight">Employee Profile</h1>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
              {/* Column 1 - Profile Photo (Read-only) */}
              <div className="flex items-start justify-center lg:justify-start">
                <div className="h-30 w-30 overflow-hidden rounded-full bg-pink-100">
                  {getProfileImageUrl(profile.profileImage, profile.image) ? (
                    <img
                      src={getProfileImageUrl(profile.profileImage, profile.image)!}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-pink-600">
                      {profile.firstName[0]}
                      {profile.lastName[0]}
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2 - Profile Fields (Read-only) */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Full Name"
                    value={`${profile.firstName} ${profile.lastName}`}
                    onSave={async () => {}}
                    placeholder="Enter full name"
                    readOnly
                  />

                  <EditableField label="Login ID" value={profile.employeeCode} onSave={async () => {}} readOnly />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField label="Email" value={profile.email} type="email" onSave={async () => {}} readOnly />

                  <EditableField
                    label="Mobile"
                    value={profile.phone || ""}
                    type="tel"
                    onSave={async () => {}}
                    placeholder="+1 234 567 8900"
                    readOnly
                  />
                </div>

                <EditableField label="Company" value={profile.organization?.companyName || "No Company"} onSave={async () => {}} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <Tabs defaultValue="resume" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="private">Private Info</TabsTrigger>
              <TabsTrigger value="salary">Salary Info</TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="mt-8">
              <ResumeTab profile={profile} readOnly />
            </TabsContent>
            <TabsContent value="private" className="mt-8">
              <PrivateInfoTab profile={profile} readOnly />
            </TabsContent>

            <TabsContent value="salary" className="mt-8">
              <div className="mb-4 p-4 bg-muted/50 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Note:</span> You are viewing this employee's profile in read-only mode.
                </p>
              </div>
              <SalaryInfoTab profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
