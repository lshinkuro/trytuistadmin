import type { DeliveryRepository } from "@/domain/delivery/DeliverySettings";
import type { DeliverySettingsResponseDTO } from "../dto/dtos";
import type { HttpClient } from "../http/httpClient";
import { toDeliveryOverview, toDeliverySettingsBody } from "../mappers/mappers";

export class HttpDeliveryRepository implements DeliveryRepository {
  constructor(private readonly http: HttpClient) {}

  async get() {
    const res = await this.http.get<DeliverySettingsResponseDTO>("/v1/admin/delivery-settings");
    return toDeliveryOverview(res.data);
  }

  async preview(input: Parameters<DeliveryRepository["preview"]>[0]) {
    const res = await this.http.post<DeliverySettingsResponseDTO>("/v1/admin/delivery-settings/preview", {
      ...toDeliverySettingsBody(input.settings),
      preview_subtotal: input.subtotal,
      ...(input.distances.length > 0 ? { preview_distances: input.distances } : {}),
    });
    return toDeliveryOverview(res.data);
  }

  async save(settings: Parameters<DeliveryRepository["save"]>[0]) {
    const res = await this.http.patch<DeliverySettingsResponseDTO>("/v1/admin/delivery-settings", toDeliverySettingsBody(settings));
    return toDeliveryOverview(res.data);
  }
}
