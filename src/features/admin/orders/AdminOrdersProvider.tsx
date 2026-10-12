"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ordersTransaction } from "./orderStore";
import type { AdminOrder, OrderUpdate } from "./types";

type OrdersContext = { orders: AdminOrder[]; loading: boolean; busy: boolean; error: string; notice: string; refresh: () => Promise<void>; updateOrder: (update: OrderUpdate) => Promise<boolean> };
const Context = createContext<OrdersContext | null>(null);

export function AdminOrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const saving = useRef(false);

  async function refresh() {
    try { setOrders(await ordersTransaction()); setError(""); }
    catch { setError("تعذّر قراءة الطلبات المحلية. اسمحي بالتخزين في المتصفح ثم أعيدي المحاولة."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    let active = true;
    const read = async () => {
      try { const items = await ordersTransaction(); if (active) { setOrders(items); setError(""); } }
      catch { if (active) setError("تعذّر قراءة الطلبات المحلية. اسمحي بالتخزين في المتصفح ثم أعيدي المحاولة."); }
      finally { if (active) setLoading(false); }
    };
    void read();
    window.addEventListener("focus", read);
    return () => { active = false; window.removeEventListener("focus", read); };
  }, []);

  async function updateOrder(update: OrderUpdate) {
    if (saving.current) return false;
    saving.current = true; setBusy(true); setNotice("");
    try {
      const items = await ordersTransaction(update);
      setOrders(items); setError(""); setNotice(`تم حفظ حالة الطلب ${update.id} وحالة توصيله على هذا المتصفح.`);
      return true;
    } catch { setError("لم يتم حفظ التغيير. تحققي من إتاحة التخزين في المتصفح ثم حاولي مجددًا."); return false; }
    finally { saving.current = false; setBusy(false); }
  }
  return <Context value={{ orders, loading, busy, error, notice, refresh, updateOrder }}>{children}</Context>;
}

export function useAdminOrders() {
  const context = useContext(Context);
  if (!context) throw new Error("AdminOrdersProvider is required");
  return context;
}
