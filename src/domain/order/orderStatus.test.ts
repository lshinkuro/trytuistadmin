import { describe, expect, it } from "vitest";
import { canAdminTransition, isFinal, requiresNote } from "./orderStatus";

// Harus sama dengan order.CanAdminTransition di backend (TestAdmin).
describe("canAdminTransition", () => {
  it("boleh maju sesuai alur, termasuk melompat ke Sukses", () => {
    expect(canAdminTransition("PENDING", "PAID")).toBe(true);
    expect(canAdminTransition("PENDING", "COMPLETED")).toBe(true);
    expect(canAdminTransition("PROCESSING", "DELIVERING")).toBe(true);
  });

  it("tidak boleh mundur atau tetap", () => {
    expect(canAdminTransition("DELIVERING", "PROCESSING")).toBe(false);
    expect(canAdminTransition("PAID", "PAID")).toBe(false);
  });

  it("gagal & batal boleh selama belum selesai", () => {
    expect(canAdminTransition("DELIVERING", "FAILED")).toBe(true);
    expect(canAdminTransition("PENDING", "CANCELLED")).toBe(true);
  });

  it("status akhir terkunci", () => {
    for (const from of ["COMPLETED", "FAILED", "CANCELLED"] as const) {
      expect(isFinal(from)).toBe(true);
      expect(canAdminTransition(from, "COMPLETED")).toBe(false);
      expect(canAdminTransition(from, "FAILED")).toBe(false);
    }
  });

  it("gagal & batal wajib alasan", () => {
    expect(requiresNote("FAILED")).toBe(true);
    expect(requiresNote("CANCELLED")).toBe(true);
    expect(requiresNote("COMPLETED")).toBe(false);
  });
});
