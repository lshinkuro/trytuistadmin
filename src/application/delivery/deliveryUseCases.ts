import {
  validateDeliverySettings,
  type DeliveryPreviewInput,
  type DeliveryRepository,
  type DeliverySettings,
} from "@/domain/delivery/DeliverySettings";
import { ValidationError } from "@/domain/shared/errors";

export function makeGetDeliverySettings(repo: DeliveryRepository) {
  return () => repo.get();
}

/** Draf tidak valid tidak dikirim ke server (UI menampilkan error field-nya). */
export function makePreviewDeliverySettings(repo: DeliveryRepository) {
  return (input: DeliveryPreviewInput) => {
    if (Object.keys(validateDeliverySettings(input.settings)).length > 0) return Promise.resolve(null);
    return repo.preview(input);
  };
}

export function makeSaveDeliverySettings(repo: DeliveryRepository) {
  return (settings: DeliverySettings) => {
    const errors = validateDeliverySettings(settings);
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi aturan ongkir.", errors);
    return repo.save(settings);
  };
}
