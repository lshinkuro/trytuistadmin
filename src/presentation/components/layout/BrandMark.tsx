import { cn } from "@/shared/lib/cn";

/** Logo kecil: piring + uap (bukan logo app iOS, hanya penanda web admin). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-brand" />
        <path d="M8 19h16a8 8 0 0 1-16 0Z" className="fill-brand-ink" />
        <path d="M13 9c-1.2 1.4 1.2 2.6 0 4.2M18 8c-1.2 1.4 1.2 2.6 0 4.2" className="stroke-brand-ink" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[0.9375rem] font-extrabold tracking-tight text-ink">TryTuist</span>
        <span className="text-xs text-ink-muted">Admin outlet</span>
      </span>
    </span>
  );
}
