"use client";

import { useState } from "react";
import { StringAnyMap } from "@/components/types";
import { createContext, ReactElement, useContext } from "react";

const EntityContext = createContext<StringAnyMap | null>(null);

export function EntityProvider({
  children,
  data: combinationsData,
}: {
  children: ReactElement;
  data: StringAnyMap | null;
}) {
  const [combination, setCombination] = useState<string>(
    "append_create_edit_submit"
  );
  const data = combination.length
    ? combinationsData?.[combination]
    : combinationsData?.["none"] ?? null;
  return (
    <EntityContext.Provider value={{ data, combination, setCombination }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity(entityId: string | null) {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useEntity must be used within an EntityProvider");
  }

  if (!entityId) return null;
  return context.data.data?.[entityId] ?? null;
}

export function useCombination() {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useCombination must be used within an EntityProvider");
  }

  return {
    combination: context.combination,
    setCombination: context.setCombination,
  };
}
export function useCombinationData() {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useCombinationData must be used within an EntityProvider");
  }

  return context.data;
}
