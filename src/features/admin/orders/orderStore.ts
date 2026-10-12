import { z } from "zod";
import { seedOrders } from "./data";
import type { AdminOrder, OrderUpdate } from "./types";

const updateSchema = z.object({ id: z.string(), status: z.enum(["review", "processing", "ready"]), deliveryStatus: z.enum(["waiting", "out", "delivered"]) });
const savedSchema = z.array(updateSchema);
const orderSchema = updateSchema.extend({
  customer: z.string(), phone: z.string(), deliveryAreaId: z.string(), deliveryAreaName: z.string(),
  date: z.string(), time: z.string(), total: z.number().nonnegative(), deliveryFee: z.number().nonnegative(),
  deliveryDate: z.string(), deliveryWindow: z.string(), address: z.string(), paymentMethod: z.string(),
  gift: z.boolean(), note: z.string(), items: z.array(z.object({ name: z.string(), image: z.string(), quantity: z.number().int().positive(), unitPrice: z.number().nonnegative(), detail: z.string(), writing: z.string() })),
});

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rinkle-admin-orders-preview", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("orders");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("التخزين المحلي مشغول"));
  });
}

// Freeze order/fee snapshots on first read. Later area edits never reprice existing orders.
export async function ordersTransaction(change?: OrderUpdate): Promise<AdminOrder[]> {
  const update = change ? updateSchema.parse(change) : undefined;
  if (update && !seedOrders.some((order) => order.id === update.id)) throw new Error("الطلب غير موجود");
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction("orders", "readwrite");
      const store = transaction.objectStore("orders");
      const request = store.get("status-overrides-v1");
      const snapshotRequest = store.get("order-snapshots-v1");
      let result: AdminOrder[] = [];
      snapshotRequest.onsuccess = () => {
        const snapshots = z.array(orderSchema).safeParse(snapshotRequest.result ?? seedOrders);
        const parsed = savedSchema.safeParse(request.result ?? []);
        if (!parsed.success || !snapshots.success) { transaction.abort(); return; }
        const overrides = update ? [...parsed.data.filter((item) => item.id !== update.id), update] : parsed.data;
        if (snapshotRequest.result === undefined) store.put(snapshots.data, "order-snapshots-v1");
        result = snapshots.data.map((order) => ({ ...order, ...overrides.find((item) => item.id === order.id) }));
        if (update) store.put(overrides, "status-overrides-v1");
      };
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = () => reject(transaction.error ?? new Error("تعذّر قراءة أو حفظ الطلبات"));
      transaction.onerror = () => reject(transaction.error);
    });
  } finally { database.close(); }
}
