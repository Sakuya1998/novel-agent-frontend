import type { AuthRole } from "../types";

export type Permission =
  | "workspace:read"
  | "workspace:manage"
  | "members:manage"
  | "resources:read"
  | "resources:manage"
  | "novels:read"
  | "novels:write"
  | "jobs:start";

const rolePermissions: Record<AuthRole, readonly Permission[]> = {
  owner: [
    "workspace:read",
    "workspace:manage",
    "members:manage",
    "resources:read",
    "resources:manage",
    "novels:read",
    "novels:write",
    "jobs:start",
  ],
  editor: ["workspace:read", "resources:read", "novels:read", "novels:write", "jobs:start"],
  viewer: ["workspace:read", "resources:read", "novels:read"],
};

export function can(role: AuthRole | null | undefined, permission: Permission): boolean {
  return Boolean(role && rolePermissions[role].includes(permission));
}

export function isReadOnly(role: AuthRole | null | undefined): boolean {
  return !can(role, "novels:write");
}

export function permissionsFor(role: AuthRole | null | undefined): readonly Permission[] {
  return role ? rolePermissions[role] : [];
}
