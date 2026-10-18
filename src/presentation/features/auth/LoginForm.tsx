"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AppError } from "@/domain/shared/errors";
import { BrandMark } from "../../components/layout/BrandMark";
import { Button, Field, Input } from "../../components/ui";
import { useLogin } from "../../hooks/useAuth";

/** Hanya path internal (cegah open redirect lewat ?next=https://…). */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const error = login.error instanceof AppError ? login.error : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => router.replace(safeNext(params.get("next"))) });
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <BrandMark />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Masuk ke admin</h1>
        <p className="text-sm text-ink-muted">Pakai akun TryTuist yang sama dengan aplikasi. Hanya akun admin yang bisa masuk.</p>
      </div>
      {params.get("expired") && !error && (
        <p className="rounded-control bg-warning-soft px-3 py-2 text-sm text-warning">Sesi kamu sudah berakhir. Masuk lagi untuk melanjutkan.</p>
      )}
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Email" error={error?.fieldErrors.email}>
          <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        </Field>
        <Field label="Password" error={error?.fieldErrors.password}>
          <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && Object.keys(error.fieldErrors).length === 0 && (
          <p role="alert" className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
            {error.message}
          </p>
        )}
        <Button type="submit" size="lg" isLoading={login.isPending} className="mt-2">
          Masuk
        </Button>
      </form>
    </div>
  );
}
