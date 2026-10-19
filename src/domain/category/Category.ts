/** Kategori menu di web admin (§5.29): termasuk yang disembunyikan. Hanya super admin yang mengubah. */
export interface AdminCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export interface CategoryInput {
  name: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryRepository {
  list(): Promise<AdminCategory[]>;
  create(input: CategoryInput): Promise<AdminCategory>;
  update(id: string, input: Partial<CategoryInput>): Promise<AdminCategory>;
}
