# TryTuist Storefront (web pembeli)

Web untuk pembeli: pilih outlet, lihat menu & paket combo, keranjang dengan harga dari server (ongkir per jarak, kupon gratis ongkir), checkout COD / Bayar Online Midtrans, dan riwayat pesanan. Spesifikasi: [`../STOREFRONT_PLAN.md`](../STOREFRONT_PLAN.md).

Aplikasi Next.js terpisah dari web admin (`../src`); tidak ada import lintas folder.

## Jalankan

Butuh backend `trytuist-api` berjalan (default `http://localhost:8080`).

```bash
cd storefront
cp .env.example .env.local   # isi TRYTUIST_API_KEY = salah satu API_KEYS backend
npm install
npm run dev                  # http://localhost:3001
```

Akun demo: `kholis@gmail.com / 12345678`.

| Perintah | Fungsi |
|---|---|
| `npm run check` | typecheck + lint (aturan layer) + test |
| `npm run build` / `npm start` | build & jalankan produksi (port 3001) |

## Cara kerja

- **BFF**: browser hanya memanggil `/api/*` milik storefront. `/api/backend/*` meneruskan ke backend dengan `X-API-Key` + token dari cookie httpOnly (`tt_shop_*`), refresh otomatis saat 401. Hanya endpoint pembeli yang diizinkan (`src/infrastructure/server/allowlist.ts`, ada test-nya); `/v1/admin/*` & `/v1/dev/*` ditolak. Request yang mengubah data dicek `Origin`.
- **Keranjang & outlet** disimpan di localStorage. Harga yang ditampilkan & dibayar selalu dari `POST /v1/orders/quote` / `POST /v1/checkout`. Checkout memakai `Idempotency-Key` yang sama selama isi pesanan tidak berubah.
- **Bayar Online**: halaman Midtrans dibuka di tab baru, `/bayar/[id]` polling `GET /v1/payments/{id}` sampai lunas lalu membuka pesanan. Tidak butuh perubahan backend.
- Halaman `/keranjang`, `/pesanan`, `/akun`, `/bayar` wajib login (`src/proxy.ts`); menu bisa dilihat tamu.
- Struk: tombol "Struk" di detail pesanan mencetak halaman (`window.print()`, elemen navigasi disembunyikan).
