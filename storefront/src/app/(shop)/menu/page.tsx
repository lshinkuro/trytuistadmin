import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuView } from "@/presentation/features/catalog/MenuView";

export const metadata: Metadata = { title: "Menu" };

export default function Page() {
  return (
    <Suspense>
      <MenuView />
    </Suspense>
  );
}
