import { describe, it, expect } from "vitest";
import { UserRole, ALL_ROLES, hasRole, hasAnyRole, isValidRole } from "@/modules/authorization/roles";
import { hasCapability, ROLE_CAPABILITIES } from "@/modules/authorization/capabilities";

describe("RBAC & Capability Architecture", () => {
  it("defines exactly the 4 required roles", () => {
    expect(ALL_ROLES).toHaveLength(4);
    expect(ALL_ROLES).toContain(UserRole.CLIENT);
    expect(ALL_ROLES).toContain(UserRole.PSYCHOLOGIST);
    expect(ALL_ROLES).toContain(UserRole.COORDINATOR);
    expect(ALL_ROLES).toContain(UserRole.ADMIN);
  });

  it("validates role strings safely", () => {
    expect(isValidRole("CLIENT")).toBe(true);
    expect(isValidRole("ADMIN")).toBe(true);
    expect(isValidRole("SUPERUSER")).toBe(false);
    expect(isValidRole("HACKER")).toBe(false);
  });

  it("checks role membership correctly", () => {
    const userRoles = [UserRole.CLIENT];
    expect(hasRole(userRoles, UserRole.CLIENT)).toBe(true);
    expect(hasRole(userRoles, UserRole.ADMIN)).toBe(false);

    expect(hasAnyRole(userRoles, [UserRole.PSYCHOLOGIST, UserRole.CLIENT])).toBe(true);
    expect(hasAnyRole(userRoles, [UserRole.ADMIN, UserRole.COORDINATOR])).toBe(false);
  });

  it("endows ADMIN with all system capabilities", () => {
    expect(hasCapability([UserRole.ADMIN], "users.manage")).toBe(true);
    expect(hasCapability([UserRole.ADMIN], "psychologists.verify")).toBe(true);
    expect(hasCapability([UserRole.ADMIN], "settings.manage")).toBe(true);
    expect(hasCapability([UserRole.ADMIN], "audit.read")).toBe(true);
  });

  it("restricts COORDINATOR from administrative capabilities", () => {
    expect(hasCapability([UserRole.COORDINATOR], "clients.read")).toBe(true);
    expect(hasCapability([UserRole.COORDINATOR], "appointments.manage")).toBe(true);
    expect(hasCapability([UserRole.COORDINATOR], "settings.manage")).toBe(false);
    expect(hasCapability([UserRole.COORDINATOR], "audit.read")).toBe(false);
    expect(hasCapability([UserRole.COORDINATOR], "psychologists.verify")).toBe(false);
  });

  it("restricts CLIENT to read-only appointment and psychologist capabilities", () => {
    expect(hasCapability([UserRole.CLIENT], "psychologists.read")).toBe(true);
    expect(hasCapability([UserRole.CLIENT], "appointments.read")).toBe(true);
    expect(hasCapability([UserRole.CLIENT], "appointments.manage")).toBe(false);
    expect(hasCapability([UserRole.CLIENT], "users.manage")).toBe(false);
  });

  it("restricts PSYCHOLOGIST to psychologist and appointment capabilities", () => {
    expect(hasCapability([UserRole.PSYCHOLOGIST], "psychologists.read")).toBe(true);
    expect(hasCapability([UserRole.PSYCHOLOGIST], "appointments.manage")).toBe(true);
    expect(hasCapability([UserRole.PSYCHOLOGIST], "settings.manage")).toBe(false);
    expect(hasCapability([UserRole.PSYCHOLOGIST], "users.manage")).toBe(false);
  });
});
