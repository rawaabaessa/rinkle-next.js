import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const json = (path) => JSON.parse(read(path));
const initialDir = "migrations/app/20261018T1328_init_authentication";
const migrationDir = "migrations/app/20261018T1518_add_better_auth";
const initial = json(`${initialDir}/migration.json`);
const migration = json(`${migrationDir}/migration.json`);
const contract = json("src/prisma/contract.json");
const tables = contract.storage.namespaces.public.entries.table;
const previous = json(`migrations/snapshots/${initial.to}/contract.json`).storage.namespaces.public.entries.table;
const ops = json(`${migrationDir}/ops.json`);
const sql = ops.flatMap((op) => op.execute).map((statement) => statement.sql).join(";\n");

test("new migration chains from the applied authentication foundation and only adds structures", () => {
  assert.equal(initial.migrationHash, "5f2e38c3984ab6c0ca5d115dac64330a350b425afcdadbb160cb40b3d3edd9c8");
  assert.equal(initial.from, null);
  assert.equal(migration.from, initial.to);
  assert.equal(migration.to, contract.storage.storageHash);
  assert.deepEqual(json(`migrations/snapshots/${migration.to}/contract.json`), contract);
  assert.ok(ops.every((op) => op.operationClass === "additive"));
  assert.equal(ops.length, 35);
  assert.doesNotMatch(sql, /\b(DROP|TRUNCATE|INSERT|DELETE\s+FROM)\b/);
  assert.doesNotMatch(read(`${migrationDir}/migration.ts`), /placeholder\(/);
  assert.equal(tables.User, undefined); assert.equal(tables.Post, undefined);
});

test("existing role definitions, relationships, constraints and columns are preserved", () => {
  for (const name of ["roles", "permissions", "role_permissions"]) assert.deepEqual(tables[name], previous[name]);
  for (const name of ["users", "staff_members"]) {
    for (const [column, definition] of Object.entries(previous[name].columns)) assert.deepEqual(tables[name].columns[column], definition);
    assert.deepEqual(tables[name].checks, previous[name].checks);
    assert.deepEqual(tables[name].foreignKeys, previous[name].foreignKeys);
  }
  assert.equal(tables.users.columns.phone_verified_at.nullable, true);
  assert.equal(tables.users.columns.phone_verified_at.default, undefined);
  assert.equal(tables.staff_members.columns.role_code.nullable, false);
  assert.deepEqual(tables.role_permissions.primaryKey.columns, ["role_code", "permission_code"]);
});

test("session and account identities are isolated by foreign keys", () => {
  for (const [realm, identity] of [["staff", "staff_members"], ["customer", "users"]]) {
    for (const suffix of ["sessions", "accounts"]) {
      const table = tables[`${realm}_${suffix}`];
      assert.equal(table.foreignKeys[0].target.tableName, identity);
      assert.deepEqual(table.foreignKeys[0].source.columns, ["user_id"]);
    }
    assert.ok(tables[`${realm}_sessions`].uniques.some((item) => item.columns.join() === "token"));
    assert.ok(tables[`${realm}_accounts`].uniques.some((item) => item.columns.join() === "provider_id,account_id"));
  }
});

test("review SQL exactly reproduces the planned statements", () => {
  const preview = read("docs/better-auth.planned.sql").split("\n").filter((line) => !line.startsWith("--")).join("\n").trim();
  assert.equal(preview, ops.flatMap((op) => op.execute).map((statement) => `${statement.sql};`).join("\n\n"));
});

test("historical seed contains only definitions; no unapproved grant or owner creation", () => {
  const seed = read("src/prisma/auth.seed.proposed.sql").replace(/^--.*$/gm, "");
  assert.deepEqual([...seed.matchAll(/INSERT INTO public\.(\w+)/g)].map((match) => match[1]), ["roles", "permissions"]);
  const codes = [...seed.matchAll(/^\s*\('([^']+)'/gm)].map((match) => match[1]);
  assert.deepEqual(codes.slice(0, 5), ["owner", "manager", "orders", "catalog", "delivery"]);
  assert.equal(codes.length, 26);
  assert.equal(new Set(codes).size, 26);
});
