import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/domain/shared/errors";
import type { StaffRepository } from "@/domain/staff/Staff";
import { makeCreateStaff, validateStaff } from "./staffUseCases";

describe("staff", () => {
  it("admin outlet wajib outlet; password minimal 8", () => {
    const e = validateStaff({ name: " ", email: "x@", password: "123", role: "OUTLET_ADMIN", storeId: "" });
    expect(Object.keys(e).sort()).toEqual(["email", "name", "password", "storeId"]);
    expect(validateStaff({ name: "Gading", email: "g@trytuist.com", password: "gading123", role: "SUPER_ADMIN", storeId: "" })).toEqual({});
  });

  it("tidak memanggil server bila data salah", () => {
    const repo = { create: vi.fn() } as unknown as StaffRepository;
    expect(() => makeCreateStaff(repo)({ name: "A", email: "a@b.co", password: "short", role: "OUTLET_ADMIN", storeId: "ST01" })).toThrow(
      ValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });
});
