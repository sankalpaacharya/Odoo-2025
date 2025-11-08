import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { type ReactNode } from "react";

interface EditableSectionProps {
  title: string;
  children: ReactNode;
  actionButton?: ReactNode;
}

export function EditableSection({ title, children, actionButton }: EditableSectionProps) {
  return (
    <Card className="gap-3 flex flex-col p-5">
      <div className="flex items-center justify-between w-full">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {actionButton && <div className="flex items-center gap-2">{actionButton}</div>}
      </div>
      {children}
    </Card>
  );
}
