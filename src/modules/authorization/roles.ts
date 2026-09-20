import { UserRole } from "@prisma/client";

export { UserRole };

export const ALL_ROLES: UserRole[] = [
  UserRole.CLIENT,
  UserRole.PSYCHOLOGIST,
  UserRole.COORDINATOR,
  UserRole.ADMIN,
];

export function isValidRole(role: string): role is UserRole {
  return ALL_ROLES.includes(role as UserRole);
}

export function hasRole(userRoles: UserRole[], targetRole: UserRole): boolean {
  return userRoles.includes(targetRole);
}

export function hasAnyRole(userRoles: UserRole[], targetRoles: UserRole[]): boolean {
  return targetRoles.some((target) => userRoles.includes(target));
}
