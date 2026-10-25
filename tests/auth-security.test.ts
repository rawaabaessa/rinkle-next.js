import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { betterAuth } from "better-auth";
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { getAuthTables } from "better-auth/db";
import type { Pool } from "pg";
import { authOptions, authSettings, type AuthSettings } from "../src/lib/auth/options";
import { AccessError, authorizeStaff } from "../src/lib/auth/authorization";
import { bootstrapOwner, validateBootstrapTarget } from "../src/lib/auth/bootstrap";
import { clientBucket, consumeLimit, type QueryDatabase } from "../src/lib/auth/rate-limit";
import { staffAuthRequest, customerAuthUnavailable } from "../src/lib/auth/http";
import { customerPhone, dashboardPermission, newPassword } from "../src/lib/auth/policy";

// Real Better Auth + its isolated memory adapter. Never loads .env or contacts Neon.
const settings: AuthSettings = { origin: "https://rinkle.test", staffSecret: randomBytes(32).toString("hex"), customerSecret: randomBytes(32).toString("hex"), secure: true };
const password = "Only-for-isolated-tests-47!";
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

async function fixture() {
  const id = randomUUID();
  const now = new Date();
  const store: MemoryDB = {
    staff_members: [{ id, name: "Owner", email: "owner@example.test", email_verified: false, image: null, created_at: now, updated_at: now, role_code: "owner", status: "active" }],
    staff_accounts: [{ id: randomUUID(), user_id: id, account_id: id, provider_id: "credential", password: await hashPassword(password), created_at: now, updated_at: now }],
    staff_sessions: [], staff_verifications: [], users: [], customer_accounts: [], customer_sessions: [], customer_verifications: [],
  };
  let active = true;
  const auth = betterAuth({ ...authOptions("staff", settings, memoryAdapter(store), async () => active), logger: { disabled: true } });
  const customer = betterAuth({ ...authOptions("customer", settings, memoryAdapter(store), async () => false), logger: { disabled: true } });
  const call = (path: string, method = "GET", body?: unknown, cookie?: string, origin = settings.origin) => auth.handler(new Request(`${settings.origin}/api/auth/staff${path}`, {
    method, headers: { origin, "content-type": "application/json", ...(cookie ? { cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}),
  }));
  const login = () => call("/sign-in/email", "POST", { email: "owner@example.test", password });
  const cookies = (response: Response) => response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
  return { auth, customer, store, call, login, cookies, pause: () => { active = false; } };
}

test("real password authentication creates protected cookies; logout revokes the database session", async () => {
  const f = await fixture();
  assert.equal((await f.call("/sign-in/email", "POST", { email: "owner@example.test", password: "wrong-password" })).status, 401);
  const response = await f.login();
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal(f.store.staff_sessions.length, 1);
  assert.notEqual(f.store.staff_accounts[0].password, password);
  assert.ok(await verifyPassword({ password, hash: f.store.staff_accounts[0].password }));
  const setCookie = response.headers.get("set-cookie")!;
  assert.match(setCookie, /rinkle-staff/); assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /Secure/i); assert.match(setCookie, /SameSite=Lax/i);
  const cookie = f.cookies(response);
  assert.ok((await (await f.call("/get-session", "GET", undefined, cookie)).json()).user);
  assert.equal((await f.call("/sign-out", "POST", {}, cookie)).status, 200);
  assert.equal(f.store.staff_sessions.length, 0);
  assert.equal(await (await f.call("/get-session", "GET", undefined, cookie)).json(), null);
});

test("staff signup and forged origins are rejected; inactive staff cannot receive a session", async () => {
  const f = await fixture();
  assert.equal((await f.call("/sign-up/email", "POST", { name: "Other", email: "other@example.test", password, roleCode: "owner" })).status, 404);
  assert.equal((await f.call("/sign-in/email", "POST", { email: "owner@example.test", password }, undefined, "https://evil.test")).status, 403);
  f.pause();
  assert.notEqual((await f.login()).status, 200);
  assert.equal(f.store.staff_sessions.length, 0);
});

test("expired sessions, forged cookies and cross-realm cookies do not authorize", async () => {
  const f = await fixture();
  const cookie = f.cookies(await f.login());
  assert.equal(await f.customer.api.getSession({ headers: new Headers({ cookie }) }), null);
  assert.equal(await f.auth.api.getSession({ headers: new Headers({ cookie: cookie.replace(/session_token=[^;]+/, "session_token=forged") }) }), null);
  f.store.staff_sessions[0].expires_at = new Date(Date.now() - 60_000);
  assert.equal(await f.auth.api.getSession({ headers: new Headers({ cookie }) }), null);
});

test("revoking all sessions takes effect immediately with cookie caching disabled", async () => {
  const f = await fixture();
  const first = f.cookies(await f.login());
  const second = f.cookies(await f.login());
  assert.equal(f.store.staff_sessions.length, 2);
  assert.equal((await f.call("/revoke-sessions", "POST", {}, first)).status, 200);
  assert.equal(await f.auth.api.getSession({ headers: new Headers({ cookie: second }) }), null);
});

