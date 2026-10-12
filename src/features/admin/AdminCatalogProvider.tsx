"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { catalogTransaction } from "./catalogStore";
import type { AdminProduct } from "./types";

type CatalogContext = {
  products: AdminProduct[];
  loading: boolean;
  error: string;
  busy: boolean;
  notice: string;
  saveProduct: (product: AdminProduct) => Promise<boolean>;
  setAvailability: (id: string, available: boolean) => Promise<boolean>;
};
const Context = createContext<CatalogContext | null>(null);

export function AdminCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);

  useEffect(() => {
    let active = true;
    const read = () => catalogTransaction().then((items) => { if (active) { setProducts(items); setError(""); } }).catch(() => { if (active) setError("تعذّر فتح بيانات التجربة. اسمحي بالتخزين في المتصفح ثم أعيدي تحميل الصفحة."); }).finally(() => { if (active) setLoading(false); });
    void read();
    window.addEventListener("focus", read);
    return () => { active = false; window.removeEventListener("focus", read); };
  }, []);

  async function mutate(change: (items: AdminProduct[]) => AdminProduct[], message: string) {
    if (saving.current) return false;
    saving.current = true;
    setBusy(true);
    setNotice("");
    try {
      const next = await catalogTransaction(change);
      setProducts(next);
      setError("");
      setNotice(message);
      return true;
    } catch {
      setError("لم يتم الحفظ. قد تكون مساحة المتصفح ممتلئة أو التخزين غير متاح. احتفظي بالصفحة مفتوحة وجربي صورًا أصغر.");
      return false;
    } finally { saving.current = false; setBusy(false); }
  }

  const saveProduct = (product: AdminProduct) => mutate((items) => {
    const updated = { ...product, updatedAt: new Date().toISOString() };
    return items.some((item) => item.id === product.id) ? items.map((item) => item.id === product.id ? updated : item) : [updated, ...items];
  }, "تم حفظ المنتج في لوحة الإدارة على هذا المتصفح.");
  const setAvailability = (id: string, available: boolean) => mutate((items) => items.map((item) => item.id === id ? { ...item, available, availableToday: available && item.availableToday, updatedAt: new Date().toISOString() } : item), available ? "تم تغيير الحالة إلى متوفر." : "تم تغيير الحالة إلى غير متوفر.");

  return <Context value={{ products, loading, error, busy, notice, saveProduct, setAvailability }}>{children}</Context>;
}

export function useAdminCatalog() {
  const context = useContext(Context);
  if (!context) throw new Error("AdminCatalogProvider is required");
  return context;
}
