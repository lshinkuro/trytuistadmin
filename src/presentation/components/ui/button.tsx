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
