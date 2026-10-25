import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { ReportsManager } from "@/features/admin/reports/ReportsManager";
import "@/features/admin/reports/reports.css";

export const metadata: Metadata = { title: "التقارير" };

export default async function ReportsPage() {
  await requireStaffPage("reports.view");

  return <ReportsManager />;
}
