"use client";
import { StringAnyMap } from "@/components/types";
import { createContext, ReactElement, useContext, useState } from "react";

const EntityContext = createContext<StringAnyMap | null>(null);

export function EntityProvider({
  children,
  data,
}: {
  children: ReactElement;
  data: StringAnyMap | null;
}) {
  const [entities] = useState(data);
  return (
    <EntityContext.Provider value={entities}>{children}</EntityContext.Provider>
  );
}

export function useEntity(entityId: string | null) {
  const entities = useContext(EntityContext);
  if (!entityId) return null;
  return entities?.[entityId] ?? null;
}
