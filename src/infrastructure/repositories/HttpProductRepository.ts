import type { ProductFilter, ProductInput, ProductUpdate } from "@/domain/product/Product";
import type { ProductRepository } from "@/domain/product/ProductRepository";
import type { AdminProductDTO, CategoryDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toCategory, toProduct, toProductBody } from "../mappers/mappers";

export class HttpProductRepository implements ProductRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filter: ProductFilter) {
    const res = await this.http.get<AdminProductDTO[]>("/v1/admin/products", {
      q: filter.query,
      category_id: filter.categoryId,
      available: filter.availability === "all" ? undefined : filter.availability === "available",
      store_id: filter.storeId,
    });
    return res.data.map(toProduct);
  }

  async create(input: ProductInput) {
    const res = await this.http.post<AdminProductDTO>("/v1/admin/products", toProductBody(input));
    return toProduct(res.data);
  }

  async update({ id, ...changes }: ProductUpdate) {
    const res = await this.http.patch<AdminProductDTO>(`/v1/admin/products/${encodeURIComponent(id)}`, toProductBody(changes));
    return toProduct(res.data);
  }

  async categories() {
    const res = await this.http.get<CategoryDTO[]>("/v1/categories");
    return res.data.map(toCategory);
  }
}
