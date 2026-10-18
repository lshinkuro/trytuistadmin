import { useId, type ReactElement, type ReactNode } from "react";
import { cloneElement } from "react";
import { cn } from "@/shared/lib/cn";
import { Label } from "./label";

interface FieldProps {
  label: string;
  /** Pesan error; ditampilkan merah dan dihubungkan ke input lewat aria-describedby. */
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactElement<{ id?: string; invalid?: boolean; "aria-describedby"?: string }>;
}

/** Label + input + hint/error. Tetap presentational: tidak tahu asal datanya. */
export function Field({ label, error, hint, className, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        id,
        invalid: Boolean(error),
        "aria-describedby": error || hint ? messageId : undefined,
      })}
      {(error || hint) && (
        <p id={messageId} className={cn("text-[0.8125rem]", error ? "text-danger" : "text-ink-muted")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
