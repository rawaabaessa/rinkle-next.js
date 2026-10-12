import type { OrderDraft } from "@/features/checkout/types";

export function validateOrderDraft(draft: OrderDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const key of ["buyerName", "deliveryAreaId", "district", "address", ...(draft.isGift ? ["recipientName" as const] : [])] as const) {
    if (!draft[key].trim()) errors[key] = "أكملي هذا الحقل.";
  }
  for (const key of ["buyerPhone", ...(draft.isGift ? ["recipientPhone" as const] : [])] as const) {
    const value = draft[key].replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776));
    const digits = value.replace(/\D/g, "");
    if (!/^[+\d\s()-]+$/.test(value) || digits.length < 7 || digits.length > 15) errors[key] = "أدخلي رقم جوال صحيحًا، مع رمز الدولة إذا لزم.";
  }
  return errors;
}

export async function validateReceipt(file: File): Promise<string | null> {
  if (!file.size) return "الملف فارغ. اختاري صورة أو ملف PDF للسند.";
  if (file.size > 5 * 1024 * 1024) return "حجم الملف أكبر من 5 ميغابايت. اختاري ملفًا أصغر.";
  const accepted = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!accepted.includes(file.type)) return "الصيغ المتاحة: JPG أو PNG أو WebP أو PDF.";
  try {
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const text = String.fromCharCode(...bytes);
    const valid = file.type === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : file.type === "image/png" ? [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)
      : file.type === "image/webp" ? text.startsWith("RIFF") && text.slice(8, 12) === "WEBP"
      : text.startsWith("%PDF-");
    return valid ? null : "تعذّر التعرّف على الملف. اختاري سندًا بصيغة صحيحة.";
  } catch { return "تعذّرت قراءة الملف. جرّبي اختياره مرة أخرى."; }
}
