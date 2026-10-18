import type { StoreInput, StoreRepository } from "@/domain/store/Store";
import type { AdminStoreDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toStore, toStoreBody } from "../mappers/mappers";

export class HttpStoreRepository implements StoreRepository {
  constructor(private readonly http: HttpClient) {}

  async list() {
    const res = await this.http.get<AdminStoreDTO[]>("/v1/admin/stores");
    return res.data.map(toStore);
  }

  async create(input: StoreInput) {
    const res = await this.http.post<AdminStoreDTO>("/v1/admin/stores", toStoreBody(input));
    return toStore(res.data);
  }

  async update(id: string, input: Partial<StoreInput>) {
    const res = await this.http.patch<AdminStoreDTO>(`/v1/admin/stores/${encodeURIComponent(id)}`, toStoreBody(input));
    return toStore(res.data);
  }

  async setProductAvailability(storeId: string, productId: string, isAvailable: boolean) {
    await this.http.put(
      `/v1/admin/stores/${encodeURIComponent(storeId)}/products/${encodeURIComponent(productId)}`,
      { is_available: isAvailable },
    );
  }
}
