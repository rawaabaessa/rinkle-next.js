import { allowedStaffEndpoint, CUSTOMER_AUTH_UNAVAILABLE, newPassword, staffCredentials } from "./policy";
import { AccessError } from "./authorization";

export const noStore = { "Cache-Control": "no-store" };
export function customerAuthUnavailable() {
  return Response.json({ code: "SMS_PROVIDER_NOT_CONFIGURED", message: CUSTOMER_AUTH_UNAVAILABLE }, { status: 503, headers: noStore });
}

async function readBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("JSON_REQUIRED");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("BODY_REQUIRED");
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > 8192) { await reader.cancel(); throw new Error("BODY_TOO_LARGE"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } finally { reader.releaseLock(); }
}

type StaffHTTP = {
  origin: string;
  limit: (request: Request, path: string, email?: string) => Promise<boolean>;
  authenticate: (headers: Headers) => Promise<unknown>;
  handle: (request: Request) => Promise<Response>;
};

export async function staffAuthRequest(request: Request, deps: StaffHTTP) {
  const path = new URL(request.url).pathname.slice("/api/auth/staff".length);
  if (!allowedStaffEndpoint(path, request.method)) return Response.json({ error: "NOT_FOUND" }, { status: 404, headers: noStore });
  if (request.method === "POST" && request.headers.get("origin") !== deps.origin) return Response.json({ error: "INVALID_ORIGIN" }, { status: 403, headers: noStore });
  try {
    let body: Record<string, unknown> | undefined;
    if (request.method === "POST") {
      try {
        body = await readBody(request);
        if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("INVALID_BODY");
        if (path === "/sign-in/email") body = { ...staffCredentials.parse(body), rememberMe: false, callbackURL: "/dashboard" };
        if (path === "/change-password") {
          if (typeof body.currentPassword !== "string" || !body.currentPassword.length || body.currentPassword.length > 128) throw new Error("INVALID_PASSWORD");
          body = { currentPassword: body.currentPassword, newPassword: newPassword.parse(body.newPassword), revokeOtherSessions: true };
        }
      } catch { return Response.json({ error: "INVALID_INPUT" }, { status: 400, headers: noStore }); }
    }
    if (!await deps.limit(request, path, path === "/sign-in/email" ? body?.email as string : undefined)) {
      return Response.json({ error: "TOO_MANY_ATTEMPTS" }, { status: 429, headers: { ...noStore, "Retry-After": "900" } });
    }
    if (!["/sign-in/email", "/sign-out"].includes(path)) await deps.authenticate(request.headers);
    const forwarded = body ? new Request(request.url, { method: request.method, headers: { "content-type": "application/json", cookie: request.headers.get("cookie") ?? "", origin: deps.origin }, body: JSON.stringify(body) }) : request;
    const response = await deps.handle(forwarded);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    // Do not leak SQL errors, account state, submitted credentials, or tokens.
    return Response.json({ error: error instanceof AccessError ? error.message : "AUTH_UNAVAILABLE" }, { status: error instanceof AccessError ? error.status : 503, headers: noStore });
  }
}
