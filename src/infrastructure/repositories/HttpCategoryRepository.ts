import type { AdminCategory, CategoryInput, CategoryRepository } from "@/domain/category/Category";
import type { HttpClient } from "../http/httpClient";

interface AdminCategoryDTO {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

const toCategory = (d: AdminCategoryDTO): AdminCategory => ({
  id: d.id,
  name: d.name,
  icon: d.icon,
  sortOrder: d.sort_order,
  isActive: d.is_active,
  productCount: d.product_count,
});

const toBody = (i: Partial<CategoryInput>) => ({
  ...(i.name !== undefined ? { name: i.name } : {}),
  ...(i.icon !== undefined ? { icon: i.icon } : {}),
  ...(i.sortOrder !== undefined ? { sort_order: i.sortOrder } : {}),
  ...(i.isActive !== undefined ? { is_active: i.isActive } : {}),
});

export class HttpCategoryRepository implements CategoryRepository {
  constructor(private readonly http: HttpClient) {}

  async list() {
    const res = await this.http.get<AdminCategoryDTO[]>("/v1/admin/categories");
    return res.data.map(toCategory);
  }

  async create(input: CategoryInput) {
    const res = await this.http.post<AdminCategoryDTO>("/v1/admin/categories", toBody(input));
    return toCategory(res.data);
  }

  async update(id: string, input: Partial<CategoryInput>) {
    const res = await this.http.patch<AdminCategoryDTO>(`/v1/admin/categories/${encodeURIComponent(id)}`, toBody(input));
    return toCategory(res.data);
  }
}
