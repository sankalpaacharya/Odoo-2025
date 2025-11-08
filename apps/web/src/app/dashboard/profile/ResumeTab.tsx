import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge, Pencil, Plus } from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";

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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-semibold">About</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tell us about yourself..."
              readOnly={!isEditing}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                What I love about my job
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Share what you love about your work..."
              readOnly={!isEditing}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-semibold">
                My interests and hobbies
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tell us about your interests and hobbies..."
              readOnly={!isEditing}
              className="min-h-[120px] resize-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* Column 2 - Skills and Certifications (2 rows) */}
      <div className="space-y-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[250px] items-center justify-center">
              <Button
                variant="outline"
                className="gap-2 shadow-sm transition-all hover:shadow"
              >
                <Plus className="h-4 w-4" />
                Add Skills
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Certification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[250px] items-center justify-center">
              <Button
                variant="outline"
                className="gap-2 shadow-sm transition-all hover:shadow"
              >
                <Plus className="h-4 w-4" />
                Add Certification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
