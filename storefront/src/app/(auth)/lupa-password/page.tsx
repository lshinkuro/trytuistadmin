import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/presentation/features/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Lupa kata sandi" };

export default function Page() {
  return <ForgotPasswordForm />;
}
