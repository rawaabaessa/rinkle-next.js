import type { Metadata } from "next";
import { DeliveryManager } from "@/features/admin/delivery/DeliveryManager";

export const metadata: Metadata = { title: "التوصيل" };
export default function DeliveryPage() { return <DeliveryManager />; }
