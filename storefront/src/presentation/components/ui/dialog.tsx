"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Memakai <dialog> native: fokus terkunci di dalam, Esc menutup, dan sisa halaman inert
 * tanpa library tambahan.
 */
export function Dialog({ open, onClose, title, description, children, footer, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose(); // klik backdrop
      }}
      aria-labelledby={titleId}
      className={cn(
        "m-auto w-[min(32rem,calc(100vw-2rem))] rounded-panel border border-line bg-surface p-0 text-ink shadow-2xl",
        className,
      )}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3">
            <div className="flex flex-col gap-1">
              <h2 id={titleId} className="text-base font-bold">
                {title}
              </h2>
              {description && <div className="text-sm text-ink-muted">{description}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-control p-1 text-ink-muted hover:bg-neutral-soft hover:text-ink"
              aria-label="Tutup"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 pb-5">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
