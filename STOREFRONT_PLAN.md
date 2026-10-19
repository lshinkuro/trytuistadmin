# TryTuist Storefront (web pembeli): Plan

Web untuk **pembeli**: login/daftar, pilih outlet, lihat menu, keranjang, checkout (COD & Bayar Online Midtrans), dan riwayat pesanan, **sama seperti aplikasi iOS**. Tujuannya supaya pelanggan bisa memesan tanpa menunggu rilis app.

- Lokasi kode: folder **`storefront/`** di repo `trytuistadmin`. Aplikasi Next.js terpisah dengan `package.json` sendiri, **tidak** mengubah web admin di `src/`.
- Backend: `trytuist-api` yang sama. Kontrak API ada di `trytuist-api/API_PLAN.md` dan Swagger `GET /docs` (dev/staging).
- Bahasa UI: Indonesia. Mobile-first, karena kebanyakan pembeli memakai HP.

---

## 1. Arsitektur (meniru web admin)

| Hal | Keputusan |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind 4, versi **sama persis** dengan `trytuistadmin/package.json` |
| Data fetching | TanStack Query (seperti admin) |
| Layer | `domain/` → `application/` → `infrastructure/` → `presentation/` + `app/`, aturan import dijaga ESLint (salin `eslint.config.mjs` admin) |
| Akses API | **BFF**: browser hanya memanggil `/api/*` milik storefront. Route handler meneruskan ke backend dengan `X-API-Key` + `Authorization` dari cookie. API key tidak pernah ada di browser |
| Sesi | Cookie httpOnly `tt_shop_access` & `tt_shop_refresh` (nama beda dari admin), refresh otomatis saat 401 (salin pola `src/infrastructure/server/*` admin) |
| Port dev | `3001` (admin `3000`, API `8080`) |
| Env | `TRYTUIST_API_URL`, `TRYTUIST_API_KEY`, `COOKIE_SECURE`, `STOREFRONT_PUBLIC_URL` (mis. `http://localhost:3001`) |
| Test | Vitest untuk domain/application (validasi keranjang, mapper) seperti admin |

Kode admin **boleh disalin** (httpClient, session, format, komponen UI dasar), tapi **tidak di-import lintas folder**, supaya kedua app bisa di-deploy terpisah. Tanpa npm workspaces dulu.

```
storefront/
  package.json, next.config.ts, tsconfig.json, eslint.config.mjs, vitest.config.ts, README.md, .env.example
  src/
    app/
      (shop)/page.tsx                 Beranda: banner, kategori, Promo Hemat, Paket Hemat, Terlaris
      (shop)/menu/page.tsx            Semua menu + filter kategori + cari
      (shop)/menu/[id]/page.tsx       Detail: varian, catatan, jumlah, isi combo, tambah ke keranjang
      (shop)/keranjang/page.tsx       Keranjang + alamat + pembayaran + kupon + quote
      (shop)/bayar/[id]/page.tsx      Status pembayaran online (polling) setelah kembali dari Midtrans
      (shop)/pesanan/page.tsx         Riwayat pesanan
      (shop)/pesanan/[id]/page.tsx    Detail pesanan: status, progres, batal, pesan lagi, refund, struk (print)
      (shop)/akun/page.tsx            Profil, alamat (CRUD), logout
      (auth)/masuk/page.tsx, (auth)/daftar/page.tsx
      api/auth/{login,register,logout}/route.ts
      api/backend/[...path]/route.ts  proxy terbatas (allowlist path, lihat §3)
    domain/ application/ infrastructure/ presentation/ shared/
```

## 2. Fitur & endpoint (semua sudah ada di backend)

| Layar | Endpoint | Catatan |
|---|---|---|
| Masuk / daftar | `POST /v1/auth/login`, `/register`, `/refresh`, `/logout` | Tanpa cek role. Google Sign-In **di luar cakupan v1** |
| Pilih outlet | `GET /v1/stores?lat=&lng=` | Lokasi browser (opsional) atau alamat utama. Outlet terpilih disimpan di cookie/localStorage `tt_shop_store` |
| Beranda | `GET /v1/banners`, `/v1/categories`, `/v1/products?store_id=`, `GET /v1/promotions/popup?store_id=` | Banner punya `action` (PRODUCT → `/menu/[id]`, CATEGORY → `/menu?kategori=`, FREE_DELIVERY → info kupon) |
| Menu & detail | `GET /v1/products?store_id=&category_id=&q=`, `GET /v1/products/{id}?store_id=` | Tampilkan `combo` (isi + hemat), harga coret bila `original_price`, label Habis bila `is_available=false` |
| Keranjang | lokal (localStorage per user id) | Sama seperti iOS: harga **selalu** dari `POST /v1/orders/quote` (ongkir per jarak, `free_delivery`, jarak & ETA). Tombol bayar nonaktif sampai quote berhasil |
| Alamat & bayar | `GET/POST/PATCH/DELETE /v1/me/addresses`, `GET /v1/me/payment-methods` | Alamat baru: isi `lat/lng` dari geolocation browser bila diizinkan (dipakai ongkir per jarak) |
| Checkout | `POST /v1/checkout` + `Idempotency-Key` (uuid, dipakai ulang saat retry) | COD → `next: ORDER` → ke `/pesanan/[id]`. Online → `next: PAYMENT` → redirect ke `payment.redirect_url` (Snap) |
| Status bayar | `GET /v1/payments/{id}`, `POST /v1/payments/{id}/cancel` | Polling tiap 3 detik sampai final; PAID → `/pesanan/[order.id]` |
| Pesanan | `GET /v1/orders`, `/v1/orders/{id}`, `POST /cancel`, `POST /rating` | Tampilkan `refund`, `free_delivery_coupon`, `bundle_items`, ETA. Struk = halaman print-friendly (`window.print()`) |
| Akun | `GET/PATCH /v1/me` | Hapus akun di luar cakupan |

