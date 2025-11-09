import { AbilityBuilder, PureAbility } from "@casl/ability";
import type { AbilityClass } from "@casl/ability";

export type Actions =
  | "View"
  | "Create"
  | "Edit"
  | "Delete"
  | "Export"
  | "Approve"
  | "Process"
  | "Generate"
  | "Schedule"
  | "Export Data"
  | "Manage Users"
  | "System Configuration";

export type Subjects =
  | "Dashboard"
  | "Employees"
  | "Attendance"
  | "Time Off"
  | "Payroll"
  | "Reports"
  | "Settings"
  | "all";

export type AppAbility = PureAbility<[Actions, Subjects]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

export function defineAbilityFor(
  permissions: Record<string, string[]>
): AppAbility {
  const { can, build } = new AbilityBuilder(AppAbility);

  Object.entries(permissions).forEach(([module, actions]) => {
    actions.forEach((action) => {
      can(action as Actions, module as Subjects);
    });
  });

  return build();
}

export function createAbility() {
  return new AppAbility([]);
}
