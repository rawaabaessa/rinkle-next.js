import type { Metadata } from "next";
import { OffersManager } from "@/features/admin/offers/OffersManager";
import "@/features/admin/offers/offers.css";

export const metadata: Metadata = { title: "العروض والكوبونات" };

export default function OffersPage() {
  return <OffersManager />;
}
