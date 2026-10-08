"use client";

import { useSyncExternalStore } from "react";
import { products } from "@/features/catalog/products";

const storageKey = "rinkle-cart-v1";
const changeEvent = "rinkle-cart-change";
const emptySnapshot = "[]";
let memorySnapshot: string | null = null;
export type ProductWriting = { language: "ar" | "en"; text: string };
type CartEntry = { id: string; quantity: number; writing?: ProductWriting; sizeId?: string };

function lineId(entry: Pick<CartEntry, "id" | "writing" | "sizeId">) {
  if (entry.sizeId) return JSON.stringify([entry.id, entry.sizeId, entry.writing?.language ?? null, entry.writing?.text ?? null]);
  return entry.writing ? JSON.stringify([entry.id, entry.writing.language, entry.writing.text]) : entry.id;
}

function normalizeWriting(id: string, value: unknown): ProductWriting | undefined {
  const product = products.find((product) => product.id === id);
  if (!product?.writing || !value || typeof value !== "object") return;
  const writing = value as Partial<ProductWriting>;
  if ((writing.language !== "ar" && writing.language !== "en") || typeof writing.text !== "string") return;
  const text = writing.text.trim().slice(0, product.writing.maxLength);
  return text ? { language: writing.language, text } : undefined;
}

function getSnapshot() {
  if (memorySnapshot !== null) return memorySnapshot;
  try { return localStorage.getItem(storageKey) ?? emptySnapshot; }
  catch { return emptySnapshot; }
}

function readEntries(snapshot: string): CartEntry[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed)) return [];
    const entries = new Map<string, CartEntry>();
    for (const entry of parsed) {
      if (entry && typeof entry.id === "string" && products.some((product) => product.id === entry.id) && Number.isInteger(entry.quantity) && entry.quantity > 0) {
        const product = products.find((product) => product.id === entry.id)!;
        // Preserve legacy entries without a size; reject unavailable stored sizes.
        if (entry.sizeId !== undefined && !product.sizes?.some((size) => size.id === entry.sizeId)) continue;
        const item = { id: entry.id, quantity: Math.min(entry.quantity, 99), writing: normalizeWriting(entry.id, entry.writing), sizeId: entry.sizeId };
        entries.set(lineId(item), item);
      }
    }
    return [...entries.values()];
  } catch { return []; }
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) { memorySnapshot = null; callback(); }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, callback);
  };
}

function save(entries: CartEntry[]) {
  memorySnapshot = JSON.stringify(entries);
  try { localStorage.setItem(storageKey, memorySnapshot); } catch { /* Keep this session's cart usable when storage is unavailable. */ }
  window.dispatchEvent(new Event(changeEvent));
}

function setQuantity(key: string, quantity: number) {
  if (!Number.isInteger(quantity)) return;
  const entries = readEntries(getSnapshot());
  save(entries.flatMap((entry) => lineId(entry) !== key ? [entry] : quantity > 0 ? [{ ...entry, quantity: Math.min(quantity, 99) }] : []));
}

function addItem(id: string, quantity = 1, writing?: ProductWriting, sizeId?: string) {
  const product = products.find((product) => product.id === id);
  if (!product || !Number.isInteger(quantity) || quantity <= 0) return 0;
  if (product.sizes?.length ? !product.sizes.some((size) => size.id === sizeId) : sizeId !== undefined) return 0;
  const entry = { id, writing: normalizeWriting(id, writing), quantity: 0, sizeId };
  const key = lineId(entry);
  const entries = readEntries(getSnapshot());
  const existing = entries.find((item) => lineId(item) === key);
  const added = Math.min(quantity, 99 - (existing?.quantity ?? 0));
  if (!added) return 0;
  if (existing) existing.quantity += added;
  else entries.push({ ...entry, quantity: added });
  save(entries);
  return added;
}

export function useCart() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot);
  const items = readEntries(snapshot).flatMap((entry) => {
    const product = products.find((product) => product.id === entry.id);
    const size = product?.sizes?.find((size) => size.id === entry.sizeId);
    return product ? [{ ...product, price: size?.price ?? product.price, size, sizeId: entry.sizeId, quantity: entry.quantity, writing: entry.writing, lineId: lineId(entry) }] : [];
  });
  return {
    items, addItem, setQuantity,
    count: items.reduce((total, item) => total + item.quantity, 0),
    total: items.reduce((total, item) => total + item.price * item.quantity, 0),
  };
}
