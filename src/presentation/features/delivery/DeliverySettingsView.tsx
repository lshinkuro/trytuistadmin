"use client";

import { RotateCcw, Save } from "lucide-react";
import { useMemo, useState } from "react";
import {
  validateDeliverySettings,
  type DeliveryExample,
  type DeliverySettings,
} from "@/domain/delivery/DeliverySettings";
import { AppError } from "@/domain/shared/errors";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatRupiah } from "@/shared/lib/format";
import { ErrorState } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Skeleton,
  Switch,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "../../components/ui";
import { useDeliveryPreview, useDeliverySettings, useSaveDeliverySettings } from "../../hooks/useDelivery";

type NumberField = Exclude<keyof DeliverySettings, "freeDeliveryCouponEnabled">;
type Form = Record<NumberField, string> & { freeDeliveryCouponEnabled: boolean };

const toForm = (s: DeliverySettings): Form => ({
  deliveryFee: String(s.deliveryFee),
  deliveryBaseKm: String(s.deliveryBaseKm),
  deliveryFeePerKm: String(s.deliveryFeePerKm),
  deliveryFeeMax: String(s.deliveryFeeMax),
  freeDeliveryMinSubtotal: String(s.freeDeliveryMinSubtotal),
  prepMinutes: String(s.prepMinutes),
  courierSpeedKmh: String(s.courierSpeedKmh),
  freeDeliveryCouponEnabled: s.freeDeliveryCouponEnabled,
  freeDeliveryCouponWeekly: String(s.freeDeliveryCouponWeekly),
});

/** "10.000" / "2,5" → angka; kosong → NaN (ditolak validasi). */
const parse = (v: string, decimal = false) => {
  const cleaned = decimal ? v.replace(",", ".").trim() : v.replace(/[.\s]/g, "");
  return cleaned === "" ? Number.NaN : Number(cleaned);
};

const fromForm = (f: Form): DeliverySettings => ({
  deliveryFee: parse(f.deliveryFee),
  deliveryBaseKm: parse(f.deliveryBaseKm, true),
  deliveryFeePerKm: parse(f.deliveryFeePerKm),
  deliveryFeeMax: parse(f.deliveryFeeMax),
  freeDeliveryMinSubtotal: parse(f.freeDeliveryMinSubtotal),
  prepMinutes: parse(f.prepMinutes),
  courierSpeedKmh: parse(f.courierSpeedKmh, true),
  freeDeliveryCouponEnabled: f.freeDeliveryCouponEnabled,
  freeDeliveryCouponWeekly: parse(f.freeDeliveryCouponWeekly),
});

const km = (v: number) => `${v.toLocaleString("id-ID", { maximumFractionDigits: 1 })} km`;
const eta = (e: DeliveryExample) => `${e.etaMinMinutes}–${e.etaMaxMinutes} menit`;

export function DeliverySettingsView() {
  const current = useDeliverySettings();
  return (
    <>
      <PageHeader
        title="Ongkir"
        description="Aturan ongkos kirim per jarak alamat → outlet dan estimasi waktu antar. Perubahan langsung berlaku untuk keranjang & checkout berikutnya."
      />
      {current.isPending && <Skeleton className="h-96 w-full" />}
      {current.isError && <ErrorState error={current.error} onRetry={() => current.refetch()} />}
      {current.data && (
        <DeliveryForm
          // Remount setelah simpan supaya form mengikuti nilai server.
          key={current.data.updatedAt?.toISOString() ?? "awal"}
          saved={current.data.settings}
          savedExamples={current.data.examples}
          updatedAt={current.data.updatedAt}
        />
      )}
    </>
  );
}

