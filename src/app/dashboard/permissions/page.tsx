import type { Metadata } from "next";
import { DashboardPlaceholder } from "@/features/admin/components/DashboardPlaceholder";

export const metadata: Metadata = { title: "الصلاحيات" };

export default function PermissionsPage() {
  return <DashboardPlaceholder title="الصلاحيات" description="أدوار فريق العمل وما يمكن لكل دور الوصول إليه." icon="permissions" />;
}
