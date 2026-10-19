"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppError } from "@/domain/shared/errors";
import { Button, Card, Dialog, Field, Input } from "../../components/ui";
import { useDependencies } from "../../providers/DependenciesProvider";

const asAppError = (err: unknown) => (err instanceof AppError ? err : new AppError("Terjadi kesalahan. Coba lagi."));

/** Email belum terverifikasi → belum bisa memesan. Kode 6 digit dikirim ke email. */
export function VerifyEmailCard({ email }: { email: string }) {
  const { account } = useDependencies();
  const client = useQueryClient();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<AppError | null>(null);

  const run = async (kind: "send" | "verify") => {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "send") {
        await account.sendVerification();
        setInfo(`Kode baru dikirim ke ${email}.`);
      } else {
        await account.verifyEmail(code);
        await client.invalidateQueries({ queryKey: ["me"] });
      }
    } catch (err) {
      setError(asAppError(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="flex flex-col gap-3 border-warning p-4 text-sm">
      <div>
        <p className="font-bold">Verifikasi email kamu</p>
        <p className="text-ink-muted">Masukkan kode 6 digit yang kami kirim ke {email}. Verifikasi diperlukan sebelum memesan.</p>
      </div>
      <Field label="Kode verifikasi" error={error?.fieldErrors.code}>
        <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
      </Field>
      {info && <p className="text-success">{info}</p>}
      {error && !error.fieldErrors.code && <p role="alert" className="text-danger">{error.message}</p>}
      <div className="flex gap-2">
        <Button className="flex-1" disabled={code.length !== 6} isLoading={busy === "verify"} onClick={() => run("verify")}>
          Verifikasi
        </Button>
        <Button variant="outline" isLoading={busy === "send"} onClick={() => run("send")}>
          Kirim ulang
        </Button>
      </div>
    </Card>
  );
}

/** Semua sesi lain dicabut backend; BFF mengganti cookie sesi ini dengan yang baru. */
export function ChangePasswordDialog({ hasPassword, onClose }: { hasPassword: boolean; onClose: () => void }) {
  const { auth } = useDependencies();
  const [form, setForm] = useState({ current_password: "", new_password: "" });
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const fe = error?.fieldErrors ?? {};

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await auth.post("/password", form);
      setDone(true);
    } catch (err) {
      setError(asAppError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={hasPassword ? "Ganti kata sandi" : "Buat kata sandi"}
      footer={
        done ? (
          <Button onClick={onClose}>Selesai</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button isLoading={loading} disabled={form.new_password.length < 8} onClick={submit}>
              Simpan
            </Button>
          </>
        )
      }
    >
      {done ? (
        <p className="text-sm">Kata sandi diperbarui. Perangkat lain sudah dikeluarkan dari akun kamu.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {hasPassword && (
            <Field label="Kata sandi saat ini" error={fe.current_password}>
              <Input type="password" autoComplete="current-password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} />
            </Field>
          )}
          <Field label="Kata sandi baru" error={fe.new_password} hint="Minimal 8 karakter">
            <Input type="password" autoComplete="new-password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
          </Field>
          {error && Object.keys(fe).length === 0 && <p role="alert" className="text-sm text-danger">{error.message}</p>}
        </div>
      )}
    </Dialog>
  );
}
