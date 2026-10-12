import { adminCategories } from "./catalogStore";
import type { AdminProduct, AdminPhoto } from "./types";

export type ProductFormState = {
  name: string; description: string; category: string; price: string;
  photos: AdminPhoto[]; hasSizes: boolean;
  sizes: { id: string; label: string; price: string; servings: string }[];
  available: boolean; availableToday: boolean; deliveryEstimate: string;
  writingEnabled: boolean; arabic: boolean; english: boolean; maxLength: string;
  candleEnabled: boolean; candlePrice: string;
};
export function toProductForm(product?: AdminProduct): ProductFormState {
  return {
    name: product?.name ?? "", description: product?.description ?? "", category: product?.category ?? "cookies",
    price: product ? String(product.price) : "", photos: product?.photos ?? [], hasSizes: Boolean(product?.sizes.length),
    sizes: product?.sizes.map((size) => ({ ...size, price: String(size.price) })) ?? [],
    available: product?.available ?? true, availableToday: product?.availableToday ?? false, deliveryEstimate: product?.deliveryEstimate ?? "",
    writingEnabled: product?.writing.enabled ?? false, arabic: product?.writing.arabic ?? true, english: product?.writing.english ?? true, maxLength: String(product?.writing.maxLength ?? 40),
    candleEnabled: product?.candle.enabled ?? false, candlePrice: String(product?.candle.price ?? 0),
  };
}
function validPrice(value: string, allowZero = false) {
  return value.trim() !== "" && Number.isFinite(Number(value)) && (allowZero ? Number(value) >= 0 : Number(value) > 0);
}
export function validateProductForm(form: ProductFormState) {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "اكتبي اسم المنتج.";
  if (!form.description.trim()) errors.description = "أضيفي وصفًا للمنتج.";
  if (!adminCategories.some((category) => category.slug === form.category)) errors.category = "اختاري قسمًا للمنتج.";
  if (!form.photos.length) errors.photos = "أضيفي صورة واحدة على الأقل.";
  if (form.hasSizes) {
    if (!form.sizes.length) errors.sizes = "أضيفي حجمًا واحدًا على الأقل، أو أوقفي خيار الأحجام.";
    const labels = new Set<string>();
    form.sizes.forEach((size, index) => {
      const label = size.label.trim();
      if (!label) errors[`size-${index}-label`] = "اكتبي الحجم.";
      else if (labels.has(label)) errors[`size-${index}-label`] = "هذا الحجم مكرر.";
      labels.add(label);
      if (!validPrice(size.price)) errors[`size-${index}-price`] = "أدخلي سعرًا أكبر من صفر.";
    });
  } else if (!validPrice(form.price)) errors.price = "أدخلي سعرًا أكبر من صفر.";
  if (form.writingEnabled) {
    if (!form.arabic && !form.english) errors.languages = "اختاري لغة واحدة على الأقل.";
    if (!Number.isInteger(Number(form.maxLength)) || Number(form.maxLength) < 1 || Number(form.maxLength) > 200) errors.maxLength = "اختاري عددًا من 1 إلى 200 حرف.";
  }
  if (form.candleEnabled && !validPrice(form.candlePrice, true)) errors.candlePrice = "أدخلي سعرًا صحيحًا؛ اكتبي صفرًا للشمعة المجانية.";
  return errors;
}
export function fromProductForm(form: ProductFormState, id: string): AdminProduct {
  const sizes = form.hasSizes ? form.sizes.map((size) => ({ ...size, label: size.label.trim(), price: Number(size.price), servings: size.servings.trim() })) : [];
  return {
    id, name: form.name.trim(), description: form.description.trim(), category: form.category,
    photos: form.photos.map((photo) => ({ ...photo, alt: form.name.trim() })),
    price: sizes.length ? Math.min(...sizes.map((size) => size.price)) : Number(form.price), sizes,
    available: form.available, availableToday: form.available && form.availableToday, deliveryEstimate: form.deliveryEstimate.trim(),
    writing: { enabled: form.writingEnabled, arabic: form.arabic, english: form.english, maxLength: form.writingEnabled ? Number(form.maxLength) : 40 },
    candle: { enabled: form.candleEnabled, price: form.candleEnabled ? Number(form.candlePrice) : 0 }, updatedAt: null,
  };
}
