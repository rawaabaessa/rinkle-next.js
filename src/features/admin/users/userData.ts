import { z } from "zod";
export const roles = { owner: "مالكة المتجر", manager: "مديرة المتجر", orders: "مسؤولة الطلبات", catalog: "مسؤولة المنتجات", delivery: "مسؤولة التوصيل" } as const;
export const userFormSchema = z.object({ name: z.string().trim().min(2, "أدخلي اسمًا من حرفين على الأقل.").max(80, "الاسم طويل جدًا."), email: z.email("أدخلي بريدًا إلكترونيًا صالحًا.").max(150).transform((email) => email.toLowerCase()), role: z.enum(["manager", "orders", "catalog", "delivery"]), status: z.enum(["invited", "active", "paused"]) });
export const memberSchema = z.object({ id: z.string(), name: z.string().min(2).max(80), email: z.email().max(150), role: z.enum(["owner", "manager", "orders", "catalog", "delivery"]), status: z.enum(["invited", "active", "paused"]), created: z.string() });
export const membersSchema = z.array(memberSchema).refine((members) => members.filter((member) => member.role === "owner" && member.status === "active").length === 1, "يجب الإبقاء على مالكة المتجر مفعّلة.").refine((members) => new Set(members.map((member) => member.email.toLowerCase())).size === members.length, "البريد الإلكتروني مستخدم بالفعل.");
export type Member = z.infer<typeof memberSchema>;
export type UserFields = z.input<typeof userFormSchema>;
export const initialMembers: Member[] = [
  { id: "owner-preview", name: "إدارة رينكل", email: "admin@example.com", role: "owner", status: "active", created: "2026-10-01" },
  { id: "orders-preview", name: "سارة · حساب تجريبي", email: "orders@example.com", role: "orders", status: "active", created: "2026-10-02" },
  { id: "catalog-preview", name: "نورة · حساب تجريبي", email: "catalog@example.com", role: "catalog", status: "invited", created: "2026-10-03" },
];
export function upsertMember(members: Member[], member: Member): Member[] {
  if (member.role === "owner" || members.find((item) => item.id === member.id)?.role === "owner") throw new Error("حساب مالكة المتجر محفوظ ولا يُعدّل من هذه المعاينة.");
  if (members.some((item) => item.id !== member.id && item.email.toLowerCase() === member.email.toLowerCase())) throw new Error("هذا البريد مستخدم بالفعل في الفريق.");
  return membersSchema.parse(members.some((item) => item.id === member.id) ? members.map((item) => item.id === member.id ? member : item) : [...members, member]);
}
