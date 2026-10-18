# TryTuist Admin: Web Plan

Web khusus admin untuk aplikasi TryTuist (iOS + backend Go `trytuist-api`). Dari sini admin bisa:

- **menambah menu baru** (kategori, harga, foto, varian) serta mengubah **harga**, **varian**, dan **stok** menu,
- mengubah **status pesanan**, termasuk menandai **sukses** atau **gagal** (dengan alasan),
- membuat dan mengatur **promo** potongan harga, termasuk popup di Beranda app,
- melihat **pelanggan** dan **jejak aktivitas** admin,
- membaca **dashboard penjualan & pembelian**.

Login memakai akun dan endpoint yang sama dengan aplikasi (`POST /v1/auth/login`). Hanya akun dengan role `ADMIN` yang bisa masuk.

| | |
|---|---|
| Folder | `trytuistadmin/` (berdampingan dengan `trytuist/` dan `trytuist-api/`) |
| Port | **3000** (default Next.js) · backend tetap di **8080** |
| Kontrak API | `trytuist-api/API_PLAN.md` §5.25 |

## Daftar isi

1. [Stack](#1-stack)
2. [Fitur & halaman](#2-fitur--halaman)
3. [Clean architecture (versi frontend)](#3-clean-architecture-versi-frontend)
4. [Auth & keamanan](#4-auth--keamanan)
5. [Base component](#5-base-component)
6. [Contoh alur end-to-end: User → UserList](#6-contoh-alur-end-to-end-user--userlist)
7. [Config: path alias `@/*`](#7-config-path-alias-)
8. [Desain](#8-desain)
9. [Dashboard: definisi angka](#9-dashboard-definisi-angka)
10. [Backend yang ditambahkan](#10-backend-yang-ditambahkan)
11. [Testing & kualitas](#11-testing--kualitas)
12. [Menjalankan](#12-menjalankan)
13. [Roadmap](#13-roadmap)

---

## 1. Stack

| Bagian | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack), React 19, TypeScript 5.9 strict | Route Handler bisa jadi BFF, jadi token dan API key tidak pernah sampai ke browser |
| Styling | **Tailwind CSS 4** + token CSS variable (`globals.css`) | Theming & dark mode cukup di satu file |
| Varian komponen | `class-variance-authority` (cva) + `clsx` + `tailwind-merge` (`cn()`) | Pola varian yang konsisten untuk semua base component |
| Data fetching | **TanStack Query 5** | Cache, refetch berkala (pesanan masuk terus), invalidasi setelah mutasi |
| Grafik | Recharts 3 | Bar chart harian penjualan & pembelian |
| Ikon | lucide-react | |
| Font | Plus Jakarta Sans (self-hosted via `@fontsource-variable`) | Tidak butuh Google Fonts saat build |
| Test | **Vitest** | Domain, use case, dan mapper dites tanpa browser |
| Lint | ESLint 9 + `eslint-config-next` + aturan **batas layer** | Aturan dependency clean architecture dicek otomatis |

Semua versi dipin persis di `package.json`.

> ESLint 10 belum bisa dipakai: `eslint-plugin-react` (bagian dari `eslint-config-next`) masih error di ESLint 10.

---

## 2. Fitur & halaman

| Path | Halaman | Isi | Endpoint (via `/api/backend`) |
|---|---|---|---|
| `/login` | Masuk | Email + password akun TryTuist; akun non-admin ditolak | `POST /api/auth/login` → `/v1/auth/login` + `/v1/admin/me` |
| `/` | Dashboard | Rel status pesanan, penjualan, pembelian, menu terlaris, metode bayar, tabel harian; rentang tanggal di URL (`?from&to`) | `GET /v1/admin/dashboard` |
| `/orders` | Pesanan | Tab status (default **Aktif**), cari nomor/nama/email, filter tanggal, paginasi; refresh tiap 30 detik | `GET /v1/admin/orders` |
| `/orders/[id]` | Detail pesanan | Rincian item & total, pelanggan, alamat, riwayat status (siapa & alasan); tombol **Tandai sukses**, **Tandai gagal**, majukan status, **Batalkan** | `GET /v1/admin/orders/{id}`, `PATCH /v1/admin/orders/{id}/status` |
| `/products` | Produk & harga | **Tambah menu** (nama, kategori, harga, deskripsi, URL foto + pratinjau, varian + tambahan harga, stok, label terlaris); ubah semua field itu; switch stok tersedia–habis; harga yang dibayar pelanggan (promo) | `GET/POST /v1/admin/products`, `PATCH /v1/admin/products/{id}`, `GET /v1/categories` |
| `/promos` | Promo | Buat / ubah / nonaktifkan / hapus promo, tandai popup Beranda | `GET/POST /v1/admin/deals`, `PATCH/DELETE /v1/admin/deals/{id}` |
| `/customers` | Pelanggan | Daftar akun + jumlah pesanan + total belanja sukses | `GET /v1/admin/customers` |
| `/activity` | Aktivitas | Audit log semua perubahan dari web admin | `GET /v1/admin/audit-logs` |

**Aturan status pesanan oleh admin.** Sama di backend (`order.CanAdminTransition`) dan frontend (`domain/order/orderStatus.ts`):

```
PENDING → PAID → PROCESSING → DELIVERING → COMPLETED (Sukses)
   │        │         │            │
   └────────┴─────────┴────────────┴──→ FAILED (Gagal)  · alasan wajib
                                    └──→ CANCELLED (Batal) · alasan wajib
```

- Boleh maju dan melompat, misalnya Menunggu → Sukses.
- Tidak boleh mundur.
- Status akhir (Sukses / Gagal / Batal) terkunci.
- Gagal dan batal mengembalikan voucher dan mengurangi `sold_count`, sama seperti pembatalan oleh pelanggan.
- Alasan tampil di riwayat pesanan pelanggan (`status_history[].note`).

**Tambah menu.**

- Id dibuat server berurutan seperti seed (`P15`, `P16`, …). Menu baru langsung tampil di `GET /v1/products` (aplikasi iOS) bila stoknya tersedia, dan bisa langsung dipesan.
- Varian tanpa id mendapat id dari namanya, mis. "Porsi Jumbo" → `porsi-jumbo`. Varian yang sudah ada tetap memakai id lamanya saat diubah, supaya keranjang pelanggan tidak rusak.
- Mengirim `options` = daftar varian diganti seluruhnya; `[]` = tanpa varian.
- Foto berupa URL https (mis. Unsplash atau CDN sendiri). Upload file belum ada (lihat roadmap).
- Menu tidak bisa dihapus karena riwayat pesanan merujuk ke menu itu. Untuk menyembunyikannya, matikan stok.

---

## 3. Clean architecture (versi frontend)

### 3.1 Empat layer + `shared`

```
src/
├── domain/            ← TypeScript murni: entity, aturan bisnis, interface repository, error
│   ├── order/         Order.ts · orderStatus.ts (label, transisi) · OrderRepository.ts
│   ├── product/  deal/  dashboard/  user/  auth/  audit/
│   └── shared/        errors.ts (AppError, ValidationError) · pagination.ts · dateRange.ts
├── application/       ← use case: validasi + orkestrasi, hanya kenal domain
│   └── order/orderUseCases.ts  (makeListOrders, makeChangeOrderStatus, …)
├── infrastructure/    ← dunia luar: HTTP, DTO, mapper, implementasi repository, BFF server
│   ├── http/httpClient.ts       fetch + envelope backend → AppError
│   ├── dto/dtos.ts              cermin JSON backend (snake_case)
│   ├── mappers/mappers.ts       DTO ↔ entity (satu-satunya yang tahu bentuk JSON)
│   ├── repositories/Http*.ts    implements *Repository
│   ├── server/                  server-only: panggil Go + API key, cookie sesi, refresh token
│   └── container.ts             composition root: repository → use case
├── presentation/      ← React
│   ├── components/ui/           base component: presentational murni, nol logika bisnis
│   ├── components/layout/       AppShell, PageHeader, ThemeToggle
│   ├── features/<fitur>/        komponen fitur (OrdersView, UserList, …)
│   ├── hooks/                   useOrders, useUsers, … (TanStack Query ↔ use case)
│   └── providers/               AppProviders (QueryClient), DependenciesProvider (container)
├── shared/            ← utilitas tanpa aturan bisnis: lib/cn.ts, lib/format.ts, config/env.ts
├── app/               ← routing Next.js (tipis): page.tsx hanya merender komponen fitur
│   └── api/           ← Route Handler BFF: /api/auth/*, /api/backend/[...path]
└── proxy.ts           ← Next.js 16 (dulu middleware.ts): redirect ke /login bila tidak ada sesi
```

### 3.2 Aturan dependency (layer dalam tidak tahu layer luar)

```
presentation ──→ application ──→ domain
      │                ▲
      └─(container)──→ infrastructure ──→ domain
```

| Layer | Boleh import | Tidak boleh |
|---|---|---|
| `domain` | `domain/*` | React, Next, `application`, `infrastructure`, `presentation` |
| `application` | `domain` | React, Next, `infrastructure`, `presentation` |
| `infrastructure` | `domain`, `application` (hanya `container.ts`), `shared` | `presentation`, `app` |
| `presentation/components/ui` | `shared/lib/cn`, React | `domain`, `application`, `infrastructure`, hooks, features |
| `presentation` (lainnya) | `domain` (tipe & aturan), `shared`, `infrastructure/container` (lewat provider) | `infrastructure/repositories`, `http`, `server` |
| `app/` | `presentation`, `infrastructure/server` (Route Handler) | |

Aturan ini **dicek ESLint** (`no-restricted-imports` per folder di `eslint.config.mjs`). Contoh: meng-import `react` di `src/domain/**` membuat `npm run lint` gagal dengan pesan yang menjelaskan aturannya:

```js
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Aturan dependency clean architecture (lihat WEBPLAN.md §3.2):
// layer dalam tidak boleh meng-import layer luar.
const layer = (files, forbidden, message) => ({
  files,
  rules: {
    "no-restricted-imports": ["error", { patterns: forbidden.map((group) => ({ group: [group], message })) }],
  },
});

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  layer(
    ["src/domain/**"],
    ["@/application/*", "@/infrastructure/*", "@/presentation/*", "@/app/*", "react", "react-dom", "next", "next/*"],
    "domain hanya boleh berisi TypeScript murni (entity, aturan bisnis, interface repository).",
  ),
  layer(
    ["src/application/**"],
    ["@/infrastructure/*", "@/presentation/*", "@/app/*", "react", "react-dom", "next", "next/*"],
    "application hanya boleh bergantung pada domain.",
  ),
  layer(
    ["src/infrastructure/**"],
    ["@/presentation/*", "@/app/*"],
    "infrastructure tidak boleh tahu UI.",
  ),
  layer(
    ["src/presentation/components/ui/**"],
    ["@/domain/*", "@/application/*", "@/infrastructure/*", "@/presentation/hooks/*", "@/presentation/features/*"],
    "Base component (ui/) murni presentational: hanya props, tanpa data & logika bisnis.",
  ),
  layer(
    ["src/presentation/**"],
    ["@/infrastructure/repositories/*", "@/infrastructure/http/*", "@/infrastructure/server/*"],
    "presentation memakai use case lewat useDependencies(), bukan repository langsung.",
  ),
];

export default config;
```

### 3.3 Base component tetap presentational murni

`presentation/components/ui/*` (Button, Input, Card, Badge, Table, Dialog, …):

- hanya menerima **props** dan meneruskan props native (`...props`),
- tidak memanggil hook data, tidak mengenal entity (`Order`, `User`), tidak memformat Rupiah,
- tidak punya state bisnis. State UI murni boleh, misalnya `<Dialog>` memanggil `showModal()`.

Logika ada di **use case** (validasi), **hook** (fetch/mutasi/cache), dan **feature component** (merangkai base component untuk satu layar).

---

## 4. Auth & keamanan

Pola **BFF (Backend for Frontend)**: browser hanya bicara ke Next.js; Next.js yang bicara ke Go.

```
Browser                         Next.js (port 3000, server)                 trytuist-api (8080)
───────                         ───────────────────────────                 ───────────────────
POST /api/auth/login  ───────→  POST /v1/auth/login (X-API-Key)  ─────────→  cek email+password
  {email,password}              GET  /v1/admin/me (Bearer)       ─────────→  role = ADMIN?
                                   bukan admin → POST /v1/auth/logout, balas 403
                         ←────  Set-Cookie tt_admin_access, tt_admin_refresh (httpOnly)

GET /api/backend/v1/admin/... ─→ tambah X-API-Key + Bearer dari cookie ───→  Auth + RequireAdmin
                                 401? → POST /v1/auth/refresh sekali, ulangi request,
                                        set cookie baru; refresh gagal → hapus cookie, 401
                         ←────  JSON backend apa adanya (envelope sama)
```

- **API key & token tidak pernah ada di JavaScript browser.** Cookie `httpOnly`, `SameSite=Lax`, dan `Secure` di production (`COOKIE_SECURE`).
- **Allow-list proxy:** hanya `v1/admin/*` dan `v1/categories` yang diteruskan. Endpoint lain dibalas 404.
- **Role dicek backend setiap request** (`admin.RequireAdmin` membaca `users.role`). Mencabut role ADMIN langsung berlaku.
- **Refresh token dirotasi backend.** Request paralel yang sama-sama me-refresh memakai satu hasil (`refreshSession` berbagi promise selama 10 detik), jadi admin tidak ter-logout karena race.
- `proxy.ts` hanya cek ada/tidaknya cookie untuk redirect `/login ↔ /`. Keabsahan tetap di backend.
- `?next=` setelah login hanya menerima path internal (cegah open redirect).
- Sesi habis (refresh juga gagal) → `QueryCache.onError` membuka `/login?expired=1&next=…`.
- Semua perubahan dicatat di `admin_audit_logs` (halaman Aktivitas).

**Membuat admin.** Dev/staging: `make seed` membuat `admin@trytuist.com / admin12345`. Production:

```sql
UPDATE users SET role = 'ADMIN' WHERE lower(email) = 'nama@domain.com';
```

---

## 5. Base component

Pola kunci yang sama di semua base component:

> **base class → variants (`cva`) → `forwardRef` → `cn(variants, className)`**, extend props native, `displayName`.

Mau tambah komponen baru (Badge, Label, Tabs, …)? Salin template Button.

React 19 sebenarnya sudah menerima `ref` sebagai prop biasa. `forwardRef` tetap dipakai supaya polanya seragam, dan karena masih didukung penuh.

### 5.1 `cn()` helper (`src/shared/lib/cn.ts`)

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gabungkan class Tailwind: `clsx` untuk kondisi, `twMerge` supaya class yang bentrok
 * (mis. `px-2` dari variant dan `px-4` dari pemanggil) diselesaikan oleh yang terakhir.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 5.2 `globals.css`: token theming + dark mode (`src/app/globals.css`)

Komponen hanya memakai **nama token** (`bg-surface`, `text-ink-muted`, `border-line`, `bg-brand`, `text-success`, …), tidak pernah hex. Dark mode punya dua jalur:

- otomatis mengikuti sistem (`prefers-color-scheme`), kecuali user memilih terang,
- pilihan manual `data-theme="dark|light"` di `<html>` (tombol tema di sidebar, disimpan di `localStorage`).

```css
@import "tailwindcss";

/*
 * Token tema TryTuist Admin. Komponen hanya memakai nama token (bg-surface, text-ink,
 * border-line, bg-brand, ...), jadi ganti warna / dark mode cukup di file ini.
 *
 * Brand chili #D9480F = warna brand app iOS (TTUI Color.brand).
 * Warna status pesanan punya arti tetap: kunyit = sedang jalan, pandan = sukses,
 * merah = gagal, abu = batal.
 */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  --canvas: #f1f2f4;
  --surface: #ffffff;
  --surface-muted: #f7f8f9;
  --ink: #1b1f24;
  --ink-muted: #5b6470;
  --ink-faint: #8a929c;
  --line: #dde1e6;
  --line-strong: #c4cad2;

  --brand: #d9480f;
  --brand-hover: #bf3d0b;
  --brand-ink: #ffffff;
  --brand-soft: #fcebe3;

  --success: #237a57;
  --success-soft: #e3f3ec;
  --warning: #9a6312;
  --warning-soft: #fbf0d9;
  --danger: #b42318;
  --danger-soft: #fdeceb;
  --info: #2f5f98;
  --info-soft: #e6eef8;
  --neutral-soft: #eceef1;

  --focus: #d9480f;
  /* Warna mark grafik (divalidasi: kontras ≥ 3:1 & band lightness, light + dark). */
  --chart-sales: #d9480f;
  --chart-purchases: #2f5f98;
  --radius-control: 6px;
  --radius-panel: 10px;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --canvas: #14171b;
    --surface: #1c2025;
    --surface-muted: #22272d;
    --ink: #eceef1;
    --ink-muted: #a0a8b2;
    --ink-faint: #737c87;
    --line: #2d333a;
    --line-strong: #3d444d;
    --brand: #f0662d;
    --brand-hover: #f5804f;
    --brand-ink: #1b0d06;
    --brand-soft: #3a2117;
    --success: #4cc08d;
    --success-soft: #16322a;
    --warning: #e3ac4c;
    --warning-soft: #362a14;
    --danger: #f2766b;
    --danger-soft: #3b1d1b;
    --info: #7fa9de;
    --info-soft: #1b2a3d;
    --neutral-soft: #2a3037;
    --focus: #f0662d;
    --chart-sales: #e85a22;
    --chart-purchases: #5b8fd0;
    color-scheme: dark;
  }
}

:root[data-theme="dark"] {
  --canvas: #14171b;
  --surface: #1c2025;
  --surface-muted: #22272d;
  --ink: #eceef1;
  --ink-muted: #a0a8b2;
  --ink-faint: #737c87;
  --line: #2d333a;
  --line-strong: #3d444d;
  --brand: #f0662d;
  --brand-hover: #f5804f;
  --brand-ink: #1b0d06;
  --brand-soft: #3a2117;
  --success: #4cc08d;
  --success-soft: #16322a;
  --warning: #e3ac4c;
  --warning-soft: #362a14;
  --danger: #f2766b;
  --danger-soft: #3b1d1b;
  --info: #7fa9de;
  --info-soft: #1b2a3d;
  --neutral-soft: #2a3037;
  --focus: #f0662d;
  --chart-sales: #e85a22;
  --chart-purchases: #5b8fd0;
  color-scheme: dark;
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-ink-faint: var(--ink-faint);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-brand: var(--brand);
  --color-brand-hover: var(--brand-hover);
  --color-brand-ink: var(--brand-ink);
  --color-brand-soft: var(--brand-soft);
  --color-success: var(--success);
  --color-success-soft: var(--success-soft);
  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
  --color-danger: var(--danger);
  --color-danger-soft: var(--danger-soft);
  --color-info: var(--info);
  --color-info-soft: var(--info-soft);
  --color-neutral-soft: var(--neutral-soft);
  --color-focus: var(--focus);
  --color-chart-sales: var(--chart-sales);
  --color-chart-purchases: var(--chart-purchases);
  --radius-control: var(--radius-control);
  --radius-panel: var(--radius-panel);
  --font-sans: "Plus Jakarta Sans Variable", ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
  }
  body {
    background: var(--canvas);
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: 0.9375rem;
    line-height: 1.5;
    font-feature-settings: "ss01";
  }
  :focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }
  /* Angka (harga, jumlah) selalu sejajar di tabel & KPI. */
  .tabular {
    font-variant-numeric: tabular-nums;
  }
  dialog::backdrop {
    background: rgb(20 23 27 / 0.45);
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}

/* Grafik (Recharts): grid & teks memakai token, bukan warna series. */
.tt-chart .recharts-cartesian-grid line {
  stroke: var(--line);
}
.tt-chart .recharts-cartesian-axis-tick-value,
.tt-chart .recharts-text {
  fill: var(--ink-faint);
  font-size: 11px;
}
.tt-chart .recharts-tooltip-cursor {
  fill: var(--neutral-soft);
}
```

### 5.3 Button: pola utama (`src/presentation/components/ui/button.tsx`)

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

// Pola semua base component: base class → variants (cva) → forwardRef → cn(variants, className).
export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-ink hover:bg-brand-hover",
        secondary: "bg-neutral-soft text-ink hover:bg-line",
        outline: "border border-line-strong bg-surface text-ink hover:bg-surface-muted",
        ghost: "text-ink-muted hover:bg-neutral-soft hover:text-ink",
        danger: "bg-danger text-white hover:opacity-90 dark:text-canvas",
        success: "bg-success text-white hover:opacity-90 dark:text-canvas",
      },
      size: {
        sm: "h-8 px-3 text-[0.8125rem]",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-[0.9375rem]",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Menampilkan spinner dan menonaktifkan tombol. */
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, disabled, children, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && (
        <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
```

Cara pakai:

```tsx
import { Button } from "@/presentation/components/ui";

<Button>Simpan perubahan</Button>                              // primary, md
<Button variant="outline" size="sm" onClick={edit}>Ubah harga</Button>
<Button variant="success" isLoading={change.isPending}>Tandai sukses</Button>
<Button variant="danger" disabled={!reason}>Tandai gagal</Button>
<Button variant="ghost" className="w-full justify-start">…</Button>   // className menang lewat cn()

// Pakai gaya tombol di elemen lain (mis. <Link>):
<Link href="/promos" className={buttonVariants({ variant: "outline" })}>Lihat promo</Link>
```

### 5.4 Input (`src/presentation/components/ui/input.tsx`)

Prop `size` native di-`Omit` supaya tidak bentrok dengan varian `size`. `invalid` juga mengisi `aria-invalid`.

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const inputVariants = cva(
  "w-full rounded-control border bg-surface text-ink placeholder:text-ink-faint transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      size: { sm: "h-8 px-2.5 text-[0.8125rem]", md: "h-10 px-3 text-sm" },
      invalid: { true: "border-danger", false: "border-line-strong hover:border-ink-faint" },
    },
    defaultVariants: { size: "md", invalid: false },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, size, invalid, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(inputVariants({ size, invalid }), className)}
    {...props}
  />
));
Input.displayName = "Input";
```

### 5.5 Card: compound component (`src/presentation/components/ui/card.tsx`)

```tsx
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

// Compound component: <Card><CardHeader><CardTitle/>…</CardHeader><CardContent/>…</Card>

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-panel border border-line bg-surface", className)} {...props} />
));
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-4 pb-3", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-[0.9375rem] font-bold text-ink", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-[0.8125rem] text-ink-muted", className)} {...props} />,
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-5 pb-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-2 border-t border-line px-5 py-3", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
```

```tsx
<Card>
  <CardHeader>
    <CardTitle>Menu terlaris</CardTitle>
    <CardDescription>30 hari terakhir</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter><Button size="sm">Lihat semua</Button></CardFooter>
</Card>
```

### 5.6 Template komponen baru: Badge (`src/presentation/components/ui/badge.tsx`)

Contoh komponen yang dibuat dengan menyalin pola Button:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-neutral-soft text-ink-muted",
        brand: "bg-brand-soft text-brand",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        info: "bg-info-soft text-info",
      },
      dot: { true: "before:size-1.5 before:rounded-full before:bg-current", false: "" },
    },
    defaultVariants: { tone: "neutral", dot: false },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, tone, dot, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ tone, dot }), className)} {...props} />
));
Badge.displayName = "Badge";
```

### 5.7 Barrel export (`src/presentation/components/ui/index.ts`)

```ts
// Barrel: `import { Button, Card, Input } from "@/presentation/components/ui";`
export { Badge, badgeVariants, type BadgeProps } from "./badge";
export { Button, buttonVariants, type ButtonProps } from "./button";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export { Dialog } from "./dialog";
export { Field } from "./field";
export { Input, inputVariants, type InputProps } from "./input";
export { Label } from "./label";
export { Select } from "./select";
export { Skeleton } from "./skeleton";
export { Switch, type SwitchProps } from "./switch";
export { Table, TBody, TD, TH, THead, TR } from "./table";
export { Textarea, type TextareaProps } from "./textarea";
```

Komponen lain di `ui/`: `Textarea`, `Select` (native), `Label`, `Field` (label + error + `aria-describedby`), `Table`/`THead`/`TBody`/`TR`/`TH`/`TD`, `Dialog` (`<dialog>` native: fokus terkunci & Esc tanpa library), `Switch` (`role="switch"`), `Skeleton`.

---

## 6. Contoh alur end-to-end: User → UserList

Halaman **Pelanggan** (`/customers`) adalah contoh lengkap satu fitur melewati semua layer. Fitur lain (pesanan, produk, promo, dashboard) mengikuti alur yang sama.

```
User (entity) ── UserRepository (interface)      domain
                      │
         makeListUsers(repo)                     application
                      │
HttpUserRepository ── toUser(dto) ── httpClient   infrastructure
                      │
          createContainer() → useDependencies()   composition root
                      │
            useUsers(filter)  (TanStack Query)    presentation/hooks
                      │
   UsersView (state filter)  →  UserList(users)   presentation/features
                                    │
                         Table / Badge (ui)       presentation/components/ui
```

**1. Entity + repository interface** (`src/domain/user/User.ts`). Tidak ada React, fetch, atau JSON di sini.

```ts
import type { Paginated } from "@/domain/shared/pagination";

export type UserRole = "CUSTOMER" | "ADMIN";
export type MemberTier = "SILVER" | "GOLD" | "PLATINUM";

/** Pelanggan (dan admin) beserta ringkasan pembeliannya. */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  tier: MemberTier;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  createdAt: Date;
}

export interface UserFilter {
  query: string;
  page: number;
  limit: number;
}

export interface UserRepository {
  list(filter: UserFilter): Promise<Paginated<User>>;
}

/** Aturan bisnis kecil yang tidak butuh UI maupun server: pelanggan yang pernah belanja ≥ 2 kali. */
export function isRepeatBuyer(user: Pick<User, "ordersCount">): boolean {
  return user.ordersCount >= 2;
}
```

**2. Use case** (`src/application/user/userUseCases.ts`)

```ts
import type { UserFilter, UserRepository } from "@/domain/user/User";

export function makeListUsers(repo: UserRepository) {
  return (filter: UserFilter) => repo.list({ ...filter, query: filter.query.trim() });
}
```

**3. Implementasi HTTP** (`src/infrastructure/repositories/HttpUserRepository.ts`). DTO snake_case diterjemahkan oleh mapper `toUser`.

```ts
import type { UserFilter, UserRepository } from "@/domain/user/User";
import type { UserDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toUser } from "../mappers/mappers";

export class HttpUserRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filter: UserFilter) {
    const res = await this.http.get<UserDTO[]>("/v1/admin/customers", {
      q: filter.query,
      page: filter.page,
      limit: filter.limit,
    });
    return {
      items: res.data.map(toUser),
      page: res.meta?.page ?? filter.page,
      limit: res.meta?.limit ?? filter.limit,
      total: res.meta?.total ?? res.data.length,
    };
  }
}
```

```ts
// src/infrastructure/mappers/mappers.ts (potongan)
export function toUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    role: (dto.role === "ADMIN" ? "ADMIN" : "CUSTOMER") as UserRole,
    tier: (["SILVER", "GOLD", "PLATINUM"].includes(dto.member_tier) ? dto.member_tier : "SILVER") as MemberTier,
    ordersCount: dto.orders_count,
    totalSpent: dto.total_spent,
    lastOrderAt: dto.last_order_at ? new Date(dto.last_order_at) : null,
    createdAt: new Date(dto.created_at),
  };
}
```

**4. Composition root** (`src/infrastructure/container.ts`). Satu-satunya tempat repository dipilih.

```ts
import { makeListAuditLogs } from "@/application/audit/auditUseCases";
import { makeGetCurrentAdmin, makeLogin, makeLogout } from "@/application/auth/authUseCases";
import { makeGetDashboard } from "@/application/dashboard/dashboardUseCases";
import { makeDeleteDeal, makeListDeals, makeSaveDeal, makeToggleDeal } from "@/application/deal/dealUseCases";
import { makeChangeOrderStatus, makeGetOrder, makeListOrders } from "@/application/order/orderUseCases";
import {
  makeCreateProduct,
  makeListCategories,
  makeListProducts,
  makeUpdateProduct,
} from "@/application/product/productUseCases";
import { makeListUsers } from "@/application/user/userUseCases";
import type { AuditLogRepository } from "@/domain/audit/AuditLog";
import type { AuthRepository } from "@/domain/auth/Auth";
import type { DashboardRepository } from "@/domain/dashboard/Dashboard";
import type { DealRepository } from "@/domain/deal/DealRepository";
import type { OrderRepository } from "@/domain/order/OrderRepository";
import type { ProductRepository } from "@/domain/product/ProductRepository";
import type { UserRepository } from "@/domain/user/User";
import { createHttpClient } from "./http/httpClient";
import { HttpAuditLogRepository } from "./repositories/HttpAuditLogRepository";
import { HttpAuthRepository } from "./repositories/HttpAuthRepository";
import { HttpDashboardRepository } from "./repositories/HttpDashboardRepository";
import { HttpDealRepository } from "./repositories/HttpDealRepository";
import { HttpOrderRepository } from "./repositories/HttpOrderRepository";
import { HttpProductRepository } from "./repositories/HttpProductRepository";
import { HttpUserRepository } from "./repositories/HttpUserRepository";

