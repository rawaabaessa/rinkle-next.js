import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { OffersManager } from "@/features/admin/offers/OffersManager";
import "@/features/admin/offers/offers.css";

export const metadata: Metadata = { title: "العروض والكوبونات" };

export default async function OffersPage() {
  await requireStaffPage("offers.view");

  return <OffersManager />;
}
