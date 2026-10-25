import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { ProductsManager } from "@/features/admin/components/ProductsManager";
export const metadata: Metadata = { title: "إدارة المنتجات" };
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  await requireStaffPage("products.view");

  const { category } = await searchParams;
  const initialCategory = typeof category === "string" ? category : "all";
  return <ProductsManager key={initialCategory} initialCategory={initialCategory} />;
}