test("changing a password requires the current credential and revokes other sessions", async () => {
  const f = await fixture();
  const first = f.cookies(await f.login());
  const other = f.cookies(await f.login());
  const changed = "A-new-isolated-password-72!";
  assert.notEqual((await f.call("/change-password", "POST", { currentPassword: "incorrect", newPassword: changed, revokeOtherSessions: true }, first)).status, 200);
  assert.equal((await f.call("/change-password", "POST", { currentPassword: password, newPassword: changed, revokeOtherSessions: true }, first)).status, 200);
  assert.equal(await f.auth.api.getSession({ headers: new Headers({ cookie: other }) }), null);
  assert.equal((await f.login()).status, 401);
  assert.equal((await f.call("/sign-in/email", "POST", { email: "owner@example.test", password: changed })).status, 200);
});

test("RBAC reloads grants and status from the database, never bypasses grants for owner", async () => {
  const row = { id: randomUUID(), name: "Owner", email: "owner@example.test", role: "owner", status: "active", permissions: ["dashboard.view"] };
  const database = { query: async () => ({ rows: [row] }) } as unknown as QueryDatabase;
  await assert.rejects(authorizeStaff(database, undefined), (e: unknown) => e instanceof AccessError && e.status === 401);
  assert.equal((await authorizeStaff(database, row.id, "dashboard.view")).role, "owner");
  await assert.rejects(authorizeStaff(database, row.id, "permissions.manage"), AccessError);
  row.permissions = [];
  await assert.rejects(authorizeStaff(database, row.id, "dashboard.view"), AccessError);
  row.status = "paused";
  await assert.rejects(authorizeStaff(database, row.id), AccessError);
  assert.equal(dashboardPermission("/dashboard/products/new"), "products.create");
  assert.equal(dashboardPermission("/dashboard/products/123/edit"), "products.update");
  assert.equal(dashboardPermission("/dashboard/unknown"), null);
});

