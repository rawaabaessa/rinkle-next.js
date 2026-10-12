import type { productCategories } from "./data";

export type ProductCategory = (typeof productCategories)[number]["slug"];

export type ProductSize = {
  id: string;
  diameterCm: number;
  servings?: string;
  price?: number;
};

export type Product = {
  id: string;
  name: string;
  category: Exclude<ProductCategory, "all" | "available-today">;
  description: string;
  image: string;
  images?: { src: string; alt: string }[];
  details?: string;
  writing?: { maxLength: number };
  deliveryEstimate?: string;
  price: number;
  sizes?: ProductSize[];
  photo?: boolean;
  // Set true only when this product is ready for same-day delivery.
  // Unspecified availability is treated as unavailable, including preview data.
  availableToday?: boolean;
};

export type Category = {
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  note: string;
};
