import type { Metadata } from "next";
import { ProductsManager } from "@/features/admin/components/ProductsManager";
export const metadata: Metadata = { title: "إدارة المنتجات" };
export default function ProductsPage() {
  return <ProductsManager />;
}
