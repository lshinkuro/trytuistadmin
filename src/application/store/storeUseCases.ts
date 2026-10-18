import type { FieldErrors } from "@/domain/shared/errors";
import { ValidationError } from "@/domain/shared/errors";
import { isClock, MAX_RADIUS_KM, type StoreInput, type StoreRepository } from "@/domain/store/Store";

/** Aturan sama dengan backend (POST/PATCH /v1/admin/stores). Hanya field yang ada yang dicek. */
export function validateStore(input: Partial<StoreInput>): FieldErrors {
  const errors: FieldErrors = {};
  if (input.name !== undefined && !input.name.trim()) errors.name = "Nama outlet wajib diisi";
  if (input.address !== undefined && !input.address.trim()) errors.address = "Alamat wajib diisi";
  if (input.lat !== undefined && (Number.isNaN(input.lat) || input.lat < -90 || input.lat > 90)) errors.lat = "Latitude -90 s.d. 90";
  if (input.lng !== undefined && (Number.isNaN(input.lng) || input.lng < -180 || input.lng > 180)) errors.lng = "Longitude -180 s.d. 180";
  if (input.opensAt !== undefined && !isClock(input.opensAt)) errors.opensAt = "Format jam HH:MM";
  if (input.closesAt !== undefined && !isClock(input.closesAt)) errors.closesAt = "Format jam HH:MM";
  if (input.deliveryRadiusKm !== undefined) {
    const r = input.deliveryRadiusKm;
    if (Number.isNaN(r) || r <= 0 || r > MAX_RADIUS_KM) errors.deliveryRadiusKm = `Jangkauan 0,1 – ${MAX_RADIUS_KM} km`;
  }
  return errors;
}

export function makeListStores(repo: StoreRepository) {
  return () => repo.list();
}

export function makeSaveStore(repo: StoreRepository) {
  return ({ id, input }: { id?: string; input: Partial<StoreInput> }) => {
    const errors = validateStore(input);
    if (!id) {
      for (const key of ["name", "address", "lat", "lng"] as const) {
        if (input[key] === undefined) errors[key] = "Wajib diisi";
      }
    }
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi data outlet.", errors);
    const clean = {
      ...input,
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.address !== undefined ? { address: input.address.trim() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
    };
    return id ? repo.update(id, clean) : repo.create(clean as StoreInput);
  };
}

/** Tutup sementara / buka kembali (mis. dapur penuh, listrik padam). */
export function makeSetStoreTempClosed(repo: StoreRepository) {
  return ({ id, closed }: { id: string; closed: boolean }) => repo.update(id, { isTemporarilyClosed: closed });
}

export function makeSetStoreStock(repo: StoreRepository) {
  return ({ storeId, productId, isAvailable }: { storeId: string; productId: string; isAvailable: boolean }) =>
    repo.setProductAvailability(storeId, productId, isAvailable);
}
