import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { EditableSection } from "@/components/editable-section";
import type { ProfileData } from "@/types/profile";

export default function ResumeTab({ profile }: { profile: ProfileData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <EditableSection title="About">
          <Textarea placeholder="Tell us about yourself..." className="min-h-[120px] resize-none" />
        </EditableSection>

        <EditableSection title="What I love about my job">
          <Textarea placeholder="Share what you love about your work..." className="min-h-[120px] resize-none" />
        </EditableSection>

        <EditableSection title="My interests and hobbies">
          <Textarea placeholder="Tell us about your interests and hobbies..." className="min-h-[120px] resize-none" />
        </EditableSection>
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
