import type { Metadata } from "next";
import { DashboardPlaceholder } from "@/features/admin/components/DashboardPlaceholder";

export const metadata: Metadata = { title: "العملاء" };

export default function CustomersPage() {
  return <DashboardPlaceholder title="العملاء" description="عملاء المتجر وبياناتهم وسجل طلباتهم." icon="customers" />;
}
