"use client";

import type { ProfileData } from "@/types/profile";
import { EditableField } from "@/components/editable-field";
import { useUpdateProfile } from "@/hooks/useProfile";

interface PrivateInfoTabProps {
  profile: ProfileData;
  readOnly?: boolean;
}

export default function PrivateInfoTab({ profile, readOnly = false }: PrivateInfoTabProps) {
  const updateProfile = useUpdateProfile();

  const handleFieldSave = async (field: string, value: string) => {
    await updateProfile.mutateAsync({ [field]: value });
  };
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
        </div>

        <EditableField
          label="Date of Birth"
          value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : ""}
          type="date"
          onSave={(value) => handleFieldSave("dateOfBirth", value)}
          placeholder="Select date of birth"
          readOnly={readOnly}
        />

        <EditableField
          label="Residing Address"
          value={profile.address || ""}
          onSave={(value) => handleFieldSave("address", value)}
          placeholder="Enter your address"
          readOnly={readOnly}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="City"
            value={profile.city || ""}
            onSave={(value) => handleFieldSave("city", value)}
            placeholder="Enter your city"
            readOnly={readOnly}
          />

          <EditableField
            label="State"
            value={profile.state || ""}
            onSave={(value) => handleFieldSave("state", value)}
            placeholder="Enter your state"
            readOnly={readOnly}
          />
        </div>

        <EditableField
          label="Country"
          value={profile.country || ""}
          onSave={(value) => handleFieldSave("country", value)}
          placeholder="Enter your country"
          readOnly={readOnly}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField label="Personal Email" value={profile.email} type="email" onSave={async () => {}} readOnly />

          <EditableField
            label="Date of Joining"
            value={new Date(profile.dateOfJoining).toISOString().split("T")[0]}
            type="date"
            onSave={async () => {}}
            readOnly
          />
        </div>
      </div>

      {/* Column 2 - Bank Details */}
      <div className="space-y-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground">Bank Details</h3>
        </div>

        <EditableField
          label="Account Number"
          value={profile.accountNumber || ""}
          onSave={(value) => handleFieldSave("accountNumber", value)}
          placeholder="Enter account number"
          readOnly={readOnly}
        />

        <EditableField
          label="Bank Name"
          value={profile.bankName || ""}
          onSave={(value) => handleFieldSave("bankName", value)}
          placeholder="Enter bank name"
          readOnly={readOnly}
        />

        <EditableField
          label="IFSC Code"
          value={profile.ifscCode || ""}
          onSave={(value) => handleFieldSave("ifscCode", value)}
          placeholder="Enter IFSC code"
          readOnly={readOnly}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField
            label="PAN Number"
            value={profile.panNumber || ""}
            onSave={(value) => handleFieldSave("panNumber", value)}
            placeholder="Enter PAN number"
            readOnly={readOnly}
          />

          <EditableField
            label="UAN Number"
            value={profile.uanNumber || ""}
            onSave={(value) => handleFieldSave("uanNumber", value)}
            placeholder="Enter UAN number"
            readOnly={readOnly}
          />
        </div>

        <EditableField label="Employee Code" value={profile.employeeCode} onSave={async () => {}} readOnly />
      </div>
    </div>
  );
}
