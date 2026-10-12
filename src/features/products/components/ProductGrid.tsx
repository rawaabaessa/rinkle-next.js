"use client";

import { ProductCard } from "@/features/products/components/ProductCard";
import type { Product } from "@/features/products/types";
import type { useCart } from "@/features/cart/useCart";

export function ProductGrid({
  visibleProducts,
  items,
  addItem,
  onAnnouncement,
}: {
  visibleProducts: Product[];
  items: ReturnType<typeof useCart>["items"];
  addItem: ReturnType<typeof useCart>["addItem"];
  onAnnouncement: (message: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {visibleProducts.map((product, index) => {
        const quantity =
          items.find((item) => item.id === product.id && !item.writing)
            ?.quantity ?? 0;
        return (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            quantity={quantity}
            addItem={addItem}
            onAnnouncement={onAnnouncement}
          />
        );
      })}
    </div>
  );
}
