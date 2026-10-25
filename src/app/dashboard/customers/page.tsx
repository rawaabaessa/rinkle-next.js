import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { CustomersManager } from "@/features/admin/customers/CustomersManager";

export const metadata: Metadata = { title: "العملاء" };

export default async function CustomersPage() {
  await requireStaffPage("customers.view");

  return <CustomersManager />;
}