export interface Repositories {
  orders: OrderRepository;
  products: ProductRepository;
  deals: DealRepository;
  dashboard: DashboardRepository;
  users: UserRepository;
  auth: AuthRepository;
  audit: AuditLogRepository;
}

export function createHttpRepositories(): Repositories {
  const backend = createHttpClient("/api/backend");
  const auth = createHttpClient("/api/auth");
  return {
    orders: new HttpOrderRepository(backend),
    products: new HttpProductRepository(backend),
    deals: new HttpDealRepository(backend),
    dashboard: new HttpDashboardRepository(backend),
    users: new HttpUserRepository(backend),
    auth: new HttpAuthRepository(auth, backend),
    audit: new HttpAuditLogRepository(backend),
  };
}

/**
 * Composition root: satu-satunya tempat repository dipilih. Ganti sumber data (mock, GraphQL,
 * backend lain) cukup dengan memberi `Repositories` lain; use case & UI tidak berubah.
 */
export function createContainer(repos: Repositories = createHttpRepositories()) {
  return {
    listOrders: makeListOrders(repos.orders),
    getOrder: makeGetOrder(repos.orders),
    changeOrderStatus: makeChangeOrderStatus(repos.orders),
    listProducts: makeListProducts(repos.products),
    listCategories: makeListCategories(repos.products),
    createProduct: makeCreateProduct(repos.products),
    updateProduct: makeUpdateProduct(repos.products),
    listDeals: makeListDeals(repos.deals),
    saveDeal: makeSaveDeal(repos.deals),
    toggleDeal: makeToggleDeal(repos.deals),
    deleteDeal: makeDeleteDeal(repos.deals),
    getDashboard: makeGetDashboard(repos.dashboard),
    listUsers: makeListUsers(repos.users),
    login: makeLogin(repos.auth),
    logout: makeLogout(repos.auth),
    getCurrentAdmin: makeGetCurrentAdmin(repos.auth),
    listAuditLogs: makeListAuditLogs(repos.audit),
  };
}

