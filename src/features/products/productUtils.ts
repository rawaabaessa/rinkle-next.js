import { productCategories } from "./data";
import type { Product, ProductCategory } from "@/features/products/types";

export function resolveCategory(value: string | null): ProductCategory {
  // Keep the existing home-page category links working.
  if (value === "cakes") return "cookie-cakes";
  if (value === "gift-boxes") return "occasions";
  return productCategories.find((category) => category.slug === value)?.slug ?? "all";
}

export function matchesProductCategory(product: Product, category: ProductCategory) {
  if (category === "all") return true;
  if (category === "available-today") return product.availableToday === true;
  return product.category === category;
}

export function startingPrice(product: Product) {
  return product.sizes?.length
    ? Math.min(...product.sizes.map((size) => size.price ?? product.price))
    : product.price;
}
