import type { Metadata } from "next";
import { CategoriesManager } from "@/features/admin/categories/CategoriesManager";

export const metadata: Metadata = { title: "الأقسام" };

export default function CategoriesPage() {
  return <CategoriesManager />;
}
