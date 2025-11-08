"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EditableSection } from "@/components/editable-section";
import { EditableTextarea } from "@/components/editable-textarea";
import type { ProfileData } from "@/types/profile";
import { useUpdateProfile } from "@/hooks/useProfile";

export default function ResumeTab({ profile }: { profile: ProfileData }) {
  const updateProfile = useUpdateProfile();

  const handleFieldSave = async (field: string, value: string) => {
    await updateProfile.mutateAsync({ [field]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <EditableTextarea
          label="About"
          value={profile.about || ""}
          onSave={(value) => handleFieldSave("about", value)}
          placeholder="Tell us about yourself..."
          rows={5}
        />

        <EditableTextarea
          label="What I love about my job"
          value={profile.jobLove || ""}
          onSave={(value) => handleFieldSave("jobLove", value)}
          placeholder="Share what you love about your work..."
          rows={5}
        />

        <EditableTextarea
          label="My interests and hobbies"
          value={profile.interests || ""}
          onSave={(value) => handleFieldSave("interests", value)}
          placeholder="Tell us about your interests and hobbies..."
          rows={5}
        />
      </div>

      {/* Column 2 - Skills and Certifications (2 rows) */}
      <div className="space-y-6">
        <EditableSection
          title="Skills"
          actionButton={
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Skills
            </Button>
          }>
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">No skills added yet</div>
        </EditableSection>

        <EditableSection
          title="Certification"
          actionButton={
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Certification
            </Button>
          }>
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">No certifications added yet</div>
        </EditableSection>
      </div>
    </div>
  );
}
