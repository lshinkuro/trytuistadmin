import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-xl font-extrabold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-ink-muted">Alamatnya mungkin salah atau datanya sudah dihapus.</p>
      <Link href="/" className="text-sm font-semibold text-brand hover:underline">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
