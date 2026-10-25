import { NextResponse } from "next/server";
import { demoCookie, demoEmail, demoMaxAge, demoPassword, issueDemoToken, localDemoEnabled } from "@/lib/auth/local-demo";

export async function POST(request: Request) {
  const reply = (body: object, status: number) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
  if (!localDemoEnabled(process.env, request.headers.get("host"))) return reply({ error: "NOT_FOUND" }, 404);
  const origin = request.headers.get("origin");
  let originUrl: URL;
  try { originUrl = new URL(origin ?? ""); } catch { return reply({ error: "INVALID_ORIGIN" }, 403); }
  if (originUrl.host !== request.headers.get("host") || !["http:", "https:"].includes(originUrl.protocol)) return reply({ error: "INVALID_ORIGIN" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "INVALID_BODY" }, 400);
  let body: { action?: string; email?: string; password?: string };
  try {
    const raw = await request.text();
    if (raw.length > 2048) return reply({ error: "INVALID_BODY" }, 413);
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return reply({ error: "INVALID_BODY" }, 400);
    body = value;
  } catch { return reply({ error: "INVALID_BODY" }, 400); }
  const logout = body.action === "sign-out";
  if (!logout && (body.action !== "sign-in" || body.email !== demoEmail || body.password !== demoPassword)) return reply({ error: "INVALID_CREDENTIALS" }, 401);
  const response = reply({ ok: true }, 200);
  response.cookies.set(demoCookie, logout ? "" : issueDemoToken(process.env.STAFF_AUTH_SECRET!), {
    httpOnly: true, sameSite: "strict", secure: originUrl.protocol === "https:", path: "/", maxAge: logout ? 0 : demoMaxAge,
  });
  return response;
}
