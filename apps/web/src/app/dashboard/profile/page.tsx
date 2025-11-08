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
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8 sm:space-y-12 pb-8">
        {/* Profile Header Section */}
        <div className="space-y-6 sm:space-y-8">
          {/* Profile Photo */}
          <div className="flex justify-center pt-4 sm:pt-0">
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
              className="group relative h-28 w-28 sm:h-36 sm:w-36 overflow-hidden rounded-full bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getProfileImageUrl(profile.profileImage, profile.image) ? (
                <>
                  <img
                    src={
                      getProfileImageUrl(profile.profileImage, profile.image)!
                    }
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-200">
                    <Pencil className="h-6 w-6 sm:h-7 sm:w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Pencil className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500 transition-transform group-hover:scale-110" />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/30 border-t-white"></div>
                </div>
              )}
            </button>
          </div>

          {/* Profile Info Card */}
          <Card className="overflow-hidden backdrop-blur-sm rounded-2xl">
            <CardContent className="p-0">
              {/* Name and ID Section */}
              <div className="px-4 sm:px-8 py-6 sm:py-8 text-center border-b border-border/50">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono tracking-wide">
                  {profile.employeeCode}
                </p>
              </div>

              {/* Contact Info Section */}
              <div className="grid grid-cols-1 divide-y divide-border/50">
                <div className="px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 group hover:bg-muted/30 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">
                    Email
                  </span>
                  <span className="text-sm font-mono text-foreground break-all">
                    {profile.email}
                  </span>
                </div>

                <div className="px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 group hover:bg-muted/30 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground">
                    Mobile
                  </span>
                  <EditableField
                    label=""
                    value={profile.phone || "+1 234 567 8900"}
                    type="tel"
                    onSave={(value) => handleFieldSave("phone", value)}
                    placeholder="+1 234 567 8900"
                    className="flex-1 w-full sm:max-w-xs"
                  />
                </div>

                {profile.organization?.companyName && (
                  <div className="px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 group hover:bg-muted/30 transition-colors">
                    <span className="text-sm font-medium text-muted-foreground">
                      Company
                    </span>
                    <span className="text-sm text-foreground">
                      {profile.organization.companyName}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div>
          <Tabs defaultValue="resume" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 h-auto">
              <TabsTrigger
                value="resume"
                className="py-2 sm:py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Resume
              </TabsTrigger>
              <TabsTrigger
                value="private"
                className="py-2 sm:py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Private
              </TabsTrigger>
              <TabsTrigger
                value="salary"
                className="py-2 sm:py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Salary
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="py-2 sm:py-2.5 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resume" className="mt-6 sm:mt-8">
              <ResumeTab profile={profile} />
            </TabsContent>
            <TabsContent value="private" className="mt-6 sm:mt-8">
              <PrivateInfoTab profile={profile} />
            </TabsContent>

            <TabsContent value="salary" className="mt-6 sm:mt-8">
              {profile.currentUserRole === "EMPLOYEE" && (
                <div className="mb-6 p-3 sm:p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Note:</span>{" "}
                    Salary information is read-only. Only administrators and
                    payroll officers can modify salary details.
                  </p>
                </div>
              )}
              <SalaryInfoTab profile={profile} />
            </TabsContent>

            <TabsContent value="security" className="mt-6 sm:mt-8">
              <SecurityTab profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
