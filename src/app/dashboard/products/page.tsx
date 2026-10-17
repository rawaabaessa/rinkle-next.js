import type { Metadata } from "next";
import { ProductsManager } from "@/features/admin/components/ProductsManager";
export const metadata: Metadata = { title: "إدارة المنتجات" };
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const { category } = await searchParams;
  const initialCategory = typeof category === "string" ? category : "all";
  return <ProductsManager key={initialCategory} initialCategory={initialCategory} />;
}
