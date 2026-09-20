import { UserRole } from "@prisma/client";

export const CAPABILITIES = [
  "users.read",
  "users.manage",
  "psychologists.read",
  "psychologists.verify",
  "psychologists.manage",
  "clients.read",
  "appointments.read",
  "appointments.manage",
  "coordination.read",
  "coordination.manage",
  "payments.read",
  "payments.manage",
  "settings.manage",
  "audit.read",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const ROLE_CAPABILITIES: Record<UserRole, readonly Capability[]> = {
  ADMIN: CAPABILITIES, // Platform administrators hold all capabilities
  COORDINATOR: [
    "users.read",
    "psychologists.read",
    "clients.read",
    "appointments.read",
    "appointments.manage",
    "coordination.read",
    "coordination.manage",
  ],
  PSYCHOLOGIST: [
    "psychologists.read",
    "appointments.read",
    "appointments.manage",
  ],
  CLIENT: [
    "psychologists.read",
    "appointments.read",
  ],
};

/**
 * Checks if a set of roles includes a specific capability.
 */
export function hasCapability(roles: UserRole[], capability: Capability): boolean {
  return roles.some((role) => ROLE_CAPABILITIES[role]?.includes(capability));
}
