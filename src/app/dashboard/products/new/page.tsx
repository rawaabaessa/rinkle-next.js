import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { ProductEditor } from "@/features/admin/components/ProductEditor";
export const metadata: Metadata = { title: "إضافة منتج" };
export default async function NewProductPage() {
  await requireStaffPage("products.create");
 return <ProductEditor />; }
