import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { type ReactNode } from "react";

interface EditableSectionProps {
  title: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  children: ReactNode;
  actionButton?: ReactNode;
}

export function EditableSection({
  title,
  isEditing,
  onToggleEdit,
  children,
  actionButton,
}: EditableSectionProps) {
  return (
    <Card className="gap-3 flex flex-col p-5">
      <div className="flex items-center justify-between w-full">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {actionButton}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onToggleEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {children}
    </Card>
  );
}
