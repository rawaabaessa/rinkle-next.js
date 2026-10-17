"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { catalogTransaction, type CatalogState } from "./catalogStore";
import { moveCategory, upsertCategory, type AdminCategory } from "./categories/categoryData";
import type { AdminProduct } from "./types";

type CatalogContext = {
  products: AdminProduct[];
  categories: AdminCategory[];
  loading: boolean;
  error: string;
  busy: boolean;
  notice: string;
  saveProduct: (product: AdminProduct) => Promise<boolean>;
  setAvailability: (id: string, available: boolean) => Promise<boolean>;
  saveCategory: (category: AdminCategory) => Promise<boolean>;
  setCategoryActive: (slug: string, active: boolean) => Promise<boolean>;
  reorderCategory: (slug: string, direction: -1 | 1) => Promise<boolean>;
};
const Context = createContext<CatalogContext | null>(null);

export function AdminCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);

  useEffect(() => {
    let active = true;
    const read = () => catalogTransaction().then((state) => { if (active) { setProducts(state.products); setCategories(state.categories); setError(""); } }).catch(() => { if (active) setError("تعذّر فتح بيانات التجربة. اسمحي بالتخزين في المتصفح ثم أعيدي تحميل الصفحة."); }).finally(() => { if (active) setLoading(false); });
    void read();
    window.addEventListener("focus", read);
    return () => { active = false; window.removeEventListener("focus", read); };
  }, []);

  async function mutate(change: (state: CatalogState) => CatalogState, message: string) {
    if (saving.current) return false;
    saving.current = true;
    setBusy(true);
    setNotice("");
    try {
      const next = await catalogTransaction(change);
      setProducts(next.products);
      setCategories(next.categories);
      setError("");
      setNotice(message);
      return true;
    } catch (reason) {
      setError(reason instanceof Error && !(reason instanceof DOMException) ? reason.message : "لم يتم الحفظ. قد تكون مساحة المتصفح ممتلئة أو التخزين غير متاح. احتفظي بالصفحة مفتوحة وجربي صورًا أصغر.");
      return false;
    } finally { saving.current = false; setBusy(false); }
  }

  const saveProduct = (product: AdminProduct) => mutate((state) => {
    const items = state.products;
    const category = state.categories.find((item) => item.slug === product.category);
    const previous = items.find((item) => item.id === product.id);
    if (!category || (!category.active && previous?.category !== category.slug)) throw new Error("اختاري قسمًا مفعّلًا للمنتج.");
    const updated = { ...product, updatedAt: new Date().toISOString() };
    return { ...state, products: items.some((item) => item.id === product.id) ? items.map((item) => item.id === product.id ? updated : item) : [updated, ...items] };
  }, "تم حفظ المنتج في لوحة الإدارة على هذا المتصفح.");
  const setAvailability = (id: string, available: boolean) => mutate((state) => ({ ...state, products: state.products.map((item) => item.id === id ? { ...item, available, availableToday: available && item.availableToday, updatedAt: new Date().toISOString() } : item) }), available ? "تم تغيير الحالة إلى متوفر." : "تم تغيير الحالة إلى غير متوفر.");
  const saveCategory = (category: AdminCategory) => mutate((state) => ({ ...state, categories: upsertCategory(state.categories, category) }), "تم حفظ القسم في لوحة الإدارة على هذا المتصفح.");
  const setCategoryActive = (slug: string, active: boolean) => mutate((state) => ({ ...state, categories: state.categories.map((item) => item.slug === slug ? { ...item, active } : item) }), active ? "تم تفعيل القسم." : "تم إيقاف القسم مع الاحتفاظ بمنتجاته.");
  const reorderCategory = (slug: string, direction: -1 | 1) => mutate((state) => ({ ...state, categories: moveCategory(state.categories, slug, direction) }), "تم حفظ ترتيب الأقسام.");

  return <Context value={{ products, categories, loading, error, busy, notice, saveProduct, setAvailability, saveCategory, setCategoryActive, reorderCategory }}>{children}</Context>;
}

export function useAdminCatalog() {
  const context = useContext(Context);
  if (!context) throw new Error("AdminCatalogProvider is required");
  return context;
}
