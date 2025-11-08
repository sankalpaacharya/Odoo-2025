"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { Pencil } from "lucide-react";
import { useState, useRef } from "react";
import PrivateInfoTab from "./PrivateInfoTab";
import ResumeTab from "./ResumeTab";
import SalaryInfoTab from "./SalaryInfoTab";
import SecurityTab from "./SecurityTab";
import Loader from "@/components/loader";
import { getProfileImageUrl } from "@/lib/image-utils";
import { EditableField } from "@/components/editable-field";
import { toast } from "sonner";
import { apiClientFormData } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFieldSave = async (field: string, value: string) => {
    await updateProfile.mutateAsync({ [field]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await apiClientFormData<{
        success: boolean;
        profileImage: string;
      }>("/api/profile/upload-image", formData);

      if (response.success) {
        toast.success("Profile image uploaded successfully");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["employee", "me"] });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload profile photo"
                />
                <button
                  type="button"
                  title="Upload profile photo"
                  onClick={handleImageClick}
                  disabled={isUploading}
                  className="group relative h-30 w-30 overflow-hidden rounded-full bg-pink-100 transition-all hover:bg-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {getProfileImageUrl(profile.profileImage, profile.image) ? (
                    <>
                      <img
                        src={getProfileImageUrl(profile.profileImage, profile.image)!}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="h-full w-full object-cover z-100 relative"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                        <Pencil className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Pencil className="h-8 w-8 text-pink-600 transition-transform group-hover:scale-110" />
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
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
                        await handleFieldSave("lastName", names.slice(1).join(" "));
                      }
                    }}
                    placeholder="Enter your full name"
                  />

                  <EditableField label="Login ID" value={profile.employeeCode} onSave={async () => {}} readOnly />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField label="Email" value={profile.email} type="email" onSave={async () => {}} readOnly />

                  <EditableField
                    label="Mobile"
                    value={profile.phone || ""}
                    type="tel"
                    onSave={(value) => handleFieldSave("phone", value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <EditableField label="Company" value={profile.organization?.companyName || "No Company"} onSave={async () => {}} readOnly />
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
                    <span className="font-medium">Note:</span> Salary information is read-only. Only administrators and payroll officers can modify
                    salary details.
                  </p>
                </div>
              )}
              <SalaryInfoTab profile={profile} />
            </TabsContent>

            <TabsContent value="security" className="mt-8">
              <SecurityTab profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
