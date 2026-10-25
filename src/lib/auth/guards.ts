import "server-only";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getSessionCookie } from "better-auth/cookies";
import { authPool } from "./database";
import { getAuth } from "./server";
import { AccessError, authorizeStaff } from "./authorization";
import type { StaffPrincipal } from "./policy";
import { demoPrincipal } from "./local-demo";

export async function requireStaff(requestHeaders: Headers, permission?: string) {
  // This is only an early rejection; a present cookie is still verified by Better Auth.
  if (!getSessionCookie(requestHeaders, { cookiePrefix: "rinkle-staff" })) throw new AccessError(401);
  const session = await getAuth("staff").api.getSession({ headers: requestHeaders });
  return authorizeStaff(authPool(), session?.user.id, permission);
}

export async function requireStaffPage(permission?: string) {
  const requestHeaders = await headers();
  // Only page rendering may use the local fixture; API guards still require Better Auth.
  const demo = demoPrincipal(requestHeaders, process.env);
  if (demo && (!permission || demo.permissions.includes(permission))) return demo;
  try { return await requireStaff(requestHeaders, permission); }
  catch (error) {
    if (error instanceof AccessError) {
      if (error.status === 401) redirect("/admin/login");
      notFound();
    }
    throw error;
  }
}

// Every admin API must declare its permission. No UI flag or role cookie is trusted.
export function withStaffPermission(permission: string, handler: (request: Request, staff: StaffPrincipal) => Promise<Response>) {
  return async (request: Request) => {
    try {
      if (!["GET", "HEAD"].includes(request.method) && request.headers.get("origin") !== new URL(process.env.AUTH_ORIGIN ?? "http://localhost:3000").origin) {
        return Response.json({ error: "INVALID_ORIGIN" }, { status: 403 });
      }
      const staff = await requireStaff(request.headers, permission);
      const response = await handler(request, staff);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    } catch (error) {
      return Response.json({ error: error instanceof AccessError ? error.message : "AUTH_UNAVAILABLE" }, { status: error instanceof AccessError ? error.status : 503, headers: { "Cache-Control": "no-store" } });
    }
  };
}

export async function verifiedCustomer(requestHeaders: Headers) {
  if (!getSessionCookie(requestHeaders, { cookiePrefix: "rinkle-customer" })) throw new AccessError(401);
  const session = await getAuth("customer").api.getSession({ headers: requestHeaders });
  if (!session) throw new AccessError(401);
  const result = await authPool().query<{ id: string; phone: string; name: string | null }>(
    "SELECT id, phone, name FROM users WHERE id = $1 AND deleted_at IS NULL AND phone_verified = true AND phone_verified_at IS NOT NULL", [session.user.id],
  );
  if (!result.rows[0]) throw new AccessError(403);
  return result.rows[0];
}
