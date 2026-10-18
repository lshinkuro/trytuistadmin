export type DealStatus = "ACTIVE" | "SCHEDULED" | "EXPIRED" | "INACTIVE";

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  ACTIVE: "Berjalan",
  SCHEDULED: "Terjadwal",
  EXPIRED: "Selesai",
  INACTIVE: "Nonaktif",
};

export interface Deal {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string | null;
  dealPrice: number;
  discountPercent: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  showAsPopup: boolean;
  sortOrder: number;
  status: DealStatus;
}

export interface DealInput {
  productId: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  dealPrice: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  showAsPopup: boolean;
  sortOrder: number;
}

/** Dibulatkan ke bawah, sama dengan backend & app iOS: 32.000 → 19.900 = 37%. */
export function discountPercent(normalPrice: number, dealPrice: number): number {
  if (normalPrice <= 0 || dealPrice >= normalPrice) return 0;
  return Math.floor(((normalPrice - dealPrice) * 100) / normalPrice);
}
