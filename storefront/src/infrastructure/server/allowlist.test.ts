import { describe, expect, it } from "vitest";
import { isAllowed } from "./allowlist";

describe("allowlist BFF storefront", () => {
  it("katalog publik hanya GET", () => {
    expect(isAllowed("GET", "v1/products")).toBe(true);
    expect(isAllowed("GET", "v1/products/C01")).toBe(true);
    expect(isAllowed("GET", "v1/stores")).toBe(true);
    expect(isAllowed("POST", "v1/products")).toBe(false);
  });

  it("endpoint pembeli diizinkan", () => {
    expect(isAllowed("POST", "v1/orders/quote")).toBe(true);
    expect(isAllowed("POST", "v1/checkout")).toBe(true);
    expect(isAllowed("GET", "v1/payments/6c2f-1")).toBe(true);
    expect(isAllowed("POST", "v1/orders/abc/cancel")).toBe(true);
    expect(isAllowed("PATCH", "v1/me/addresses/abc")).toBe(true);
  });

  it("admin, dev, auth, device & webhook ditolak", () => {
    expect(isAllowed("GET", "v1/admin/orders")).toBe(false);
    expect(isAllowed("POST", "v1/dev/orders/x/status")).toBe(false);
    expect(isAllowed("POST", "v1/auth/login")).toBe(false);
    expect(isAllowed("PUT", "v1/me/devices")).toBe(false);
    expect(isAllowed("POST", "v1/payments/midtrans/notification")).toBe(false);
  });

  it("path aneh ditolak", () => {
    expect(isAllowed("GET", "v1/products/../admin/orders")).toBe(false);
    expect(isAllowed("GET", "v1//admin")).toBe(false);
  });
});
