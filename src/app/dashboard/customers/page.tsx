import type { Metadata } from "next";
import { CustomersManager } from "@/features/admin/customers/CustomersManager";

export const metadata: Metadata = { title: "العملاء" };

export default function CustomersPage() {
  return <CustomersManager />;
}
