import { can, type StaffPrincipal } from "./policy";
import type { QueryDatabase } from "./rate-limit";

export class AccessError extends Error {
  constructor(public readonly status: 401 | 403) { super(status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN"); }
}
export async function authorizeStaff(database: QueryDatabase, userId: string | undefined, permission?: string): Promise<StaffPrincipal> {
  if (!userId) throw new AccessError(401);
  const result = await database.query<StaffPrincipal & { status: string }>(`
    SELECT s.id, s.name, s.email, s.role_code AS role, s.status,
      COALESCE(array_agg(rp.permission_code) FILTER (WHERE rp.permission_code IS NOT NULL), '{}') AS permissions
    FROM staff_members s LEFT JOIN role_permissions rp ON rp.role_code = s.role_code
    WHERE s.id = $1 GROUP BY s.id`, [userId]);
  const staff = result.rows[0];
  if (!staff || staff.status !== "active") throw new AccessError(403);
  if (permission && !can(staff, permission)) throw new AccessError(403);
  return { id: staff.id, name: staff.name, email: staff.email, role: staff.role, permissions: staff.permissions };
}
