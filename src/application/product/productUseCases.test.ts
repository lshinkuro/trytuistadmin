import { describe, expect, it, vi } from "vitest";
import type { ProductInput } from "@/domain/product/Product";
import type { ProductRepository } from "@/domain/product/ProductRepository";
import { ValidationError } from "@/domain/shared/errors";
import { makeCreateProduct, validateProduct } from "./productUseCases";

const valid: ProductInput = {
  categoryId: "non_coffee",
  name: "Es Teh Manis",
  description: "",
  price: 8000,
  imageUrl: "",
  isAvailable: true,
  isBestSeller: false,
  options: [
    { name: "Regular", extraPrice: 0 },
    { name: "Porsi Jumbo", extraPrice: 3000 },
  ],
};

describe("validateProduct", () => {
  it("menu lengkap valid", () => {
    expect(validateProduct(valid)).toEqual({});
  });

  it("wajib nama, kategori; harga & foto dicek", () => {
    const errors = validateProduct({ ...valid, name: " ", categoryId: "", price: -1, imageUrl: "http://x" });
    expect(Object.keys(errors).sort()).toEqual(["categoryId", "imageUrl", "name", "price"]);
  });

  it("nama varian wajib & tidak boleh sama (tanpa beda huruf besar)", () => {
    const errors = validateProduct({ options: [{ name: "Regular", extraPrice: 0 }, { name: "regular", extraPrice: 0 }, { name: "", extraPrice: 0 }] });
    expect(errors["options.1.name"]).toBeDefined();
    expect(errors["options.2.name"]).toBeDefined();
  });

  it("harga kosong ditolak", () => {
    expect(validateProduct({ ...valid, price: Number.NaN }).price).toBe("Harga wajib diisi");
  });

  it("ubah sebagian hanya mengecek field yang dikirim", () => {
    expect(validateProduct({ price: 9000 })).toEqual({});
  });
});

describe("createProduct", () => {
  it("merapikan teks sebelum dikirim & menolak data tidak valid", async () => {
    const repo = { create: vi.fn(async () => ({}) as never) } as unknown as ProductRepository;
    const create = makeCreateProduct(repo);
    expect(() => create({ ...valid, name: "" })).toThrow(ValidationError);
    await create({ ...valid, name: "  Es Teh  ", options: [{ name: " Regular ", extraPrice: 0 }] });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ name: "Es Teh", options: [{ name: "Regular", extraPrice: 0 }] }));
  });
});
