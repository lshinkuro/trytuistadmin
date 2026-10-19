import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Gabungkan class Tailwind: `clsx` untuk kondisi, `twMerge` supaya class yang bentrok
 * (mis. `px-2` dari variant dan `px-4` dari pemanggil) diselesaikan oleh yang terakhir.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
