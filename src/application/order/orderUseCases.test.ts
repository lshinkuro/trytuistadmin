import { describe, expect, it, vi } from "vitest";
import type { OrderRepository } from "@/domain/order/OrderRepository";
import { ValidationError } from "@/domain/shared/errors";
import { makeChangeOrderStatus, makeListOrders } from "./orderUseCases";

function fakeRepo(): OrderRepository {
  return {
    list: vi.fn(async () => ({ items: [], page: 1, limit: 20, total: 0 })),
    get: vi.fn(),
    changeStatus: vi.fn(async () => ({}) as never),
  };
}

describe("changeOrderStatus", () => {
  it("gagal tanpa alasan ditolak sebelum memanggil server", () => {
    const repo = fakeRepo();
    const change = makeChangeOrderStatus(repo);
    expect(() => change({ orderId: "o1", status: "FAILED", note: "   " })).toThrow(ValidationError);
    expect(repo.changeStatus).not.toHaveBeenCalled();
  });

  it("alasan di-trim lalu dikirim", async () => {
    const repo = fakeRepo();
    await makeChangeOrderStatus(repo)({ orderId: "o1", status: "FAILED", note: "  Stok habis " });
    expect(repo.changeStatus).toHaveBeenCalledWith({ orderId: "o1", status: "FAILED", note: "Stok habis" });
  });

  it("sukses tidak butuh alasan", async () => {
    const repo = fakeRepo();
    await makeChangeOrderStatus(repo)({ orderId: "o1", status: "COMPLETED", note: "" });
    expect(repo.changeStatus).toHaveBeenCalled();
  });
});

describe("listOrders", () => {
  it("menolak rentang tanggal tidak valid", () => {
    const repo = fakeRepo();
    expect(() =>
      makeListOrders(repo)({ statuses: [], query: "", range: { from: "2026-10-18", to: "2026-10-01" }, page: 1, limit: 20 }),
    ).toThrow(ValidationError);
  });
});
