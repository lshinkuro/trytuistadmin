import type { AdminUser, AuthRepository, Credentials } from "@/domain/auth/Auth";
import type { AdminMeDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";

/**
 * `auth` → Route Handler Next.js (/api/auth/*) yang memanggil POST /v1/auth/login backend
 * lalu menyimpan token di cookie httpOnly. `backend` → /api/backend (proxy).
 */
export class HttpAuthRepository implements AuthRepository {
  constructor(
    private readonly auth: HttpClient,
    private readonly backend: HttpClient,
  ) {}

  async login(credentials: Credentials): Promise<AdminUser> {
    const res = await this.auth.post<AdminMeDTO>("/login", credentials);
    return { id: res.data.id, name: res.data.name, email: res.data.email };
  }

  async logout() {
    await this.auth.post("/logout");
  }

  async currentAdmin(): Promise<AdminUser> {
    const res = await this.backend.get<AdminMeDTO>("/v1/admin/me");
    return { id: res.data.id, name: res.data.name, email: res.data.email };
  }
}
