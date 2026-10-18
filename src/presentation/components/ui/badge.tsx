import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-neutral-soft text-ink-muted",
        brand: "bg-brand-soft text-brand",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        info: "bg-info-soft text-info",
      },
      dot: { true: "before:size-1.5 before:rounded-full before:bg-current", false: "" },
    },
    defaultVariants: { tone: "neutral", dot: false },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, tone, dot, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ tone, dot }), className)} {...props} />
));
Badge.displayName = "Badge";
