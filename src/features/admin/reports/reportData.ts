import { z } from "zod";
import type { AdminOrder } from "../orders/types";

export function isReportDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export const reportFilterSchema = z.object({
  from: z.string().refine(isReportDate, "اختاري تاريخ بداية صحيحًا."),
  to: z.string().refine(isReportDate, "اختاري تاريخ نهاية صحيحًا."),
  status: z.enum(["", "review", "processing", "ready"]),
  deliveryStatus: z.enum(["", "waiting", "out", "delivered"]),
}).superRefine((value, context) => {
  if (isReportDate(value.from) && isReportDate(value.to) && value.from > value.to)
    context.addIssue({ code: "custom", path: ["to"], message: "تاريخ النهاية يجب أن يساوي البداية أو يأتي بعدها." });
});
export type ReportFilters = z.infer<typeof reportFilterSchema>;
export type ReportSeriesPoint = { date: string; value: number; count: number };
export type ProductReport = { key: string; name: string; detail: string; quantity: number; orders: number; value: number };
export type AreaReport = { id: string; name: string; orders: number; delivered: number; fees: number; value: number };
export type ReportTab = "products" | "areas" | "orders";
export const reportTabLabels: Record<ReportTab, string> = { products: "المنتجات", areas: "مناطق التوصيل", orders: "الطلبات" };
export function adenToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Aden", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function reportBounds(orders: AdminOrder[]) {
  const dates = orders.map((order) => order.date).filter(isReportDate).sort();
  return { from: dates[0] ?? adenToday(), to: dates.at(-1) ?? adenToday() };
}
export function recentReportDates(days: number, today = adenToday()) {
  const first = new Date(`${today}T12:00:00Z`);
  first.setUTCDate(first.getUTCDate() - (days - 1));
  return { from: first.toISOString().slice(0, 10), to: today };
}
export function reportDateLabel(value: string) {
  const monthly = value.length === 7;
  return new Intl.DateTimeFormat("ar-YE", { ...(monthly ? {} : { day: "numeric" as const }), month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}${monthly ? "-01" : ""}T12:00:00Z`));
}
const cents = (value: number) => Math.round(value * 100);

export function buildReport(orders: AdminOrder[], filters: ReportFilters) {
  const selected = orders.filter((order) => order.date >= filters.from && order.date <= filters.to &&
    (!filters.status || order.status === filters.status) && (!filters.deliveryStatus || order.deliveryStatus === filters.deliveryStatus));
  const products = new Map<string, ProductReport>();
  const areas = new Map<string, AreaReport>();
  const days = new Map<string, ReportSeriesPoint>();
  const preparation = { review: 0, processing: 0, ready: 0 };
  const delivery = { waiting: 0, out: 0, delivered: 0 };
  let total = 0; let fees = 0; let quantity = 0;
  const monthly = (Date.parse(filters.to) - Date.parse(filters.from)) / 86_400_000 > 92;
  for (const order of selected) {
    total += cents(order.total); fees += cents(order.deliveryFee);
    preparation[order.status]++; delivery[order.deliveryStatus]++;
    const dateKey = monthly ? order.date.slice(0, 7) : order.date;
    const day = days.get(dateKey) ?? { date: dateKey, value: 0, count: 0 };
    day.value += cents(order.total); day.count++; days.set(dateKey, day);
    const area = areas.get(order.deliveryAreaId) ?? { id: order.deliveryAreaId, name: order.deliveryAreaName, orders: 0, delivered: 0, fees: 0, value: 0 };
    area.orders++; area.delivered += Number(order.deliveryStatus === "delivered");
    area.fees += cents(order.deliveryFee); area.value += cents(order.total); areas.set(area.id, area);
    const countedProducts = new Set<string>();
    for (const item of order.items) {
      // Preview snapshots have no product IDs; keep distinct sizes separate.
      const key = JSON.stringify([item.name, item.detail]);
      const product = products.get(key) ?? { key, name: item.name, detail: item.detail, quantity: 0, orders: 0, value: 0 };
      product.quantity += item.quantity; product.value += cents(item.unitPrice * item.quantity); quantity += item.quantity;
      if (!countedProducts.has(key)) { product.orders++; countedProducts.add(key); }
      products.set(key, product);
    }
  }
  const series: ReportSeriesPoint[] = [];
  // Fill missing days with zero; use monthly buckets for long ranges.
  if (selected.length) {
    const cursor = new Date(`${monthly ? `${filters.from.slice(0, 7)}-01` : filters.from}T12:00:00Z`);
    const last = Date.parse(`${filters.to}T12:00:00Z`);
    while (cursor.getTime() <= last) {
      const key = cursor.toISOString().slice(0, monthly ? 7 : 10);
      const point = days.get(key) ?? { date: key, value: 0, count: 0 };
      series.push({ ...point, value: point.value / 100 });
      if (monthly) cursor.setUTCMonth(cursor.getUTCMonth() + 1); else cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return {
    orders: selected, total: total / 100, fees: fees / 100, productsValue: (total - fees) / 100,
    average: selected.length ? Math.round(total / selected.length) / 100 : 0,
    deliveredPercent: selected.length ? Math.round(delivery.delivered / selected.length * 100) : 0,
    quantity, preparation, delivery, series, monthly,
    products: [...products.values()].map((product) => ({ ...product, value: product.value / 100 })),
    areas: [...areas.values()].map((area) => ({ ...area, value: area.value / 100, fees: area.fees / 100 })),
  };
}
export type Report = ReturnType<typeof buildReport>;

export function reportCsv(headers: string[], rows: (string | number)[][]) {
  const cell = (value: string | number) => {
    const text = String(value);
    // Neutralize spreadsheet formula prefixes, including leading whitespace.
    const safe = typeof value === "string" && /^[\s\uFEFF]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return `\uFEFF${[headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")}`;
}
