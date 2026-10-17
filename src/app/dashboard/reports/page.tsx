import type { Metadata } from "next";
import { ReportsManager } from "@/features/admin/reports/ReportsManager";
import "@/features/admin/reports/reports.css";

export const metadata: Metadata = { title: "التقارير" };

export default function ReportsPage() {
  return <ReportsManager />;
}
