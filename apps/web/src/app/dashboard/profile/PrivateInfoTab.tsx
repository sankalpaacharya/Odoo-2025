"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PrivateInfoTabProps {
  isEditing: boolean;
}

export default function PrivateInfoTab({ isEditing }: PrivateInfoTabProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            Personal Information
          </h3>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Date of Birth
          </Label>
          <Input
            type="date"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Residing Address
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Nationality
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Personal Email
          </Label>
          <Input
            type="email"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Gender
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Marital Status
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Date of Joining
          </Label>
          <Input
            type="date"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>
      </div>

      {/* Column 2 - Bank Details */}
      <div className="space-y-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            Bank Details
          </h3>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Account Number
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Bank Name
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            IFSC Code
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            PAN No
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            UAN NO
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Emp Code
          </Label>
          <Input
            type="text"
            placeholder=""
            readOnly={!isEditing}
            className="h-10 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
