import { createHmac, timingSafeEqual } from "node:crypto";
import { sectionPermissions, type StaffPrincipal } from "./policy";

export const demoCookie = "rinkle-local-demo";
export const demoMaxAge = 8 * 60 * 60;
export const demoEmail = "demo@rinkle.local";
export const demoPassword = "RinkleDemo2026!";

// UI-only fixture. Never use this identity in requireStaff or an API authorization guard.
export function localDemoEnabled(env: Partial<NodeJS.ProcessEnv>, host: string | null) {
  if (env.NODE_ENV !== "development" || env.RINKLE_LOCAL_DEMO !== "true" || env.VERCEL) return false;
  if ((env.STAFF_AUTH_SECRET ?? "").length < 32 || !host) return false;
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host);
}

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(`rinkle-local-demo:${payload}`).digest("hex");
}

export function issueDemoToken(secret: string, now = Date.now()) {
  const payload = String(now + demoMaxAge * 1000);
  return `${payload}.${signature(payload, secret)}`;
}

export function demoPrincipal(requestHeaders: Headers, env: Partial<NodeJS.ProcessEnv>, now = Date.now()): StaffPrincipal | null {
  if (!localDemoEnabled(env, requestHeaders.get("host"))) return null;
  const token = requestHeaders.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${demoCookie}=`))?.slice(demoCookie.length + 1);
  const match = token?.match(/^(\d{13})\.([a-f0-9]{64})$/);
  if (!match || Number(match[1]) <= now || Number(match[1]) > now + demoMaxAge * 1000) return null;
  if (!timingSafeEqual(Buffer.from(match[2], "hex"), Buffer.from(signature(match[1], env.STAFF_AUTH_SECRET!), "hex"))) return null;
  return {
    id: "local-demo-owner", name: "مالكة المتجر", email: demoEmail, role: "owner",
    permissions: ["dashboard.view", ...Object.values(sectionPermissions), "products.create", "products.update"],
  };
}
