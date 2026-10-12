import { z } from "zod";
import { initialDeliveryAreas } from "./data";
import { deliveryAreaSchema, mergeDeliveryArea } from "./validation";
import type { DeliveryArea } from "./types";

export const deliveryChangeEvent = "rinkle-delivery-change";
export const deliveryChannel = "rinkle-delivery-preview";
type Change = { type: "save"; area: DeliveryArea } | { type: "toggle"; id: string; active: boolean };

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rinkle-delivery-preview", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("delivery");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("أغلقي التبويبات القديمة وحاولي مجددًا."));
  });
}

export async function deliveryAreasTransaction(change?: Change): Promise<DeliveryArea[]> {
  const database = await openDatabase();
  try {
    const result = await new Promise<DeliveryArea[]>((resolve, reject) => {
      const transaction = database.transaction("delivery", change ? "readwrite" : "readonly");
      const store = transaction.objectStore("delivery");
      const request = store.get("areas-v1");
      let next: DeliveryArea[] = [];
      let failure: unknown;
      request.onsuccess = () => {
        try {
          next = z.array(deliveryAreaSchema).parse(request.result ?? initialDeliveryAreas);
          if (change?.type === "save") next = mergeDeliveryArea(next, change.area);
          if (change?.type === "toggle") {
            if (!next.some((area) => area.id === change.id)) throw new Error("المنطقة غير موجودة.");
            next = next.map((area) => area.id === change.id ? { ...area, active: change.active } : area);
          }
          if (change) store.put(next, "areas-v1");
        } catch (error) { failure = error; transaction.abort(); }
      };
      transaction.oncomplete = () => resolve(next);
      transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("تعذّر حفظ مناطق التوصيل."));
      transaction.onerror = () => reject(transaction.error);
    });
    if (change) {
      window.dispatchEvent(new Event(deliveryChangeEvent));
      if (typeof BroadcastChannel !== "undefined") { const channel = new BroadcastChannel(deliveryChannel); channel.postMessage("changed"); channel.close(); }
    }
    return result;
  } finally { database.close(); }
}
