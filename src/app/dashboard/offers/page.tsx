import type { Metadata } from "next";
import { DashboardPlaceholder } from "@/features/admin/components/DashboardPlaceholder";

export const metadata: Metadata = { title: "العروض والكوبونات" };

export default function OffersPage() {
  return <DashboardPlaceholder title="العروض والكوبونات" description="العروض الترويجية وكوبونات الخصم." icon="offers" />;
}
