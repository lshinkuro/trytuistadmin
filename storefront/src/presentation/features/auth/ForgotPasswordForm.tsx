"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AppError } from "@/domain/shared/errors";
import { Button, Card, Field, Input } from "../../components/ui";
import { useDependencies } from "../../providers/DependenciesProvider";

/** Dua langkah: minta kode ke email → kode + kata sandi baru. Berhasil = langsung masuk. */
export function ForgotPasswordForm() {
  const { auth } = useDependencies();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [form, setForm] = useState({ email: "", code: "", new_password: "" });
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);
  const fe = error?.fieldErrors ?? {};

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (step === "email") {
        await auth.post("/forgot", { email: form.email });
        setStep("reset");
      } else {
        await auth.post("/reset", form);
        window.location.assign("/");
        return;
      }
    } catch (err) {
      setError(err instanceof AppError ? err : new AppError("Terjadi kesalahan. Coba lagi."));
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4">
      <div className="text-center">
        <Link href="/" className="text-3xl font-extrabold text-brand">
          TryTuist
        </Link>
        <p className="mt-1 text-sm text-ink-muted">
          {step === "email" ? "Masukkan email akun kamu. Kami kirim kode untuk membuat kata sandi baru." : `Jika ${form.email} terdaftar, kode 6 digit sudah dikirim ke email tersebut.`}
        </p>
      </div>
      <Card className="p-5">
        <form onSubmit={submit} className="flex flex-col gap-4">
          {step === "email" ? (
            <Field label="Email" error={fe.email}>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
            </Field>
          ) : (
            <>
              <Field label="Kode" error={fe.code}>
                <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, "") })} required />
              </Field>
              <Field label="Kata sandi baru" error={fe.new_password} hint="Minimal 8 karakter">
                <Input type="password" autoComplete="new-password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} required />
              </Field>
            </>
          )}
          {error && Object.keys(fe).length === 0 && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}
          <Button type="submit" size="lg" isLoading={loading}>
            {step === "email" ? "Kirim kode" : "Simpan & masuk"}
          </Button>
          {step === "reset" && (
            <button type="button" className="text-sm text-ink-muted" onClick={() => setStep("email")}>
              Ganti email / kirim ulang kode
            </button>
          )}
        </form>
      </Card>
      <p className="text-center text-sm text-ink-muted">
        Ingat kata sandi?{" "}
        <Link href="/masuk" className="font-semibold text-brand">
          Masuk
        </Link>
      </p>
    </div>
  );
}
