import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-[0.8125rem] font-semibold text-ink", className)} {...props} />
));
Label.displayName = "Label";