function DeliveryForm({
  saved,
  savedExamples,
  updatedAt,
}: {
  saved: DeliverySettings;
  savedExamples: DeliveryExample[];
  updatedAt: Date | null;
}) {
  const [form, setForm] = useState<Form>(() => toForm(saved));
  const save = useSaveDeliverySettings();
  const draft = useMemo(() => fromForm(form), [form]);
  const localErrors = validateDeliverySettings(draft);
  const serverErrors = save.error instanceof AppError ? save.error.fieldErrors : {};
  const errorOf = (k: keyof DeliverySettings) => localErrors[k] ?? serverErrors[k];
  const isValid = Object.keys(localErrors).length === 0;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const preview = useDeliveryPreview(dirty && isValid ? { settings: draft, subtotal: 0, distances: [] } : null);
  const shownRules = dirty && isValid ? draft : saved;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    if (save.error) save.reset();
    setForm((f) => ({ ...f, [k]: v }));
  };
  const input = (k: NumberField, props: { suffix?: string; prefix?: string; decimal?: boolean } = {}) => (
    <AffixInput {...props} value={form[k]} onChange={(v) => set(k, v)} />
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tarif</CardTitle>
            <CardDescription>Jarak dihitung garis lurus dari outlet ke titik alamat pelanggan.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Tarif dasar" error={errorOf("deliveryFee")}>
              {input("deliveryFee", { prefix: "Rp" })}
            </Field>
            <Field label="Berlaku sampai jarak" error={errorOf("deliveryBaseKm")}>
              {input("deliveryBaseKm", { suffix: "km", decimal: true })}
            </Field>
            <Field label="Tambahan per km berikutnya" hint="0 = ongkir flat (tidak tergantung jarak)" error={errorOf("deliveryFeePerKm")}>
              {input("deliveryFeePerKm", { prefix: "Rp", suffix: "/ km" })}
            </Field>
            <Field label="Ongkir maksimal" hint="0 = tanpa batas" error={errorOf("deliveryFeeMax")}>
              {input("deliveryFeeMax", { prefix: "Rp" })}
            </Field>
            <Field label="Gratis ongkir mulai subtotal" hint="0 = tidak ada gratis ongkir" error={errorOf("freeDeliveryMinSubtotal")}>
              {input("freeDeliveryMinSubtotal", { prefix: "Rp" })}
            </Field>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estimasi waktu antar</CardTitle>
            <CardDescription>Ditampilkan di keranjang: waktu siapkan + jarak ÷ kecepatan, dibulatkan ke 5 menit, rentang 10 menit.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Waktu siapkan pesanan" error={errorOf("prepMinutes")}>
              {input("prepMinutes", { suffix: "menit" })}
            </Field>
            <Field label="Kecepatan rata-rata kurir" error={errorOf("courierSpeedKmh")}>
              {input("courierSpeedKmh", { suffix: "km/jam", decimal: true })}
            </Field>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kupon gratis ongkir mingguan</CardTitle>
            <CardDescription>
              Setiap pelanggan mendapat kupon ini tiap minggu (reset Senin 00:00 WIB). Kupon dipakai hanya bila pelanggan
              mengaktifkannya di keranjang, dan kembali bila pesanannya batal atau gagal.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Switch
              label={form.freeDeliveryCouponEnabled ? "Aktif" : "Nonaktif"}
              checked={form.freeDeliveryCouponEnabled}
              onChange={(e) => set("freeDeliveryCouponEnabled", e.target.checked)}
            />
            <Field label="Kupon per pelanggan per minggu" hint="1–14" error={errorOf("freeDeliveryCouponWeekly")}>
              {input("freeDeliveryCouponWeekly", { suffix: "kupon" })}
            </Field>
          </CardContent>
        </Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button isLoading={save.isPending} disabled={!dirty || !isValid} onClick={() => save.mutate(draft)}>
            <Save aria-hidden /> Simpan aturan
          </Button>
          {dirty && (
            <Button variant="ghost" onClick={() => setForm(toForm(saved))}>
              <RotateCcw aria-hidden /> Batalkan perubahan
            </Button>
          )}
          {save.error instanceof AppError && Object.keys(serverErrors).length === 0 && (
            <p role="alert" className="text-sm text-danger">
              {save.error.message}
            </p>
          )}
        </div>
        {updatedAt && <p className="text-xs text-ink-muted">Terakhir diubah {formatDateTime(updatedAt)}. Riwayat perubahan ada di menu Aktivitas.</p>}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cara hitung</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <RuleSentence rules={shownRules} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Contoh perhitungan</CardTitle>
            {dirty && <Badge tone="warning">Pratinjau, belum disimpan</Badge>}
          </CardHeader>
          <Table>
            <THead>
              <TR>
                <TH>Jarak</TH>
                <TH className="text-right">{dirty ? "Ongkir sekarang" : "Ongkir"}</TH>
                {dirty && <TH className="text-right">Ongkir baru</TH>}
                <TH>Estimasi tiba</TH>
              </TR>
            </THead>
            <TBody>
              {savedExamples.map((ex, i) => {
                const next = preview.data?.examples[i];
                const changed = dirty && next && next.fee !== ex.fee;
                return (
                  <TR key={ex.distanceKm}>
                    <TD className="tabular">{km(ex.distanceKm)}</TD>
                    <TD className={cn("tabular text-right", changed ? "text-ink-muted line-through" : "font-semibold")}>
                      {formatRupiah(ex.fee)}
                    </TD>
                    {dirty && (
                      <TD className="tabular text-right font-semibold">
                        {!isValid ? "–" : next ? (
                          <span className={cn(changed && (next.fee > ex.fee ? "text-danger" : "text-success"))}>{formatRupiah(next.fee)}</span>
                        ) : (
                          <Skeleton className="ml-auto h-4 w-20" />
                        )}
                      </TD>
                    )}
                    <TD className="tabular text-ink-muted">{dirty && next ? eta(next) : eta(ex)}</TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
          <p className="px-5 pb-4 pt-2 text-xs text-ink-muted">Contoh tanpa gratis ongkir. Angka dihitung server dengan rumus yang sama seperti saat checkout.</p>
        </Card>

        <Simulator rules={dirty && isValid ? draft : saved} />
      </div>
    </div>
  );
}

/** Input angka dengan awalan/akhiran (Rp, km). `id`, `invalid`, `aria-describedby` dari <Field> diteruskan ke input. */
function AffixInput({
  prefix,
  suffix,
  decimal,
  value,
  onChange,
  ...fieldProps
}: {
  prefix?: string;
  suffix?: string;
  decimal?: boolean;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <div className="relative">
      {prefix && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-faint">{prefix}</span>}
      <Input
        {...fieldProps}
        inputMode={decimal ? "decimal" : "numeric"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("tabular", prefix && "pl-10", suffix && "pr-20")}
      />
      {suffix && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-faint">{suffix}</span>}
    </div>
  );
}

function RuleSentence({ rules }: { rules: DeliverySettings }) {
  if (rules.deliveryFeePerKm === 0) {
    return (
      <p>
        Ongkir <b>flat {formatRupiah(rules.deliveryFee)}</b> untuk semua jarak di dalam radius antar outlet.
        {rules.freeDeliveryMinSubtotal > 0 && <> Gratis bila subtotal ≥ <b>{formatRupiah(rules.freeDeliveryMinSubtotal)}</b>.</>}
      </p>
    );
  }
  return (
    <p>
      <b>{formatRupiah(rules.deliveryFee)}</b> untuk {km(rules.deliveryBaseKm)} pertama, lalu{" "}
      <b>+{formatRupiah(rules.deliveryFeePerKm)}</b> setiap km berikutnya (sisa jarak dibulatkan ke atas, mis. 3,2 km lewat batas = 4 km)
      {rules.deliveryFeeMax > 0 ? (
        <>
          , paling mahal <b>{formatRupiah(rules.deliveryFeeMax)}</b>.
        </>
      ) : (
        <>, tanpa batas atas.</>
      )}
      {rules.freeDeliveryMinSubtotal > 0 && (
        <>
          {" "}
          Gratis ongkir bila subtotal ≥ <b>{formatRupiah(rules.freeDeliveryMinSubtotal)}</b>.
        </>
      )}{" "}
      Alamat tanpa titik lokasi dikenai tarif dasar.
    </p>
  );
}

function Simulator({ rules }: { rules: DeliverySettings }) {
  const [distance, setDistance] = useState("4,2");
  const [subtotal, setSubtotal] = useState("45000");
  const d = parse(distance, true);
  const sub = parse(subtotal);
  const valid = Number.isFinite(d) && d >= 0 && d <= 100 && Number.isFinite(sub) && sub >= 0;
  const result = useDeliveryPreview(valid ? { settings: rules, subtotal: sub, distances: [d] } : null);
  const ex = result.data?.examples[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulasi</CardTitle>
        <CardDescription>Coba jarak & subtotal tertentu, misalnya dari keluhan pelanggan.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jarak">
            <Input inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} className="tabular" />
          </Field>
          <Field label="Subtotal keranjang (Rp)">
            <Input inputMode="numeric" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} className="tabular" />
          </Field>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-control bg-surface-muted p-4" aria-live="polite">
          {!valid ? (
            <span className="text-sm text-ink-muted">Isi jarak 0–100 km dan subtotal yang valid.</span>
          ) : ex ? (
            <>
              <span className="text-sm text-ink-muted">
                Ongkir {km(ex.distanceKm)} · total {formatRupiah(sub + ex.fee)}
              </span>
              <span className="tabular text-xl font-extrabold">{ex.fee === 0 ? "Gratis" : formatRupiah(ex.fee)}</span>
              <span className="w-full text-sm text-ink-muted">Estimasi tiba {eta(ex)}</span>
            </>
          ) : (
            <Skeleton className="h-6 w-40" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
