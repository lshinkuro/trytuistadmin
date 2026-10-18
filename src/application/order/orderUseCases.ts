import type { OrderFilter, StatusChange } from "@/domain/order/Order";
import type { OrderRepository } from "@/domain/order/OrderRepository";
import { ORDER_STATUS_LABEL, requiresNote, STATUS_NOTE_MAX } from "@/domain/order/orderStatus";
import { validateDateRange } from "@/domain/shared/dateRange";
import { ValidationError } from "@/domain/shared/errors";

export function makeListOrders(repo: OrderRepository) {
  return (filter: OrderFilter) => {
    if (filter.range) {
      const error = validateDateRange(filter.range);
      if (error) throw new ValidationError(error, { range: error });
    }
    return repo.list({ ...filter, query: filter.query.trim() });
  };
}

export function makeGetOrder(repo: OrderRepository) {
  return (id: string) => repo.get(id);
}

/** Ubah status pesanan; gagal/batal wajib beri alasan (aturan sama dengan backend). */
export function makeChangeOrderStatus(repo: OrderRepository) {
  return (change: StatusChange) => {
    const note = change.note.trim();
    if (requiresNote(change.status) && note === "") {
      throw new ValidationError(`Tulis alasan pesanan ${ORDER_STATUS_LABEL[change.status].toLowerCase()}.`, {
        note: "Alasan wajib diisi",
      });
    }
    if (note.length > STATUS_NOTE_MAX) {
      throw new ValidationError("Alasan terlalu panjang.", { note: `Maksimal ${STATUS_NOTE_MAX} karakter` });
    }
    return repo.changeStatus({ ...change, note });
  };
}
