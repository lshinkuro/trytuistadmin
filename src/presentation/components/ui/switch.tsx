import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label: string;
  /** Sembunyikan label secara visual (tetap dibaca screen reader). */
  hideLabel?: boolean;
}

/** Checkbox native bergaya switch (role="switch"). */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ className, label, hideLabel, ...props }, ref) => (
  <label className={cn("inline-flex cursor-pointer items-center gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-60", className)}>
    <input ref={ref} type="checkbox" role="switch" className="peer sr-only" {...props} />
    <span
      aria-hidden
      className="relative h-5 w-9 rounded-full bg-line-strong transition-colors peer-checked:bg-success peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4"
    />
    <span className={cn(hideLabel && "sr-only")}>{label}</span>
  </label>
));
Switch.displayName = "Switch";
