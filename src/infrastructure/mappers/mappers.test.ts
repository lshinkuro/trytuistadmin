import { describe, expect, it } from "vitest";
import { camel, toAppError } from "../http/httpClient";
import { toDealBody, toProductBody, toStatus } from "./mappers";

describe("mappers", () => {
  it("status tak dikenal tidak membuat UI crash", () => {
    expect(toStatus("FAILED")).toBe("FAILED");
    expect(toStatus("SOMETHING_NEW")).toBe("PENDING");
  });

  it("body promo hanya berisi field yang diubah (snake_case)", () => {
    expect(toDealBody({ isActive: false })).toEqual({ is_active: false });
    expect(toDealBody({ dealPrice: 15000, productId: "P01" })).toEqual({ deal_price: 15000, product_id: "P01" });
  });

  it("error backend → AppError dengan field camelCase", () => {
    const err = toAppError(422, {
      message: "Harga promo harus lebih murah",
      error: { type: "DEAL_PRICE_TOO_HIGH", details: [{ field: "deal_price", message: "harus < Rp 23.000" }] },
    });
    expect(err.type).toBe("DEAL_PRICE_TOO_HIGH");
    expect(err.fieldErrors.dealPrice).toBe("harus < Rp 23.000");
    expect(toAppError(0, null).type).toBe("NETWORK_ERROR");
  });

  it("body menu: varian tanpa id dikirim tanpa id", () => {
    expect(toProductBody({ name: "Es Teh", options: [{ name: "Regular", extraPrice: 0 }, { id: "large", name: "Large", extraPrice: 5000 }] })).toEqual({
      product_name: "Es Teh",
      options: [{ name: "Regular", extra_price: 0 }, { id: "large", name: "Large", extra_price: 5000 }],
    });
  });

  it("field error backend dipetakan ke kunci form", () => {
    expect(camel("options[1].extra_price")).toBe("options.1.extraPrice");
    expect(camel("product_name")).toBe("name");
    expect(camel("deal_price")).toBe("dealPrice");
  });
});
