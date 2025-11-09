"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createContextualCan } from "@casl/react";
import { createAbility } from "@/lib/ability";
import type { AppAbility } from "@/lib/ability";

const AbilityContext = createContext<AppAbility>(createAbility());

export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({
  children,
  ability,
}: {
  children: ReactNode;
  ability: AppAbility;
}) {
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  return useContext(AbilityContext);
}
