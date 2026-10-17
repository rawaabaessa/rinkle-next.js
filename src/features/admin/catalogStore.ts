import { products } from "@/features/products/data";
import { categoryFormSchema, seedCategories, type AdminCategory } from "./categories/categoryData";
import type { AdminProduct } from "./types";

export const seedProducts: AdminProduct[] = products.map((product) => ({
  id: product.id,
  name: product.name,
  description: product.details ?? product.description,
  category: product.category,
  photos: (product.images?.length ? product.images : [{ src: product.image, alt: product.name }]).map((photo, index) => ({ ...photo, id: `${product.id}-photo-${index}` })),
  price: product.price,
  sizes: product.sizes?.map((size) => ({ id: size.id, label: `${size.diameterCm} سم`, price: size.price ?? product.price, servings: size.servings ?? "" })) ?? [],
  available: true,
  availableToday: product.availableToday ?? false,
  writing: { enabled: Boolean(product.writing), arabic: Boolean(product.writing), english: Boolean(product.writing), maxLength: product.writing?.maxLength ?? 40 },
  candle: { enabled: false, price: 0 },
  deliveryEstimate: product.deliveryEstimate ?? "",
  updatedAt: null,
}));

export function productPrice(product: AdminProduct) {
  return product.sizes.length ? Math.min(...product.sizes.map((size) => size.price)) : product.price;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("rinkle-admin-preview", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("catalog");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("تعذّر فتح التخزين المحلي. أغلقي تبويبات لوحة الإدارة الأخرى وجربي مجددًا."));
  });
}

// A single read/write transaction prevents lost updates between dashboard tabs.
export type CatalogState = { products: AdminProduct[]; categories: AdminCategory[] };
export async function catalogTransaction(change?: (state: CatalogState) => CatalogState): Promise<CatalogState> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction("catalog", change ? "readwrite" : "readonly");
      const store = transaction.objectStore("catalog");
      const request = store.get("products");
      const categoryRequest = store.get("categories-v1");
      let result: CatalogState;
      let failure: unknown;
      categoryRequest.onsuccess = () => {
        try {
          const saved = request.result;
          if (saved !== undefined && (!Array.isArray(saved) || !saved.every((item: AdminProduct) => item && typeof item.id === "string" && Array.isArray(item.photos) && Array.isArray(item.sizes) && item.writing && item.candle))) {
            throw new Error("تعذّر قراءة المنتجات المحفوظة.");
          }
          const categories = categoryRequest.result ?? seedCategories;
          if (!Array.isArray(categories) || !categories.every((item: AdminCategory) => typeof item?.slug === "string" && categoryFormSchema.safeParse(item).success)) throw new Error("تعذّر قراءة الأقسام المحفوظة.");
          const state = { products: saved ?? seedProducts, categories };
          result = change ? change(state) : state;
          if (change) { store.put(result.products, "products"); store.put(result.categories, "categories-v1"); }
        } catch (reason) { failure = reason; transaction.abort(); }
      };
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = () => reject(failure ?? transaction.error ?? new Error("تعذّر حفظ البيانات المحلية."));
      transaction.onerror = () => reject(transaction.error);
    });
  } finally { database.close(); }
}
