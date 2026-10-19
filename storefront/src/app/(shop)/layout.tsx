import type { ReactNode } from "react";
import { ShopShell } from "@/presentation/components/layout/ShopShell";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
