import { z } from "zod";
import { roles } from "../users/userData";

export type Role = keyof typeof roles;
export const permissionGroups = [
  { id: "dashboard", name: "الرئيسية", description: "ملخص المتجر والمؤشرات اليومية", actions: [{ code: "dashboard.view", label: "عرض الملخص" }] },
  { id: "orders", name: "الطلبات", description: "بيانات الطلب ومراحل التجهيز", actions: [{ code: "orders.view", label: "عرض الطلبات" }, { code: "orders.update", label: "تحديث حالة الطلب" }] },
  { id: "products", name: "المنتجات", description: "التشكيلة والأسعار وخيارات المنتجات", actions: [{ code: "products.view", label: "عرض المنتجات" }, { code: "products.create", label: "إضافة منتج" }, { code: "products.update", label: "تعديل المنتجات" }] },
  { id: "categories", name: "الأقسام", description: "تصنيف المنتجات وترتيب عرضها", actions: [{ code: "categories.view", label: "عرض الأقسام" }, { code: "categories.manage", label: "إدارة الأقسام" }] },
  { id: "delivery", name: "التوصيل", description: "متابعة التوصيل والمناطق ورسومها", actions: [{ code: "delivery.view", label: "عرض التوصيل" }, { code: "delivery.update", label: "تحديث حالة التوصيل" }, { code: "delivery.manage", label: "إدارة المناطق والأسعار" }] },
  { id: "customers", name: "العملاء", description: "بيانات العملاء وسجل طلباتهم", actions: [{ code: "customers.view", label: "عرض العملاء" }] },
  { id: "offers", name: "العروض", description: "العروض والكوبونات وفترات صلاحيتها", actions: [{ code: "offers.view", label: "عرض العروض والكوبونات" }] },
  { id: "reports", name: "التقارير", description: "قراءة أداء الطلبات وتصدير البيانات", actions: [{ code: "reports.view", label: "عرض التقارير" }, { code: "reports.export", label: "تصدير التقارير" }] },
  { id: "users", name: "المستخدمين", description: "أعضاء الفريق وأدوارهم وحالاتهم", actions: [{ code: "users.view", label: "عرض الفريق" }, { code: "users.manage", label: "إدارة أعضاء الفريق" }] },
  { id: "permissions", name: "الصلاحيات", description: "مراجعة وتعديل الوصول لكل دور", actions: [{ code: "permissions.view", label: "عرض الصلاحيات" }, { code: "permissions.manage", label: "تعديل الصلاحيات" }] },
  { id: "settings", name: "إعدادات المتجر", description: "بيانات المتجر وإعدادات الطلب والدفع", actions: [{ code: "settings.view", label: "عرض الإعدادات" }, { code: "settings.update", label: "تعديل الإعدادات" }] },
] as const;

export type PermissionCode = (typeof permissionGroups)[number]["actions"][number]["code"];
export const permissionCodes: PermissionCode[] = permissionGroups.flatMap((group) => group.actions.map((action) => action.code));
export const permissionListSchema = z.array(z.enum(permissionCodes)).refine(
  (codes) => new Set(codes).size === codes.length && permissionGroups.every((group) =>
    !group.actions.some((action) => codes.includes(action.code)) || codes.includes(group.actions[0].code)),
  "صلاحية التعديل أو التصدير تحتاج صلاحية العرض، ولا يمكن تكرار الصلاحيات.",
);
export const permissionFormSchema = z.object({ permissions: permissionListSchema });
export const permissionsSchema = z.object({
  owner: permissionListSchema, manager: permissionListSchema, orders: permissionListSchema,
  catalog: permissionListSchema, delivery: permissionListSchema,
}).refine((value) => permissionCodes.every((code) => value.owner.includes(code)), "صلاحيات مالكة المتجر محفوظة بالكامل.");
export type PermissionsDocument = z.infer<typeof permissionsSchema>;

// Suggested preview grants only. Never use this local document for authorization.
export const initialPermissions: PermissionsDocument = {
  owner: [...permissionCodes],
  manager: permissionCodes.filter((code) => !["permissions.manage", "users.manage", "settings.update"].includes(code)),
  orders: ["dashboard.view", "orders.view", "orders.update", "delivery.view", "customers.view"],
  catalog: ["dashboard.view", "products.view", "products.create", "products.update", "categories.view", "categories.manage"],
  delivery: ["dashboard.view", "delivery.view", "delivery.update"],
};
export const roleDescriptions: Record<Role, string> = {
  owner: "وصول كامل ومحمي لإدارة المتجر.", manager: "متابعة التشغيل والطلبات وأداء المتجر.",
  orders: "استقبال الطلبات ومتابعة تجهيزها.", catalog: "تنظيم التشكيلة والأقسام والأسعار.", delivery: "متابعة رحلة الطلب حتى التسليم.",
};
export function togglePermission(current: PermissionCode[], code: PermissionCode, enabled: boolean): PermissionCode[] {
  const group = permissionGroups.find((entry) => entry.actions.some((action) => action.code === code));
  if (!group) return current;
  const next = new Set(current);
  if (enabled) { next.add(group.actions[0].code); next.add(code); }
  else if (code === group.actions[0].code) group.actions.forEach((action) => next.delete(action.code));
  else next.delete(code);
  return permissionCodes.filter((permission) => next.has(permission));
}
export function samePermissions(left: PermissionCode[], right: PermissionCode[]) {
  return left.length === right.length && left.every((code) => right.includes(code));
}