export type Container = ReturnType<typeof createContainer>;
```

```tsx
// src/presentation/providers/DependenciesProvider.tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createContainer, type Container } from "@/infrastructure/container";

const DependenciesContext = createContext<Container | null>(null);

/**
 * Menyediakan use case ke seluruh UI. Untuk test / Storybook / mode demo, berikan
 * `container` lain (mis. `createContainer(mockRepositories)`); komponen tidak perlu diubah.
 */
export function DependenciesProvider({ children, container }: { children: ReactNode; container?: Container }) {
  const [value] = useState(() => container ?? createContainer());
  return <DependenciesContext.Provider value={value}>{children}</DependenciesContext.Provider>;
}

export function useDependencies(): Container {
  const value = useContext(DependenciesContext);
  if (!value) throw new Error("useDependencies harus dipakai di dalam <DependenciesProvider>.");
  return value;
}
```

**5. Hook `useUsers`** (`src/presentation/hooks/useUsers.ts`). Logic data ada di sini.

```ts
"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UserFilter } from "@/domain/user/User";
import { useDependencies } from "../providers/DependenciesProvider";
import { queryKeys } from "./queryKeys";

/** Logic data ada di sini; komponen `UserList` cukup menerima hasilnya. */
export function useUsers(filter: UserFilter) {
  const { listUsers } = useDependencies();
  return useQuery({
    queryKey: queryKeys.users(filter),
    queryFn: () => listUsers(filter),
    placeholderData: keepPreviousData,
  });
}
```

**6. Feature component** (`src/presentation/features/users/UserList.tsx`). UI hanya menerima props dan merangkai base component.

```tsx
import { isRepeatBuyer, type User } from "@/domain/user/User";
import { formatDate, formatNumber, formatRupiah } from "@/shared/lib/format";
import { Badge, Table, TBody, TD, TH, THead, TR } from "../../components/ui";

