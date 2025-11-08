"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Pencil } from "lucide-react";
import { useState } from "react";
import PrivateInfoTab from "./PrivateInfoTab";
import ResumeTab from "./ResumeTab";
import SalaryInfoTab from "./SalaryInfoTab";
import Loader from "@/components/loader";
import { EditableField } from "@/components/editable-field";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const handleFieldSave = async (field: string, value: string) => {
    await updateProfile.mutateAsync({ [field]: value });
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr]">
              {/* Column 1 - Profile Photo */}
              <div className="flex items-start justify-center lg:justify-start">
                <button
                  type="button"
                  title="Upload profile photo"
                  className="group relative h-36 w-36 overflow-hidden rounded-full bg-pink-100 transition-all hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
                >
                  {profile.profileImage || profile.image ? (
                    <img
                      src={profile.profileImage || profile.image || ""}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Pencil className="h-8 w-8 text-pink-600 transition-transform group-hover:scale-110" />
                    </div>
                  )}
                </button>
              </div>

              {/* Column 2 - Profile Fields */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Full Name"
                    value={`${profile.firstName} ${profile.lastName}`}
                    onSave={async (value) => {
                      const names = value.split(" ");
                      await handleFieldSave("firstName", names[0] || "");
                      if (names.length > 1) {
                        await handleFieldSave(
                          "lastName",
                          names.slice(1).join(" ")
                        );
                      }
                    }}
                    placeholder="Enter your full name"
                  />

                  <EditableField
                    label="Login ID"
                    value={profile.employeeCode}
                    onSave={async () => {}}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Email"
                    value={profile.email}
                    type="email"
                    onSave={async () => {}}
                    readOnly
                  />

                  <EditableField
                    label="Mobile"
                    value={profile.phone || ""}
                    type="tel"
                    onSave={(value) => handleFieldSave("phone", value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <EditableField
                  label="Company"
                  value={profile.organization?.companyName || "No Company"}
                  onSave={async () => {}}
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <Tabs defaultValue="resume" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="private">Private Info</TabsTrigger>
              <TabsTrigger value="salary">Salary Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="mt-8">
              <ResumeTab profile={profile} />
            </TabsContent>
            <TabsContent value="private" className="mt-8">
              <PrivateInfoTab profile={profile} />
            </TabsContent>

            <TabsContent value="salary" className="mt-8">
              {profile.currentUserRole === "EMPLOYEE" && (
                <div className="mb-4 p-4 bg-muted/50 border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Note:</span> Salary
                    information is read-only. Only administrators and payroll
                    officers can modify salary details.
                  </p>
                </div>
              )}
              <SalaryInfoTab profile={profile} />
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Security settings content goes here...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
