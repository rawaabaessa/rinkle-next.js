import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { CategoriesManager } from "@/features/admin/categories/CategoriesManager";

export const metadata: Metadata = { title: "الأقسام" };

export default async function CategoriesPage() {
  await requireStaffPage("categories.view");

  return <CategoriesManager />;
}
