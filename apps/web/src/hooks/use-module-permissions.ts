import { useAbility } from "@/components/ability-provider";
import type { Actions, Subjects } from "@/lib/ability";

interface UseModulePermissionsReturn {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canApprove: boolean;
  canProcess: boolean;
  hasAnyPermission: boolean;
  hasFullAccess: boolean;
}

export function useModulePermissions(
  module: Subjects
): UseModulePermissionsReturn {
  const ability = useAbility();

  const canView = ability.can("View", module);
  const canCreate = ability.can("Create", module);
  const canEdit = ability.can("Edit", module);
  const canDelete = ability.can("Delete", module);
  const canExport = ability.can("Export", module);
  const canApprove = ability.can("Approve", module);
  const canProcess = ability.can("Process", module);

  const hasAnyPermission =
    canView ||
    canCreate ||
    canEdit ||
    canDelete ||
    canExport ||
    canApprove ||
    canProcess;
  const hasFullAccess = canView && canCreate && canEdit && canDelete;

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canApprove,
    canProcess,
    hasAnyPermission,
    hasFullAccess,
  };
}

export function useSpecificPermission(
  action: Actions,
  subject: Subjects
): boolean {
  const ability = useAbility();
  return ability.can(action, subject);
}
