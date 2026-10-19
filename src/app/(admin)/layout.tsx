import type { ReactNode } from "react";
import { AppShell } from "@/presentation/components/layout/AppShell";

// Sesi dicek di proxy.ts (cookie) dan backend (token + role SUPER_ADMIN / OUTLET_ADMIN) pada setiap request data.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
