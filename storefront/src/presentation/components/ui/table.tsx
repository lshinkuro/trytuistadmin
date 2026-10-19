import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

/** Tabel dibungkus area scroll horizontal supaya aman di layar sempit. */
export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table ref={ref} className={cn("w-full border-collapse text-sm", className)} {...props} />
  </div>
));
Table.displayName = "Table";

export const THead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("border-b border-line", className)} {...props} />,
);
THead.displayName = "THead";

export const TBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn("divide-y divide-line", className)} {...props} />,
);
TBody.displayName = "TBody";

export const TR = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("transition-colors", className)} {...props} />
));
TR.displayName = "TR";

export const TH = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    scope="col"
    className={cn("px-4 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-ink-muted", className)}
    {...props}
  />
));
TH.displayName = "TH";

export const TD = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-4 py-3 align-middle", className)} {...props} />
));
TD.displayName = "TD";
