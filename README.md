# TryTuist Admin

Web admin TryTuist (Next.js 16): pesanan (tandai sukses / gagal / batal), harga & stok produk, promo, pelanggan, aktivitas, serta dashboard penjualan & pembelian. Rencana lengkap, arsitektur, dan contoh kode ada di **[WEBPLAN.md](./WEBPLAN.md)**.

## Menjalankan

```bash
# Backend dulu (folder ../trytuist-api)
make migrate-up seed && make run        # http://localhost:8080

# Web admin
cp .env.example .env.local
npm install
npm run dev                             # http://localhost:3000
```

Akun dev: `admin@trytuist.com` / `admin12345`.

| Perintah | |
|---|---|
| `npm run dev` | Dev server (port 3000) |
| `npm run build && npm start` | Production |
| `npm run check` | Typecheck + lint (termasuk aturan batas layer) + unit test |

## Env (`.env.local`)

| Nama | Contoh | Keterangan |
|---|---|---|
| `TRYTUIST_API_URL` | `http://localhost:8080` | Backend Go, hanya dipanggil dari server Next.js |
| `TRYTUIST_API_KEY` | `dev-local-api-key` | Sama dengan salah satu `API_KEYS` backend |
| `COOKIE_SECURE` | `false` | Opsional. Default aktif di production; matikan hanya untuk akses http lewat IP/LAN |
