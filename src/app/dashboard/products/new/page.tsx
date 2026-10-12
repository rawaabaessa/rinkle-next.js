import type { Metadata } from "next";
import { ProductEditor } from "@/features/admin/components/ProductEditor";
export const metadata: Metadata = { title: "إضافة منتج" };
export default function NewProductPage() { return <ProductEditor />; }
