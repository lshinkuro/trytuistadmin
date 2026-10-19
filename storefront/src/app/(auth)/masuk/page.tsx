import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/presentation/features/auth/AuthForm";

export const metadata: Metadata = { title: "Masuk" };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
