import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const inputVariants = cva(
  "w-full rounded-control border bg-surface text-ink placeholder:text-ink-faint transition-colors focus-visible:outline-2 focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      size: { sm: "h-8 px-2.5 text-[0.8125rem]", md: "h-10 px-3 text-sm" },
      invalid: { true: "border-danger", false: "border-line-strong hover:border-ink-faint" },
    },
    defaultVariants: { size: "md", invalid: false },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, size, invalid, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(inputVariants({ size, invalid }), className)}
    {...props}
  />
));
Input.displayName = "Input";