/**
 * Feature component "bodoh": hanya menerima data lewat props dan merangkai base component.
 * Tidak tahu data datang dari HTTP, mock, atau cache.
 */
export function UserList({ users }: { users: User[] }) {
  return (
    <Table>
      <THead>
        <TR>
          <TH>Pelanggan</TH>
          <TH>Member</TH>
          <TH className="text-right">Pesanan</TH>
          <TH className="text-right">Belanja sukses</TH>
          <TH>Pesanan terakhir</TH>
          <TH>Bergabung</TH>
        </TR>
      </THead>
      <TBody>
        {users.map((user) => (
          <TR key={user.id}>
            <TD>
              <div className="flex flex-col">
                <span className="flex items-center gap-2 font-semibold">
                  {user.name}
                  {user.role === "ADMIN" && <Badge tone="info">Admin</Badge>}
                  {isRepeatBuyer(user) && <Badge tone="success">Langganan</Badge>}
                </span>
                <span className="text-xs text-ink-muted">
                  {user.email}
                  {user.phone ? ` · ${user.phone}` : ""}
                </span>
              </div>
            </TD>
            <TD className="text-ink-muted capitalize">{user.tier.toLowerCase()}</TD>
            <TD className="tabular text-right">{formatNumber(user.ordersCount)}</TD>
            <TD className="tabular text-right font-semibold">{formatRupiah(user.totalSpent)}</TD>
            <TD className="tabular text-ink-muted">{user.lastOrderAt ? formatDate(user.lastOrderAt) : "Belum pernah"}</TD>
            <TD className="tabular text-ink-muted">{formatDate(user.createdAt)}</TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
```

```tsx
// src/presentation/features/users/UsersView.tsx — state filter + hook → UserList
"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { pageCount } from "@/domain/shared/pagination";
import { EmptyState, ErrorState, Pagination } from "../../components/common/States";
import { PageHeader } from "../../components/layout/PageHeader";
import { Card, Input, Skeleton } from "../../components/ui";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useUsers } from "../../hooks/useUsers";
import { UserList } from "./UserList";

export function UsersView() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const debounced = useDebouncedValue(query);
  const users = useUsers({ query: debounced, page, limit: 20 });

  return (
    <>
      <PageHeader title="Pelanggan" description="Akun aplikasi beserta jumlah pesanan dan total belanja yang sukses." />
      <label className="relative mb-4 block max-w-md">
        <span className="sr-only">Cari pelanggan</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Cari nama, email, atau nomor HP"
          className="pl-9"
        />
      </label>
      {users.isError ? (
        <ErrorState error={users.error} onRetry={() => users.refetch()} />
      ) : (
        <Card>
          {users.isPending ? <Skeleton className="m-4 h-48" /> : <UserList users={users.data.items} />}
          {users.data?.items.length === 0 && <EmptyState title="Pelanggan tidak ditemukan" />}
          {users.data && <Pagination page={users.data.page} pageCount={pageCount(users.data)} onChange={setPage} />}
        </Card>
      )}
    </>
  );
}
```

**7. Route** (`src/app/(admin)/customers/page.tsx`). Tipis.

```tsx
import type { Metadata } from "next";
import { UsersView } from "@/presentation/features/users/UsersView";

export const metadata: Metadata = { title: "Pelanggan" };

export default function CustomersPage() {
  return <UsersView />;
}
```

**Ganti sumber data cukup ganti repository.** Contoh mode demo tanpa backend:

```tsx
const mockUsers: UserRepository = {
  list: async () => ({ items: [/* User[] */], page: 1, limit: 20, total: 0 }),
};
<DependenciesProvider container={createContainer({ ...createHttpRepositories(), users: mockUsers })}>
  <UsersView />
</DependenciesProvider>
```

Use case, hook, `UsersView`, dan `UserList` tidak berubah sama sekali. Unit test memakai cara yang sama (lihat `orderUseCases.test.ts`: repository palsu via `vi.fn`).

---

## 7. Config: path alias `@/*`

Satu alias untuk seluruh `src/`: `@/domain/...`, `@/presentation/components/ui`, dan seterusnya.

**`tsconfig.json`**. Next.js membaca `paths` langsung dari sini; tidak ada konfigurasi bundler tambahan.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2023"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**`vitest.config.ts`.** Next.js tidak memakai Vite, jadi tidak ada `vite.config.ts` untuk aplikasinya. Vitest memakai config Vite, jadi di sinilah alias versi Vite berada. Isinya harus sama dengan `paths` di tsconfig.

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Next.js tidak memakai Vite, tapi Vitest memakai config Vite. Alias `@/*` di sini
// harus sama dengan `paths` di tsconfig.json.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

> Kalau suatu saat aplikasi dipindah ke Vite (mis. SPA React murni), `vite.config.ts` memakai blok `resolve.alias` yang sama persis dengan di atas, ditambah `plugins: [react(), tailwindcss()]`. Layer `domain`, `application`, dan `infrastructure` (kecuali `server/`) tidak perlu diubah.

**`next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Port default Next.js (3000). Backend Go tetap di 8080 dan hanya dipanggil dari server
  // (Route Handler /api/*), jadi browser tidak pernah melihat API key maupun token.
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
```

---

## 8. Desain

**Subjek:** back-office outlet F&B. Admin membuka web ini seharian untuk memantau pesanan masuk, jadi prioritasnya keterbacaan dan aksi cepat, bukan dekorasi.

| Token | Light | Dark | Dipakai untuk |
|---|---|---|---|
| `brand` | `#D9480F` | `#F0662D` | Warna brand app iOS (TTUI `Color.brand`): tombol utama, menu aktif |
| `canvas` / `surface` | `#F1F2F4` / `#FFFFFF` | `#14171B` / `#1C2025` | Latar abu dingin, panel putih |
| `ink` / `ink-muted` | `#1B1F24` / `#5B6470` | `#ECEEF1` / `#A0A8B2` | Teks |
| `warning` (kunyit) | `#9A6312` | `#E3AC4C` | Pesanan **sedang berjalan** |
| `success` (pandan) | `#237A57` | `#4CC08D` | **Sukses** |
| `danger` | `#B42318` | `#F2766B` | **Gagal** |
| `chart-sales` / `chart-purchases` | `#D9480F` / `#2F5F98` | `#E85A22` / `#5B8FD0` | Mark grafik (lolos validator kontras & lightness di kedua mode) |

- **Tipografi:** satu keluarga, Plus Jakarta Sans (typeface buatan Jakarta, cocok untuk produk F&B Indonesia). Angka memakai `tabular-nums` supaya harga sejajar di tabel.
- **Elemen khas:** *Perjalanan pesanan* di dashboard berupa rel stasiun Menunggu → Dibayar → Diproses → Diantar → Sukses, dengan Gagal & Batal sebagai cabang putus-putus. Tiap stasiun membuka daftar pesanan dengan filter yang sama. Elemen lain sengaja tenang: border tipis, tanpa gradien, radius 6px (kontrol) dan 10px (panel).
- **Status tidak hanya warna:** badge = titik + teks; stasiun rel punya label & `aria-label`.
- **Grafik:** satu series per grafik, tanpa sumbu Y ganda. Penjualan (Rp) dan pembelian (jumlah transaksi) digambar terpisah. Ada tooltip, dan data yang sama tersedia sebagai tabel ("Data harian").
- **Aksesibilitas:** fokus keyboard terlihat (`:focus-visible` brand), `prefers-reduced-motion` dihormati, dialog native, layout responsif sampai 390px (sidebar jadi drawer).
- **Bahasa:** sentence case, kata kerja jelas ("Tandai sukses", "Simpan perubahan"); pesan error menyebut apa yang salah dan cara memperbaikinya.

---

## 9. Dashboard: definisi angka

Semua angka dihitung di server dari pesanan yang **dibuat** dalam rentang tanggal (zona waktu toko, WIB). Rentang maksimal 366 hari, default 30 hari terakhir.

| Angka | Definisi |
|---|---|
| **Penjualan** | Total `orders.total` berstatus `COMPLETED` |
| Pesanan sukses / rata-rata / item terjual | Jumlah pesanan sukses · penjualan ÷ pesanan sukses · Σ quantity item pesanan sukses |
| Diskon voucher | Σ `discount` pesanan sukses |
| **Pembelian** | Jumlah semua transaksi pelanggan (semua status) |
| Pembeli (baru / lama) | User unik; *baru* = pesanan pertamanya sepanjang waktu ada di rentang ini |
| Tingkat sukses | Pesanan sukses ÷ semua transaksi |
| Gagal / batal | Jumlah `FAILED` / `CANCELLED` |
| Nilai transaksi | Σ `total` semua transaksi |
| Naik/turun % | Dibanding periode sebelumnya dengan panjang yang sama (`null` bila periode sebelumnya 0) |
| Menu terlaris | Top 5 produk dari pesanan sukses, urut omzet |

> "Pembelian" di sini adalah **transaksi pembelian oleh pelanggan**. Pembelian bahan baku ke supplier (stok & HPP) belum ada di sistem dan masuk roadmap.

---

## 10. Backend yang ditambahkan

Detail kontrak ada di `trytuist-api/API_PLAN.md` §5.25.

- **Migrasi `0007_admin`**
  - `users.role` (`CUSTOMER` | `ADMIN`)
  - `order_status_history.note` + `changed_by`
  - tabel `admin_audit_logs`
  - index `orders (created_at)` dan `orders (status, created_at)`
- **Paket `internal/admin`:** `RequireAdmin`, dashboard, pesanan, produk, promo, pelanggan, audit log.
- **`order.Service.AdminSetStatus`:** aturan transisi admin, alasan wajib untuk gagal/batal, voucher & `sold_count` dikembalikan.
- **Seed:** akun `admin@trytuist.com / admin12345` (role ADMIN).
- **Tes:** integration test `TestAdmin` (role, filter, transisi, dashboard, harga, promo, audit) lolos bersama semua tes lama.

---

## 11. Testing & kualitas

| Perintah | Isi |
|---|---|
| `npm run typecheck` | `tsc --noEmit` (strict + `noUncheckedIndexedAccess`) |
| `npm run lint` | ESLint Next + aturan batas layer |
| `npm test` | Vitest: aturan status (sama dengan backend), rentang tanggal, use case dengan repository palsu, mapper & error backend → `AppError` |
| `npm run check` | Ketiganya sekaligus |
| `npm run build` | Build production |

Yang dites di layer mana:

- **domain / application:** unit test murni, cepat, tanpa DOM.
- **infrastructure:** mapper & `toAppError`.
- **presentation:** dicek manual. Bila perlu otomatis, tambahkan Playwright e2e ke backend dev.

---

## 12. Menjalankan

```bash
# 1. Backend (folder trytuist-api)
make migrate-up seed      # migrasi 0007 + akun admin
make run                  # http://localhost:8080

# 2. Web admin (folder trytuistadmin)
cp .env.example .env.local   # TRYTUIST_API_URL, TRYTUIST_API_KEY (= salah satu API_KEYS backend)
npm install
npm run dev                  # http://localhost:3000
```

Masuk dengan `admin@trytuist.com` / `admin12345`. Akun pelanggan biasa (`kholis@gmail.com`) akan ditolak dengan pesan "Akun ini tidak punya akses admin."

---

## 13. Roadmap

- [x] Login admin (akun yang sama, role ADMIN), BFF + cookie httpOnly + refresh otomatis
- [x] Dashboard penjualan & pembelian, rel status pesanan
- [x] Pesanan: daftar, filter, detail, tandai sukses / gagal / batal, majukan status
- [x] Produk: tambah menu baru (kategori, foto, varian), ubah harga, varian, stok, nama, deskripsi, label terlaris
- [ ] Upload foto menu langsung dari web (storage/CDN), arsip menu
- [x] Promo: CRUD, nonaktifkan, popup Beranda
- [x] Pelanggan & audit log
- [ ] Ekspor CSV pesanan & laporan penjualan
- [ ] Notifikasi pesanan baru (SSE / polling + suara) di halaman Pesanan
- [ ] Kelola kategori, banner, voucher, outlet (buka/tutup)
- [ ] Pembelian bahan baku ke supplier: stok & HPP, untuk laba kotor di dashboard
- [ ] Peran admin bertingkat (owner / kasir) dan 2FA
- [ ] E2E test Playwright di CI
