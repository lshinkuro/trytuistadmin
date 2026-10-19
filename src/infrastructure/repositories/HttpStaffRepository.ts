import type { Staff, StaffInput, StaffRepository, StaffUpdate } from "@/domain/staff/Staff";
import type { HttpClient } from "../http/httpClient";

interface StaffDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  store_id: string | null;
  store_name: string | null;
  created_at: string;
}

const toStaff = (d: StaffDTO): Staff => ({
  id: d.id,
  name: d.name,
  email: d.email,
  role: d.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "OUTLET_ADMIN",
  store: d.store_id ? { id: d.store_id, name: d.store_name ?? d.store_id } : null,
  createdAt: new Date(d.created_at),
});

export class HttpStaffRepository implements StaffRepository {
  constructor(private readonly http: HttpClient) {}

  async list() {
    const res = await this.http.get<StaffDTO[]>("/v1/admin/staff");
    return res.data.map(toStaff);
  }

  async create(input: StaffInput) {
    const res = await this.http.post<StaffDTO>("/v1/admin/staff", {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      store_id: input.role === "OUTLET_ADMIN" ? input.storeId : "",
    });
    return toStaff(res.data);
  }

  async update(id: string, input: StaffUpdate) {
    const res = await this.http.patch<StaffDTO>(`/v1/admin/staff/${encodeURIComponent(id)}`, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.password !== undefined ? { password: input.password } : {}),
      ...(input.revoke ? { role: "CUSTOMER" } : input.role !== undefined ? { role: input.role } : {}),
      ...(input.storeId !== undefined ? { store_id: input.storeId } : {}),
    });
    return toStaff(res.data);
  }
}
