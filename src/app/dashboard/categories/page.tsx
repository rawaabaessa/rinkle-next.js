import type { Metadata } from "next";
import { DashboardPlaceholder } from "@/features/admin/components/DashboardPlaceholder";

export const metadata: Metadata = { title: "الأقسام" };

export default function CategoriesPage() {
  return <DashboardPlaceholder title="الأقسام" description="تنظيم أقسام المنتجات وترتيب ظهورها في المتجر." icon="categories" />;
}
