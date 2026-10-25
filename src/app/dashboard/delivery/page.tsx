import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { DeliveryManager } from "@/features/admin/delivery/DeliveryManager";

export const metadata: Metadata = { title: "التوصيل" };
export default async function DeliveryPage() {
  await requireStaffPage("delivery.view");
 return <DeliveryManager />; }
