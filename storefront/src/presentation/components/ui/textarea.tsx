import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      "min-h-20 w-full rounded-control border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-offset-0",
      invalid ? "border-danger" : "border-line-strong hover:border-ink-faint",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
