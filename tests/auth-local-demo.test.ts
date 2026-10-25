import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { demoCookie, demoMaxAge, demoPrincipal, issueDemoToken, localDemoEnabled } from "../src/lib/auth/local-demo";

const env = { NODE_ENV: "development", RINKLE_LOCAL_DEMO: "true", STAFF_AUTH_SECRET: "a".repeat(32) } as const;
const now = 1_800_000_000_000;
test("local demo requires explicit opt-in, development, loopback host and no Vercel", () => {
  assert.ok(localDemoEnabled(env, "localhost:3000"));
  assert.ok(localDemoEnabled(env, "127.0.0.1:3000"));
  for (const host of [null, "example.com", "localhost.example.com", "localhost@evil.test", "192.168.1.10:3000"]) assert.equal(localDemoEnabled(env, host), false);
  const blocked: Partial<NodeJS.ProcessEnv>[] = [{ NODE_ENV: "production" }, { NODE_ENV: "test" }, { RINKLE_LOCAL_DEMO: "false" }, { VERCEL: "1" }, { STAFF_AUTH_SECRET: "" }];
  for (const overrides of blocked) assert.equal(localDemoEnabled({ ...env, ...overrides }, "localhost:3000"), false);
});
test("demo page identity requires a signed unexpired cookie and cannot survive disabling demo", () => {
  const token = issueDemoToken(env.STAFF_AUTH_SECRET, now);
  const headers = new Headers({ host: "localhost:3000", cookie: `${demoCookie}=${token}` });
  assert.equal(demoPrincipal(headers, env, now)?.id, "local-demo-owner");
  assert.ok(demoPrincipal(headers, env, now)?.permissions.includes("products.create"));
  assert.equal(demoPrincipal(headers, env, now + demoMaxAge * 1000), null);
  assert.equal(demoPrincipal(headers, { ...env, NODE_ENV: "production" }, now), null);
  assert.equal(demoPrincipal(headers, { ...env, RINKLE_LOCAL_DEMO: "false" }, now), null);
  assert.equal(demoPrincipal(headers, { ...env, STAFF_AUTH_SECRET: "b".repeat(32) }, now), null);
  headers.set("cookie", `${demoCookie}=${now + 10000}.${"0".repeat(64)}`);
  assert.equal(demoPrincipal(headers, env, now), null);
  headers.delete("cookie");
  assert.equal(demoPrincipal(headers, env, now), null);
});
test("real staff API authorization does not accept the UI demo principal", () => {
  const guards = readFileSync(new URL("../src/lib/auth/guards.ts", import.meta.url), "utf8");
  const requireStaff = guards.split("export async function requireStaffPage")[0];
  assert.doesNotMatch(requireStaff, /demoPrincipal\(/);
  assert.match(requireStaff, /getAuth\("staff"\)/);
  assert.match(guards, /const staff = await requireStaff\(request.headers, permission\)/);
});
