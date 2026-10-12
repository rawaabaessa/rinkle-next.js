import type { Metadata } from "next";
import { DashboardPlaceholder } from "@/features/admin/components/DashboardPlaceholder";

export const metadata: Metadata = { title: "إعدادات المتجر" };

export default function SettingsPage() {
  return <DashboardPlaceholder title="إعدادات المتجر" description="بيانات المتجر وطرق الدفع والحساب البنكي وإعدادات الطلب." icon="settings" />;
}
