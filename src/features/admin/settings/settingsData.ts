import { z } from "zod";
const integerText = (max: number) => z.string().transform((value) => value.trim().replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))).refine((value) => /^\d+$/.test(value) && Number(value) <= max, `أدخلي عددًا صحيحًا من 0 إلى ${max}.`);
const phone = z.string().trim().refine((value) => !value || /^\+\d{8,15}$/.test(value.replace(/[\s()-]/g, "")), "استخدمي الرقم مع مفتاح الدولة، مثل +967.");
export const settingsSchema = z.object({
  name: z.string().trim().min(2, "أدخلي اسم المتجر.").max(100), description: z.string().trim().max(300), phone,
  email: z.union([z.literal(""), z.email("البريد الإلكتروني غير صحيح.")]), address: z.string().trim().max(300), hours: z.string().trim().max(200),
  instagram: z.union([z.literal(""), z.url({ protocol: /^https$/, error: "أدخلي رابطًا كاملًا يبدأ بـ https://" })]),
  bankEnabled: z.boolean(), codEnabled: z.boolean(), bankName: z.string().trim().max(100), accountHolder: z.string().trim().max(100), accountNumber: z.string().trim().max(80), bankInstructions: z.string().trim().max(300),
  acceptingOrders: z.boolean(), closedMessage: z.string().trim().max(200), minOrder: integerText(1_000_000), minHours: integerText(720), maxHours: integerText(720), orderInstructions: z.string().trim().max(500),
}).superRefine((values, ctx) => {
  if (!values.bankEnabled && !values.codEnabled) ctx.addIssue({ code: "custom", path: ["codEnabled"], message: "فعّلي طريقة دفع واحدة على الأقل." });
  if (values.bankEnabled) for (const key of ["bankName", "accountHolder", "accountNumber"] as const) if (!values[key]) ctx.addIssue({ code: "custom", path: [key], message: "هذا الحقل مطلوب لتفعيل الحوالة البنكية." });
  if (Number(values.maxHours) < Number(values.minHours)) ctx.addIssue({ code: "custom", path: ["maxHours"], message: "الحد الأعلى يجب أن يساوي الحد الأدنى أو يزيد عليه." });
  if (!values.acceptingOrders && !values.closedMessage) ctx.addIssue({ code: "custom", path: ["closedMessage"], message: "أضيفي رسالة تظهر عند إيقاف الطلبات." });
});
export type StoreSettings = z.infer<typeof settingsSchema>;
export const initialSettings: StoreSettings = { name: "رينكل بيكري", description: "حلا مصنوع بحب، للحظات تستاهل.", phone: "+967739665833", email: "", address: "", hours: "", instagram: "https://www.instagram.com/rinkle_cookies_/", bankEnabled: false, codEnabled: true, bankName: "", accountHolder: "", accountNumber: "", bankInstructions: "أرفقي سند الحوالة عند إتمام الطلب.", acceptingOrders: true, closedMessage: "متوقفين مؤقتًا عن استقبال الطلبات، ونرجع لكم قريبًا.", minOrder: "0", minHours: "24", maxHours: "48", orderInstructions: "" };
