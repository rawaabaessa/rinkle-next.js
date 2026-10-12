import type { Metadata } from "next";
import { OrdersManager } from "@/features/admin/orders/components/OrdersManager";

export const metadata: Metadata = { title: "الطلبات" };

export default function OrdersPage() {
  return <OrdersManager />;
}
