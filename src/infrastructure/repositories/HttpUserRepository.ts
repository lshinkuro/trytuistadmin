import type { UserFilter, UserRepository } from "@/domain/user/User";
import type { UserDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toUser } from "../mappers/mappers";

export class HttpUserRepository implements UserRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filter: UserFilter) {
    const res = await this.http.get<UserDTO[]>("/v1/admin/customers", {
      q: filter.query,
      page: filter.page,
      limit: filter.limit,
    });
    return {
      items: res.data.map(toUser),
      page: res.meta?.page ?? filter.page,
      limit: res.meta?.limit ?? filter.limit,
      total: res.meta?.total ?? res.data.length,
    };
  }
}
