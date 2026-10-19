"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createContainer, type Container } from "@/infrastructure/container";

const DependenciesContext = createContext<Container | null>(null);

export function DependenciesProvider({ children }: { children: ReactNode }) {
  const [value] = useState(() => createContainer());
  return <DependenciesContext.Provider value={value}>{children}</DependenciesContext.Provider>;
}

export function useDependencies(): Container {
  const value = useContext(DependenciesContext);
  if (!value) throw new Error("useDependencies harus dipakai di dalam <DependenciesProvider>.");
  return value;
}