test("HTTP boundary rejects public registration, malformed bodies, extra privilege fields, rate limits and cross-origin POST", async () => {
  let calls = 0; let allowed = true; let forwarded: Record<string, unknown> | undefined;
  const deps = { origin: settings.origin, limit: async () => allowed, authenticate: async () => undefined, handle: async (request: Request) => { calls++; forwarded = await request.json(); return Response.json({ ok: true }); } };
  const request = (path: string, body: unknown, origin = settings.origin) => new Request(`${settings.origin}/api/auth/staff${path}`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
  assert.equal((await staffAuthRequest(request("/sign-up/email", {}), deps)).status, 404);
  assert.equal((await staffAuthRequest(request("/sign-in/email", {}, "https://evil.test"), deps)).status, 403);
  assert.equal((await staffAuthRequest(request("/sign-in/email", { email: "bad", password }), deps)).status, 400);
  assert.equal((await staffAuthRequest(request("/sign-in/email", { email: "owner@example.test", password: "x".repeat(9000) }), deps)).status, 400);
  assert.equal(calls, 0);
  allowed = false;
  assert.equal((await staffAuthRequest(request("/sign-in/email", { email: "owner@example.test", password }), deps)).status, 429);
  assert.equal(calls, 0);
  allowed = true;
  assert.equal((await staffAuthRequest(request("/sign-in/email", { email: "OWNER@example.test", password, roleCode: "owner", callbackURL: "https://evil.test", rememberMe: true }), deps)).status, 200);
  assert.deepEqual(forwarded, { email: "owner@example.test", password, rememberMe: false, callbackURL: "/dashboard" });
});

test("atomic limiter hashes identifiers and fails closed on database errors", async () => {
  let captured: unknown[] = [];
  const database = { query: async (sql: string, params: unknown[]) => { assert.match(sql, /ON CONFLICT/); assert.match(sql, /RETURNING count/); captured = params; return { rows: [{ count: 11 }] }; } } as unknown as QueryDatabase;
  assert.equal(await consumeLimit(database, settings.staffSecret, "email", "owner@example.test", 10, 900), false);
  assert.match(String(captured[0]), /^[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(captured), /owner@/);
  const failing = { query: async () => { throw new Error("offline"); } } as unknown as QueryDatabase;
  await assert.rejects(consumeLimit(failing, settings.staffSecret, "email", "owner@example.test", 10, 900));
  assert.equal(clientBucket(new Request(settings.origin, { headers: { "x-forwarded-for": "spoofed" } }), {}), "shared");
});

test("customer authentication remains closed without touching a database, including OTP verify", async () => {
  const response = customerAuthUnavailable();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, "SMS_PROVIDER_NOT_CONFIGURED");
  const f = await fixture();
  assert.notEqual((await f.customer.handler(new Request(`${settings.origin}/api/auth/customer/phone-number/verify`, { method: "POST", headers: { origin: settings.origin, "content-type": "application/json" }, body: JSON.stringify({ phoneNumber: "+967771234567", code: "123456" }) }))).status, 200);
  assert.equal(f.store.users.length, 0); assert.equal(f.store.customer_sessions.length, 0);
  assert.equal(customerPhone.parse("٠٠٩٦٧ ٧٧١٢٣٤٥٦٧"), "+967771234567");
  assert.equal(customerPhone.safeParse("+966551234567").success, false);
  assert.equal(newPassword.safeParse("short").success, false);
  assert.doesNotMatch(read("src/features/account/accountStore.ts"), /sessionStorage\.getItem|previewSignIn/);
  assert.doesNotMatch(read("src/app/(shop)/checkout/page.tsx"), /<CheckoutPage/);
});

test("all dashboard pages and the admin API declare server permission guards", () => {
  const files = readdirSync(new URL("../src/app/dashboard", import.meta.url), { recursive: true }).map(String).filter((file) => file.endsWith("page.tsx"));
  assert.ok(files.length >= 13);
  for (const path of files) assert.match(read(`src/app/dashboard/${path}`), /await requireStaffPage\("[a-z]+\.[a-z]+"\)/, path);
  assert.match(read("src/app/api/admin/me/route.ts"), /withStaffPermission\("dashboard.view"/);
});

test("authentication settings and bootstrap refuse unsafe configuration", () => {
  assert.throws(() => authSettings({ NODE_ENV: "production", AUTH_ORIGIN: "http://rinkle.test" }));
  assert.throws(() => authSettings({ STAFF_AUTH_SECRET: settings.staffSecret, CUSTOMER_AUTH_SECRET: settings.staffSecret }));
  const env = { AUTH_ENVIRONMENT: "development", DATABASE_URL: "postgresql://u:p@dev.neon.tech/db?sslmode=require", NEON_DEVELOPMENT_HOST: "dev.neon.tech" };
  validateBootstrapTarget(env);
  assert.throws(() => validateBootstrapTarget({ ...env, NODE_ENV: "production" }));
  assert.throws(() => validateBootstrapTarget({ ...env, NEON_DEVELOPMENT_HOST: "other.neon.tech" }));
  assert.throws(() => validateBootstrapTarget({ ...env, VERCEL: "1" }));
});

test("owner bootstrap hashes the credential and commits atomically, then refuses repeat", async () => {
  const queries: { sql: string; params?: unknown[] }[] = [];
  let exists = false; let released = 0;
  const client = { query: async (sql: string, params?: unknown[]) => {
    queries.push({ sql, params });
    if (sql.startsWith("SELECT 1 FROM staff_members")) return { rowCount: exists ? 1 : 0 };
    if (sql.startsWith("SELECT 1 FROM roles")) return { rowCount: 1 };
    if (sql === "COMMIT") exists = true;
    return { rowCount: 1 };
  }, release: () => { released++; } };
  const pool = { connect: async () => client } as unknown as Pool;
  await bootstrapOwner(pool, { name: "Owner", email: "OWNER@example.test", password });
  const insert = queries.find((entry) => entry.sql.includes("INSERT INTO staff_accounts"))!;
  assert.ok(await verifyPassword({ password, hash: insert.params![2] as string }));
  assert.ok(queries.find((entry) => entry.sql.includes("pg_advisory_xact_lock")));
  assert.equal(queries.at(-1)!.sql, "COMMIT");
  await assert.rejects(bootstrapOwner(pool, { name: "Owner", email: "owner@example.test", password }), /already exists/);
  assert.equal(queries.at(-1)!.sql, "ROLLBACK"); assert.equal(released, 2);
  assert.equal(queries.filter((entry) => entry.sql.includes("INSERT INTO staff_members")).length, 1);
});

test("both Better Auth schemas map to Prisma Contract columns and separate identity tables", () => {
  const contract = JSON.parse(read("src/prisma/contract.json"));
  const tables = contract.storage.namespaces.public.entries.table;
  for (const realm of ["staff", "customer"] as const) {
    const schema = getAuthTables(authOptions(realm, settings, memoryAdapter({}), async () => false));
    for (const model of Object.values(schema)) {
      const table = tables[model.modelName];
      assert.ok(table, model.modelName);
      for (const [logical, field] of Object.entries(model.fields)) assert.ok(table.columns[field.fieldName ?? logical], `${model.modelName}.${field.fieldName ?? logical}`);
      const written = new Set(["id", ...Object.entries(model.fields).map(([key, field]) => field.fieldName ?? key)]);
      for (const [column, definition] of Object.entries(table.columns) as [string, { nullable: boolean; default?: unknown }][]) {
        assert.ok(written.has(column) || definition.nullable || definition.default !== undefined, `Better Auth cannot omit required column ${model.modelName}.${column}`);
      }
    }
  }
  assert.equal(tables.users.columns.phone_verified_at.nullable, true);
  assert.equal(tables.users.columns.phone_verified_at.default, undefined);
  assert.equal(tables.staff_sessions.foreignKeys[0].target.tableName, "staff_members");
  assert.equal(tables.customer_sessions.foreignKeys[0].target.tableName, "users");
});
