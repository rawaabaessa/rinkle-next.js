import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { OrdersManager } from "@/features/admin/orders/components/OrdersManager";

export const metadata: Metadata = { title: "الطلبات" };

export default async function OrdersPage() {
  await requireStaffPage("orders.view");

  return <OrdersManager />;
}
