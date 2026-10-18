import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/presentation/features/auth/LoginForm";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,32rem)]">
      <div aria-hidden className="relative hidden overflow-hidden bg-brand lg:block">
        {/* Rel status sebagai ilustrasi: pesanan berjalan dari dapur ke pelanggan. */}
        <svg viewBox="0 0 600 600" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          <g fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="10" strokeLinecap="round">
            <path d="M-20 440 C 120 440, 170 300, 300 300 S 460 170, 620 170" />
          </g>
          {[
            [60, 438],
            [190, 360],
            [300, 300],
            [410, 238],
            [510, 194],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 4 ? 26 : 18} fill={i === 4 ? "#fff" : "rgb(255 255 255 / 0.35)"} />
          ))}
        </svg>
        <div className="absolute bottom-12 left-12 max-w-sm text-white">
          <p className="text-3xl leading-tight font-extrabold tracking-tight">Dari dapur sampai di tangan pelanggan.</p>
          <p className="mt-3 text-sm text-white/80">Pantau pesanan, atur harga, dan jalankan promo outlet TryTuist.</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-surface px-6 py-12">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
