import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a929c' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

/** Select native (aksesibel & ringan) dengan gaya yang sama dengan Input. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  ({ className, invalid, children, style, ...props }, ref) => (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full appearance-none rounded-control border bg-surface bg-[length:16px] bg-[right_0.6rem_center] bg-no-repeat pr-9 pl-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-0",
        invalid ? "border-danger" : "border-line-strong hover:border-ink-faint",
        className,
      )}
      style={{ backgroundImage: CHEVRON, ...style }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
