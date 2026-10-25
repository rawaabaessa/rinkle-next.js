import { z } from "zod";

export const staffCredentials = z.object({
  email: z.email().max(150).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});
export const newPassword = z.string().min(16).max(128);
export function normalizePhone(value: string) {
  const phone = value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[\s()-]/g, "");
  return phone.startsWith("00") ? `+${phone.slice(2)}` : phone;
}
export const customerPhone = z.string().transform(normalizePhone).pipe(
  z.string().regex(/^\+9677\d{8}$/, "أدخلي رقم جوال يمني صالحًا يبدأ بـ +967."),
);

export type StaffPrincipal = { id: string; name: string; email: string; role: string; permissions: string[] };
export const sectionPermissions: Record<string, string> = {
  orders: "orders.view", products: "products.view", categories: "categories.view",
  delivery: "delivery.view", customers: "customers.view", offers: "offers.view",
  reports: "reports.view", users: "users.view", permissions: "permissions.view", settings: "settings.view",
};
export function dashboardPermission(path: string): string | null {
  if (path === "/dashboard") return "dashboard.view";
  if (path === "/dashboard/products/new") return "products.create";
  if (/^\/dashboard\/products\/[^/]+\/edit$/.test(path)) return "products.update";
  const match = /^\/dashboard\/([^/]+)$/.exec(path);
  return match ? sectionPermissions[match[1]] ?? null : null;
}
export function can(principal: StaffPrincipal, permission: string) {
  // No implicit owner bypass: the database grants are authoritative for every role.
  return principal.permissions.includes(permission);
}
export const CUSTOMER_AUTH_UNAVAILABLE = "تسجيل الدخول برمز الجوال غير متاح حاليًا، إلى حين تفعيل خدمة الرسائل.";

export function allowedStaffEndpoint(path: string, method: string) {
  if (method === "GET") return ["/get-session", "/list-sessions"].includes(path);
  return method === "POST" && ["/sign-in/email", "/sign-out", "/revoke-session", "/revoke-sessions", "/revoke-other-sessions", "/change-password"].includes(path);
}