## 3. Keamanan

- Proxy `/api/backend/[...path]` hanya meneruskan **allowlist**: `GET` katalog/stores/banners/promotions/app-config, `/v1/me*`, `/v1/orders*`, `/v1/checkout`, `/v1/payments*`. Tolak `/v1/admin/*` dan `/v1/dev/*` (403). Ada test untuk allowlist ini.
- Cookie `HttpOnly; SameSite=Lax; Secure` (production). Route POST memeriksa header `Origin` = `STOREFRONT_PUBLIC_URL` (CSRF).
- Harga & total tidak pernah dihitung di browser. Yang ditampilkan dan dibayar adalah hasil quote/checkout dari server.

## 4. Perubahan kecil di backend (`trytuist-api`), kerjakan lebih dulu

**Finish URL Midtrans untuk web.** Sekarang `callbacks.finish` Snap selalu `PUBLIC_BASE_URL/v1/payments/finish` (halaman "kembali ke aplikasi"). Untuk web:

- `POST /v1/checkout` menerima field opsional `finish_url`. Dipakai hanya bila origin-nya ada di env baru `WEB_FINISH_ORIGINS` (dipisah koma, mis. `http://localhost:3001,https://shop.trytuist.id`); selain itu diabaikan dan memakai default.
- Storefront mengirim `finish_url = {STOREFRONT_PUBLIC_URL}/bayar/{payment_id}` apa adanya (dengan placeholder). Id sesi baru diketahui setelah insert, jadi server mengganti `{payment_id}` dengan id sesi sebelum membuat transaksi Snap. Snap menambahkan `?order_id=…` sendiri.
- Test integration: origin di allowlist dipakai di request Snap (fake Midtrans menyimpan request), origin lain diabaikan. Dokumentasikan di `docs/openapi.yaml` (test `TestOpenAPICoversRoutes` tetap hijau) dan `API_PLAN.md` §5.27 (sinkronkan salinan di repo iOS).

## 5. Urutan kerja (setiap langkah: kode + test + `npm run check` hijau)

1. **Backend §4**: `finish_url` + `WEB_FINISH_ORIGINS` + test + Swagger. `make lint && make test` di `trytuist-api`.
2. **Kerangka `storefront/`**: package.json (versi sama dengan admin), Tailwind/tema (salin token warna admin), ESLint layer, Vitest, layout mobile-first (header outlet + ikon keranjang, bottom nav: Beranda · Menu · Pesanan · Akun).
3. **Auth BFF**: login/daftar/logout + refresh otomatis + `proxy.ts` (halaman keranjang/pesanan/akun wajib login; menu boleh tanpa login).
4. **Katalog**: pilih outlet, Beranda, Menu, Detail (varian, combo, catatan, jumlah 1–20 dari `app-config.order_rules`).
5. **Keranjang + checkout**: quote (debounce 300 ms, versi request terakhir menang), alamat, metode bayar, kupon gratis ongkir, COD, Bayar Online + halaman `/bayar/[id]`.
6. **Pesanan**: daftar, detail (batal, pesan lagi, refund, struk print), rating.
7. **Akun**: profil, alamat CRUD, logout.
8. Dokumentasi: `storefront/README.md` (cara jalan: `cd storefront && npm i && npm run dev`), update `WEBPLAN.md` (§13 roadmap) & `API_PLAN.md` (§10 roadmap: "Web pembeli (storefront)").

## 6. Definition of done

- `cd storefront && npm run check` (typecheck + lint + test) dan `npm run build` hijau. `trytuist-api`: `make lint && make test` hijau.
- Alur manual di dev (API lokal + akun demo `kholis@gmail.com / 12345678`): pilih outlet → tambah 2 menu (1 combo) → keranjang menampilkan ongkir & ETA dari server → checkout COD → pesanan muncul di `/pesanan` dan di web admin.
- Tidak ada `X-API-Key` / token di bundle browser (`grep` hasil build).
- Commit terpisah per repo dengan pesan jelas, lalu push ke `main` (cara kerja repo ini).

## 7. Di luar cakupan v1

Google Sign-In, push notification web, PWA/offline, hapus akun, deeplink QR outlet, multi-bahasa, deploy storefront (nanti ditambahkan ke `deploy/` di repo API seperti web admin).
