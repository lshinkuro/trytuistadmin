import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-lg font-bold">Halaman tidak ditemukan</p>
      <Link href="/" className="font-semibold text-brand">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
