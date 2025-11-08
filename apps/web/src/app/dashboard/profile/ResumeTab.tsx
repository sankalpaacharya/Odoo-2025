import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";
import { EditableSection } from "@/components/editable-section";

export default function ResumeTab({
  isEditing,
  setIsEditing,
}: {
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <EditableSection
          title="About"
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
        >
          <Textarea
            placeholder="Tell us about yourself..."
            readOnly={!isEditing}
            className="min-h-[120px] resize-none"
          />
        </EditableSection>

        <EditableSection
          title="What I love about my job"
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
        >
          <Textarea
            placeholder="Share what you love about your work..."
            readOnly={!isEditing}
            className="min-h-[120px] resize-none"
          />
        </EditableSection>

        <EditableSection
          title="My interests and hobbies"
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
        >
          <Textarea
            placeholder="Tell us about your interests and hobbies..."
            readOnly={!isEditing}
            className="min-h-[120px] resize-none"
          />
        </EditableSection>
      </div>

      {/* Column 2 - Skills and Certifications (2 rows) */}
      <div className="space-y-6">
        <EditableSection
          title="Skills"
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          actionButton={
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Skills
            </Button>
          }
        >
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            No skills added yet
          </div>
        </EditableSection>

        <EditableSection
          title="Certification"
          isEditing={isEditing}
          onToggleEdit={() => setIsEditing(!isEditing)}
          actionButton={
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Certification
            </Button>
          }
        >
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            No certifications added yet
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
