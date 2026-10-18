import { describe, expect, it } from "vitest";
import { daysInRange, validateDateRange } from "./dateRange";

describe("dateRange", () => {
  it("menghitung hari inklusif", () => {
    expect(daysInRange({ from: "2026-10-01", to: "2026-10-30" })).toBe(30);
    expect(daysInRange({ from: "2026-10-18", to: "2026-10-18" })).toBe(1);
  });

  it("menolak rentang terbalik, format salah, dan > 366 hari", () => {
    expect(validateDateRange({ from: "2026-10-18", to: "2026-10-01" })).not.toBeNull();
    expect(validateDateRange({ from: "18-10-2026", to: "2026-10-18" })).not.toBeNull();
    expect(validateDateRange({ from: "2025-01-01", to: "2026-10-18" })).not.toBeNull();
    expect(validateDateRange({ from: "2026-01-01", to: "2026-10-18" })).toBeNull();
  });
});
