"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createContainer, type Container } from "@/infrastructure/container";

const DependenciesContext = createContext<Container | null>(null);

/**
 * Menyediakan use case ke seluruh UI. Untuk test / Storybook / mode demo, berikan
 * `container` lain (mis. `createContainer(mockRepositories)`); komponen tidak perlu diubah.
 */
export function DependenciesProvider({ children, container }: { children: ReactNode; container?: Container }) {
  const [value] = useState(() => container ?? createContainer());
  return <DependenciesContext.Provider value={value}>{children}</DependenciesContext.Provider>;
}

export function useDependencies(): Container {
  const value = useContext(DependenciesContext);
  if (!value) throw new Error("useDependencies harus dipakai di dalam <DependenciesProvider>.");
  return value;
}
