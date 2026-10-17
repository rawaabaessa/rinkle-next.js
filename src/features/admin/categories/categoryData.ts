import { z } from "zod";
import { categories as homeCategories } from "@/features/products/categories";
import { productCategories } from "@/features/products/data";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "اكتبي اسمًا من حرفين على الأقل.").max(60, "الاسم طويل؛ الحد الأقصى 60 حرفًا."),
  description: z.string().trim().max(200, "الوصف لا يتجاوز 200 حرف."),
  image: z.string().refine((value) => !value || /^\/images\//.test(value) || /^data:image\/(png|jpeg|webp);base64,/.test(value), "اختاري صورة صالحة."),
  active: z.boolean(),
});
export type CategoryValues = z.infer<typeof categoryFormSchema>;
export type AdminCategory = CategoryValues & { slug: string };
export const normalizeCategoryName = (value: string) => value.normalize("NFKC").replace(/[أإآ]/g, "ا").replace(/[\u064B-\u065F\u0640]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

// Keep existing product references and storefront aliases intact.
export const seedCategories: AdminCategory[] = productCategories
  .filter((item) => item.slug !== "all" && item.slug !== "available-today")
  .map((item) => {
    const alias = item.slug === "cookie-cakes" ? "cakes" : item.slug === "occasions" ? "gift-boxes" : item.slug;
    const home = homeCategories.find((category) => category.slug === alias);
    return { slug: item.slug, name: item.name, description: home?.note ?? "", image: home?.image ?? "", active: true };
  });

export function upsertCategory(items: AdminCategory[], category: AdminCategory): AdminCategory[] {
  const values = categoryFormSchema.parse(category);
  if (items.some((item) => item.slug !== category.slug && normalizeCategoryName(item.name) === normalizeCategoryName(values.name))) {
    throw new Error("يوجد قسم بهذا الاسم بالفعل. اختاري اسمًا مختلفًا.");
  }
  const next = { ...values, slug: category.slug };
  return items.some((item) => item.slug === next.slug) ? items.map((item) => item.slug === next.slug ? next : item) : [...items, next];
}

export function moveCategory(items: AdminCategory[], slug: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.slug === slug);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
