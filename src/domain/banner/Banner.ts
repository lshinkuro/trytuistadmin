// Banner Beranda aplikasi + aksi saat di-tap (API_PLAN §5.27 / migrasi 0015).

export const BANNER_ACTIONS = ["NONE", "PRODUCT", "CATEGORY", "FREE_DELIVERY"] as const;
export type BannerActionType = (typeof BANNER_ACTIONS)[number];

export const BANNER_ACTION_LABEL: Record<BannerActionType, string> = {
  NONE: "Tidak ada (hanya gambar)",
  PRODUCT: "Buka menu",
  CATEGORY: "Buka kategori",
  FREE_DELIVERY: "Info kupon gratis ongkir",
};

/** LIVE = tampil di app. HIDDEN = dalam periode tapi tujuannya tidak berlaku (mis. kupon dimatikan). */
export type BannerStatus = "LIVE" | "SCHEDULED" | "ENDED" | "INACTIVE" | "HIDDEN";

export const BANNER_STATUS_LABEL: Record<BannerStatus, string> = {
  LIVE: "Tampil",
  SCHEDULED: "Terjadwal",
  ENDED: "Berakhir",
  INACTIVE: "Nonaktif",
  HIDDEN: "Disembunyikan",
};

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  actionType: BannerActionType;
  actionValue: string | null;
  /** Nama menu / kategori tujuan. */
  actionLabel: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  sortOrder: number;
  isActive: boolean;
  status: BannerStatus;
}

export interface BannerInput {
  title: string;
  subtitle: string;
  imageUrl: string;
  actionType: BannerActionType;
  actionValue: string | null;
  /** null = tanpa batas. */
  startsAt: Date | null;
  endsAt: Date | null;
  sortOrder: number;
  isActive: boolean;
}

export const needsTarget = (type: BannerActionType) => type === "PRODUCT" || type === "CATEGORY";

export interface BannerRepository {
  list(): Promise<Banner[]>;
  create(input: BannerInput): Promise<Banner>;
  update(id: string, input: Partial<BannerInput>): Promise<Banner>;
  remove(id: string): Promise<void>;
}
