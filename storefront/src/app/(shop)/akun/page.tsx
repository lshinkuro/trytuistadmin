import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/presentation/features/account/AccountView";

export const metadata: Metadata = { title: "Akun" };

export default function Page() {
  return (
    <Suspense>
      <AccountView />
    </Suspense>
  );
}
