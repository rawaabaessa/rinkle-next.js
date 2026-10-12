import { z } from "zod";
import type { DeliveryArea, DeliveryQuote } from "./types";

export const normalizeAreaName = (value: string) => value.trim().replace(/\s+/g, " ").replace(/[أإآ]/g, "ا").replace(/[\u064B-\u065F\u0640]/g, "").toLowerCase();
export const deliveryAreaSchema = z.object({
  id: z.string().min(1), name: z.string().trim().min(2, "اكتبي اسم المنطقة.").max(80, "الاسم طويل؛ استخدمي 80 حرفًا أو أقل."),
  fee: z.number().int("أدخلي مبلغًا صحيحًا بالريال.").min(0, "الرسوم لا يمكن أن تكون سالبة."), active: z.boolean(),
});
export const areaFormSchema = z.object({
  name: deliveryAreaSchema.shape.name,
  fee: z.string().trim().min(1, "أدخلي رسوم التوصيل.").transform((value) => value.replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))).refine((value) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)), "أدخلي مبلغًا صحيحًا غير سالب، بدون فواصل."),
  active: z.boolean(),
});

export function quoteDelivery(areas: DeliveryArea[], id: string): DeliveryQuote {
  const area = areas.find((item) => item.id === id && item.active);
  if (!area) throw new Error("اختاري منطقة توصيل مفعّلة؛ المنطقة السابقة قد تكون متوقفة الآن.");
  return { areaId: area.id, areaName: area.name, fee: area.fee };
}

export function mergeDeliveryArea(areas: DeliveryArea[], value: DeliveryArea) {
  const area = deliveryAreaSchema.parse(value);
  if (areas.some((item) => item.id !== area.id && normalizeAreaName(item.name) === normalizeAreaName(area.name))) throw new Error("هذه المنطقة موجودة بالفعل، يمكنك تعديلها من القائمة.");
  return areas.some((item) => item.id === area.id) ? areas.map((item) => item.id === area.id ? area : item) : [...areas, area];
}
