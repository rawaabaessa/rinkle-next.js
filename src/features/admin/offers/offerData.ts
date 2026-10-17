import { z } from "zod";

export function offerToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Aden", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}
const money = z.number({ error: "أدخلي رقمًا صحيحًا." }).min(0, "القيمة لا يمكن أن تكون سالبة.").max(1_000_000_000, "القيمة كبيرة جدًا.").refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 0.000001, "استخدمي منزلتين عشريتين كحد أقصى.");
const optionalLimit = z.number({ error: "أدخلي عددًا صحيحًا أو اتركي الحقل فارغًا." }).int("أدخلي عددًا صحيحًا.").min(1, "الحد يجب أن يكون 1 على الأقل.").max(1_000_000, "الحد كبير جدًا.").nullable();
const fields = z.object({
  name: z.string().trim().min(2, "اكتبي اسمًا من حرفين على الأقل.").max(80, "الاسم لا يتجاوز 80 حرفًا."),
  description: z.string().trim().max(300, "الوصف لا يتجاوز 300 حرف."),
  kind: z.enum(["automatic", "coupon"]),
  code: z.string().trim().toUpperCase().max(24, "الرمز لا يتجاوز 24 حرفًا."),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: money.refine((value) => value > 0, "أدخلي قيمة خصم أكبر من صفر."),
  maxDiscount: money.refine((value) => value > 0, "السقف يجب أن يكون أكبر من صفر.").nullable(),
  minimumSubtotal: money,
  scope: z.enum(["all", "products", "categories"]),
  targetIds: z.array(z.string()).refine((ids) => new Set(ids).size === ids.length, "لا يمكن تكرار الاختيارات."),
  startsOn: z.string().refine(validDate, "اختاري تاريخ بداية صحيحًا."),
  endsOn: z.string().refine((value) => !value || validDate(value), "اختاري تاريخ نهاية صحيحًا."),
  usageLimit: optionalLimit,
  perCustomerLimit: optionalLimit,
  state: z.enum(["draft", "active", "paused", "archived"]),
});
export type OfferFields = z.infer<typeof fields>;
function validateOffer(value: OfferFields, context: z.RefinementCtx) {
  const issue = (path: keyof OfferFields, message: string) => context.addIssue({ code: "custom", path: [path], message });
  if (value.kind === "coupon" && !/^[A-Z0-9][A-Z0-9_-]{2,23}$/.test(value.code)) issue("code", "استخدمي 3–24 حرفًا إنجليزيًا أو رقمًا، مع - أو _ دون مسافات.");
  if (value.discountType === "percentage" && value.discountValue > 100) issue("discountValue", "النسبة لا تتجاوز 100٪.");
  if (value.scope !== "all" && !value.targetIds.length) issue("targetIds", "اختاري عنصرًا واحدًا على الأقل.");
  if (value.endsOn && value.endsOn < value.startsOn) issue("endsOn", "تاريخ النهاية يجب أن يساوي البداية أو يأتي بعدها.");
  if (value.kind === "coupon" && value.usageLimit !== null && value.perCustomerLimit !== null && value.perCustomerLimit > value.usageLimit) issue("perCustomerLimit", "حد العميل لا يتجاوز حد الاستخدام الكلي.");
}
export const offerFormSchema = fields.superRefine(validateOffer);
export const offerSchema = fields.extend({
  id: z.string().min(1), revision: z.number().int().min(1),
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
}).superRefine(validateOffer);
export type Offer = z.infer<typeof offerSchema>;
export const offersSchema = z.array(offerSchema).superRefine((items, context) => {
  if (new Set(items.map((item) => item.id)).size !== items.length) context.addIssue({ code: "custom", message: "معرّف العرض مكرر." });
  const codes = items.filter((item) => item.kind === "coupon").map((item) => item.code);
  if (new Set(codes).size !== codes.length) context.addIssue({ code: "custom", message: "رمز الكوبون مستخدم بالفعل؛ اختاري رمزًا آخر، بما في ذلك الأرشيف." });
});
export const initialOffers: Offer[] = [];
export function newOffer(kind: OfferFields["kind"]): OfferFields {
  return { name: "", description: "", kind, code: "", discountType: "percentage", discountValue: 10, maxDiscount: null, minimumSubtotal: 0, scope: "all", targetIds: [], startsOn: offerToday(), endsOn: "", usageLimit: null, perCustomerLimit: null, state: "draft" };
}
export const offerStatusLabels = { draft: "مسودة", active: "نشط", scheduled: "مجدول", expired: "منتهي", paused: "موقوف", archived: "مؤرشف" } as const;
export type OfferStatus = keyof typeof offerStatusLabels;
export function offerStatus(offer: OfferFields, today: string): OfferStatus {
  if (offer.state !== "active") return offer.state;
  if (offer.endsOn && offer.endsOn < today) return "expired";
  if (offer.startsOn > today) return "scheduled";
  return "active";
}
export function offerDateLabel(value: string) {
  return new Intl.DateTimeFormat("ar-YE", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}
export function upsertOffer(current: Offer[], values: OfferFields, baseline?: Offer): Offer[] {
  const parsed = offerFormSchema.parse(values);
  if (baseline) {
    const latest = current.find((item) => item.id === baseline.id);
    if (!latest || latest.revision !== baseline.revision) throw new Error("تغيّر هذا العرض في نافذة أخرى. أغلقي المحرر وأعيدي فتحه للحصول على أحدث نسخة.");
  }
  const timestamp = new Date().toISOString();
  const next: Offer = { ...parsed, code: parsed.kind === "coupon" ? parsed.code : "", targetIds: parsed.scope === "all" ? [] : parsed.targetIds,
    maxDiscount: parsed.discountType === "percentage" ? parsed.maxDiscount : null,
    usageLimit: parsed.kind === "coupon" ? parsed.usageLimit : null, perCustomerLimit: parsed.kind === "coupon" ? parsed.perCustomerLimit : null,
    id: baseline?.id ?? crypto.randomUUID(), revision: (baseline?.revision ?? 0) + 1, createdAt: baseline?.createdAt ?? timestamp, updatedAt: timestamp };
  return offersSchema.parse(baseline ? current.map((item) => item.id === baseline.id ? next : item) : [next, ...current]);
}
// Isolated illustration for eligible products only; never a checkout price authority.
export function previewDiscount(offer: Pick<OfferFields, "discountType" | "discountValue" | "maxDiscount" | "minimumSubtotal">, subtotal: number) {
  if (!Number.isFinite(subtotal) || subtotal < 0 || !Number.isFinite(offer.discountValue) || offer.discountValue < 0 || !Number.isFinite(offer.minimumSubtotal) || subtotal < offer.minimumSubtotal) return 0;
  const amount = Math.round(subtotal * 100);
  let discount = offer.discountType === "percentage" ? Math.round(amount * Math.min(100, offer.discountValue) / 100) : Math.round(offer.discountValue * 100);
  if (offer.discountType === "percentage" && offer.maxDiscount !== null) discount = Math.min(discount, Math.max(0, Math.round(offer.maxDiscount * 100)));
  return Math.min(amount, discount) / 100;
}
