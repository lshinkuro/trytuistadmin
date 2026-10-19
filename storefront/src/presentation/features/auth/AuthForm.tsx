"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AppError } from "@/domain/shared/errors";
import { Button, Card, Field, Input } from "../../components/ui";
import { useDependencies } from "../../providers/DependenciesProvider";

/** Masuk / daftar pembeli. Setelah berhasil, muat ulang penuh ke `next` supaya cache tamu dibuang. */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { auth } = useDependencies();
  const params = useSearchParams();
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await auth.post(mode === "login" ? "/login" : "/register", form);
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError("Terjadi kesalahan. Coba lagi."));
      setLoading(false);
    }
  };
  const fe = error?.fieldErrors ?? {};

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <Link href="/" className="text-3xl font-extrabold text-brand">
          TryTuist
        </Link>
        <p className="mt-1 text-sm text-ink-muted">{mode === "login" ? "Masuk untuk memesan" : "Buat akun untuk mulai memesan"}</p>
      </div>
      {params.get("expired") === "1" && <p className="rounded-panel bg-warning-soft p-3 text-sm text-warning">Sesi kamu berakhir. Silakan masuk lagi.</p>}
      <Card className="p-5">
        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === "register" && (
            <Field label="Nama" error={fe.name}>
              <Input value={form.name} maxLength={100} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            </Field>
          )}
          <Field label="Email" error={fe.email}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
          </Field>
          <Field label="Kata sandi" error={fe.password} hint={mode === "register" ? "Minimal 8 karakter" : undefined}>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </Field>
          {error && Object.keys(fe).length === 0 && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}
          <Button type="submit" size="lg" isLoading={loading}>
            {mode === "login" ? "Masuk" : "Daftar"}
          </Button>
        </form>
      </Card>
      <p className="text-center text-sm text-ink-muted">
        {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
        <Link href={`${mode === "login" ? "/daftar" : "/masuk"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand">
          {mode === "login" ? "Daftar" : "Masuk"}
        </Link>
      </p>
    </div>
  );
}
