import type { BannerRepository } from "@/domain/banner/Banner";
import type { AdminBannerDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toBanner, toBannerBody } from "../mappers/mappers";

export class HttpBannerRepository implements BannerRepository {
  constructor(private readonly http: HttpClient) {}

  async list() {
    const res = await this.http.get<AdminBannerDTO[]>("/v1/admin/banners");
    return res.data.map(toBanner);
  }

  async create(input: Parameters<BannerRepository["create"]>[0]) {
    const res = await this.http.post<AdminBannerDTO>("/v1/admin/banners", toBannerBody(input));
    return toBanner(res.data);
  }

  async update(id: string, input: Parameters<BannerRepository["update"]>[1]) {
    const res = await this.http.patch<AdminBannerDTO>(`/v1/admin/banners/${encodeURIComponent(id)}`, toBannerBody(input));
    return toBanner(res.data);
  }

  async remove(id: string) {
    await this.http.delete(`/v1/admin/banners/${encodeURIComponent(id)}`);
  }
}
