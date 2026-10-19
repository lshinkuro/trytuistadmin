import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("animate-pulse rounded-control bg-neutral-soft", className)} {...props} />;
}
