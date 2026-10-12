"use client";

import type { OrderDraft, Snapshot } from "@/features/checkout/types";
import { useSyncExternalStore } from "react";


const initial: OrderDraft = { isGift: false, note: "", buyerName: "", buyerPhone: "", recipientName: "", recipientPhone: "", city: "", deliveryAreaId: "", district: "", address: "", payment: "bank" };


const serverSnapshot: Snapshot = { draft: initial, receipt: null };
const key = "rinkle-order-draft-v1";
const change = "rinkle-order-draft-change";
let cached: Snapshot | null = null;

function getSnapshot(): Snapshot {
  if (cached) return cached;
  const draft = { ...initial };
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (saved && typeof saved === "object") {
      const data = saved as Record<string, unknown>;
      for (const field of ["note", "buyerName", "buyerPhone", "recipientName", "recipientPhone", "city", "deliveryAreaId", "district", "address"] as const) {
        if (typeof data[field] === "string") draft[field] = data[field].slice(0, field === "note" || field === "address" ? 500 : 100);
      }
      draft.isGift = data.isGift === true;
      draft.payment = data.payment === "cod" ? "cod" : "bank";
    }
  } catch { /* A fresh draft is usable even when session storage is unavailable. */ }
  cached = { draft, receipt: null };
  return cached;
}

function subscribe(callback: () => void) {
  window.addEventListener(change, callback);
  return () => window.removeEventListener(change, callback);
}

function updateDraft(patch: Partial<OrderDraft>) {
  const current = getSnapshot();
  cached = { ...current, draft: { ...current.draft, ...patch } };
  try { sessionStorage.setItem(key, JSON.stringify(cached.draft)); } catch { /* Keep the in-memory draft. */ }
  window.dispatchEvent(new Event(change));
}

function setReceipt(file: File | null) {
  const current = getSnapshot();
  if (current.receipt?.url) URL.revokeObjectURL(current.receipt.url);
  cached = { ...current, receipt: file ? { file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null } : null };
  window.dispatchEvent(new Event(change));
}

export function useOrderDraft() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
  return { ...snapshot, updateDraft, setReceipt };
}
