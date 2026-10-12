import type { Metadata } from "next";
import { ProductEditor } from "@/features/admin/components/ProductEditor";
export const metadata: Metadata = { title: "تعديل المنتج" };
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditor id={id} />;
}
