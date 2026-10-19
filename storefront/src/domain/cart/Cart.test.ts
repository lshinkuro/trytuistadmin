import { describe, expect, it } from "vitest";
import { DEFAULT_ORDER_RULES as rules } from "@/domain/catalog/Catalog";
import { addItem, itemCount, lineKey, setQuantity, type CartItem } from "./Cart";

const kopi: CartItem = { productId: "P01", optionId: "large", name: "Kopi", optionName: "Large", imageUrl: "", unitPrice: 27000, quantity: 1, note: "" };

describe("keranjang", () => {
  it("produk + varian + catatan sama digabung", () => {
    const items = addItem(addItem([], kopi, rules), { ...kopi, quantity: 2 }, rules);
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(3);
  });

  it("catatan berbeda = baris berbeda", () => {
    expect(addItem([kopi], { ...kopi, note: "less sugar" }, rules)).toHaveLength(2);
  });

  it("jumlah dibatasi maks. aturan server", () => {
    expect(addItem([{ ...kopi, quantity: 19 }], { ...kopi, quantity: 5 }, rules)[0]?.quantity).toBe(20);
  });

  it("jumlah 0 menghapus baris", () => {
    expect(setQuantity([kopi], lineKey(kopi), 0, rules)).toHaveLength(0);
    expect(itemCount(setQuantity([kopi], lineKey(kopi), 4, rules))).toBe(4);
  });
});
