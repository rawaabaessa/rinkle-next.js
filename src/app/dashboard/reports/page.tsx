import type { Metadata } from "next";
import { DashboardPlaceholder } from "@/features/admin/components/DashboardPlaceholder";

export const metadata: Metadata = { title: "التقارير" };

export default function ReportsPage() {
  return <DashboardPlaceholder title="التقارير" description="تقارير الطلبات والمبيعات وأداء المنتجات." icon="reports" />;
}
