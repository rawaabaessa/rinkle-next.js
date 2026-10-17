import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Run pure TypeScript feature logic with the compiler already installed by Next.
const modules = new Map();
function loadTs(filename) {
  const path = resolve(dirname(fileURLToPath(import.meta.url)), "..", filename);
  if (modules.has(path)) return modules.get(path).exports;
  const loaded = { exports: {} };
  modules.set(path, loaded);
  const localRequire = createRequire(path);
  const requireDependency = (id) => id.startsWith(".") ? loadTs(`${resolve(dirname(path), id)}.ts`) : localRequire(id);
  const code = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInThisContext(`(function(exports,require,module){${code}\n})`, { filename: path })(loaded.exports, requireDependency, loaded);
  return loaded.exports;
}
const permissions = loadTs("src/features/admin/permissions/permissionData.ts");
const reports = loadTs("src/features/admin/reports/reportData.ts");
const offers = loadTs("src/features/admin/offers/offerData.ts");
const all = { from: "2026-10-01", to: "2026-10-31", status: "", deliveryStatus: "" };
function order(overrides = {}) {
  return { id: "RN-test", date: "2026-10-10", time: "12:00", total: 1100, deliveryFee: 100, status: "review", deliveryStatus: "waiting", deliveryAreaId: "area-1", deliveryAreaName: "المنطقة", items: [{ name: "كوكيز", detail: "14 سم", quantity: 2, unitPrice: 500 }], ...overrides };
}
test("owner grants cannot be removed, and all suggested roles validate", () => {
  assert.equal(permissions.permissionsSchema.safeParse(permissions.initialPermissions).success, true);
  assert.equal(permissions.permissionsSchema.safeParse({ ...permissions.initialPermissions, owner: [] }).success, false);
});
test("editing requires view; disabling view revokes dependent actions only", () => {
  const enabled = permissions.togglePermission(["delivery.view"], "orders.update", true);
  assert.deepEqual(enabled, ["orders.view", "orders.update", "delivery.view"]);
  assert.deepEqual(permissions.togglePermission(enabled, "orders.view", false), ["delivery.view"]);
  assert.equal(permissions.permissionListSchema.safeParse(["orders.update"]).success, false);
  assert.equal(permissions.permissionListSchema.safeParse(["orders.view", "orders.view"]).success, false);
});
test("inclusive date boundaries and independent preparation/delivery filters", () => {
  const rows = [order({ date: "2026-10-09" }), order(), order({ date: "2026-10-11", status: "ready", deliveryStatus: "delivered" }), order({ date: "2026-10-12" })];
  assert.equal(reports.buildReport(rows, { ...all, from: "2026-10-10", to: "2026-10-11" }).orders.length, 2);
  assert.equal(reports.buildReport(rows, { ...all, status: "ready", deliveryStatus: "waiting" }).orders.length, 0);
  const result = reports.buildReport(rows, { ...all, status: "ready", deliveryStatus: "delivered" });
  assert.equal(result.orders.length, 1);
  assert.equal(result.deliveredPercent, 100);
});
test("quantity, fees and product grouping use snapshots and count each order once", () => {
  const rows = [order({ total: 1600, items: [{ name: "كيك", detail: "14 سم", quantity: 2, unitPrice: 500 }, { name: "كيك", detail: "14 سم", quantity: 1, unitPrice: 500 }] }), order({ id: "RN-2", total: 2300, deliveryFee: 300, items: [{ name: "كيك", detail: "22 سم", quantity: 1, unitPrice: 2000 }] })];
  const result = reports.buildReport(rows, all);
  assert.equal(result.total, 3900);
  assert.equal(result.productsValue, 3500);
  assert.equal(result.fees, 400);
  assert.equal(result.average, 1950);
  assert.equal(result.quantity, 4);
  assert.equal(result.products.length, 2);
  assert.equal(result.products[0].orders, 1);
  assert.equal(result.products[0].quantity, 3);
  assert.equal(result.areas[0].value, 3900);
});
test("empty reports are zero without NaN or invented chart points", () => {
  const result = reports.buildReport([], all);
  assert.equal(result.total, 0); assert.equal(result.average, 0); assert.equal(result.deliveredPercent, 0);
  assert.deepEqual(result.series, []);
});
test("daily series includes missing zero days and exact amounts", () => {
  const result = reports.buildReport([order()], { ...all, from: "2026-10-09", to: "2026-10-11" });
  assert.deepEqual(result.series.map((point) => point.value), [0, 1100, 0]);
  assert.deepEqual(result.series.map((point) => point.date), ["2026-10-09", "2026-10-10", "2026-10-11"]);
});
test("long report ranges use monthly aggregation", () => {
  const result = reports.buildReport([order()], { ...all, from: "2026-01-01", to: "2026-12-31" });
  assert.equal(result.monthly, true); assert.equal(result.series.length, 12);
  assert.equal(result.series[9].value, 1100);
});
test("invalid/reversed dates are rejected and seven-day ranges are inclusive", () => {
  assert.equal(reports.isReportDate("2026-02-30"), false);
  assert.equal(reports.isReportDate("2024-02-29"), true);
  assert.equal(reports.reportFilterSchema.safeParse({ ...all, from: "2026-10-20", to: "2026-10-10" }).success, false);
  assert.deepEqual(reports.recentReportDates(7, "2026-10-14"), { from: "2026-10-08", to: "2026-10-14" });
});
test("CSV preserves Arabic, escapes quotes/newlines and blocks formula prefixes", () => {
  const csv = reports.reportCsv(["اسم"], [['كيك "هدية"\nجديد'], ["  =SUM(1,2)"], ["+1"], ["@command"], ["-formula"], [12]]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"كيك ""هدية""\nجديد"'));
  for (const value of ["  =SUM(1,2)", "+1", "@command", "-formula"]) assert.ok(csv.includes(`"'${value}"`));
  assert.ok(csv.endsWith('"12"'));
});

const coupon = () => ({ ...offers.newOffer("coupon"), name: "عرض تجريبي", code: " rinkle10 ", startsOn: "2026-10-14", endsOn: "2026-10-20" });
test("coupon validation normalizes codes and rejects invalid conditions", () => {
  assert.equal(offers.offerFormSchema.parse(coupon()).code, "RINKLE10");
  for (const fields of [{ code: "رمز" }, { discountValue: 101 }, { discountValue: 0 }, { discountValue: 10.001 }, { minimumSubtotal: -1 }, { maxDiscount: 0 }, { startsOn: "2026-02-30" }, { endsOn: "2026-10-13" }, { scope: "products", targetIds: [] }, { usageLimit: 2, perCustomerLimit: 3 }]) {
    assert.equal(offers.offerFormSchema.safeParse({ ...coupon(), ...fields }).success, false, JSON.stringify(fields));
  }
});
test("offer scheduling has inclusive dates and preserves explicit lifecycle states", () => {
  const active = { ...coupon(), state: "active" };
  assert.equal(offers.offerStatus(active, "2026-10-13"), "scheduled");
  assert.equal(offers.offerStatus(active, "2026-10-14"), "active");
  assert.equal(offers.offerStatus(active, "2026-10-20"), "active");
  assert.equal(offers.offerStatus(active, "2026-10-21"), "expired");
  for (const state of ["draft", "paused", "archived"]) assert.equal(offers.offerStatus({ ...active, state }, "2026-10-21"), state);
});
test("discount preview respects minimum, cap, rounding and subtotal floor", () => {
  assert.equal(offers.previewDiscount({ ...coupon(), discountValue: 10, minimumSubtotal: 6000 }, 5000), 0);
  assert.equal(offers.previewDiscount({ ...coupon(), discountValue: 10, maxDiscount: 300 }, 5000), 300);
  assert.equal(offers.previewDiscount({ ...coupon(), discountType: "fixed", discountValue: 7000 }, 5000), 5000);
  assert.equal(offers.previewDiscount({ ...coupon(), discountValue: 15 }, 99.99), 15);
  assert.equal(offers.previewDiscount(coupon(), NaN), 0);
});
test("archived codes stay unique; stale edits cannot overwrite current offers", () => {
  const first = offers.upsertOffer([], coupon());
  const archived = offers.upsertOffer(first, { ...first[0], state: "archived" }, first[0]);
  assert.throws(() => offers.upsertOffer(archived, { ...coupon(), code: "rinkle10" }));
  assert.throws(() => offers.upsertOffer(archived, coupon(), first[0]), /نافذة أخرى/);
  const restored = offers.upsertOffer(archived, { ...archived[0], state: "draft" }, archived[0]);
  assert.equal(restored[0].state, "draft");
  assert.equal(restored[0].createdAt, first[0].createdAt);
  assert.equal(restored[0].revision, 3);
});
test("switching offer type removes hidden coupon and percentage-only settings", () => {
  const list = offers.upsertOffer([], { ...coupon(), kind: "automatic", discountType: "fixed", maxDiscount: 500, usageLimit: 10, perCustomerLimit: 1, targetIds: ["unused"] });
  assert.equal(list[0].code, ""); assert.equal(list[0].maxDiscount, null);
  assert.equal(list[0].usageLimit, null); assert.equal(list[0].perCustomerLimit, null);
  assert.deepEqual(list[0].targetIds, []);
});
