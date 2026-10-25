import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/features/admin/components/DashboardShell";
import "./dashboard.css";
import { requireStaffPage } from "@/lib/auth/guards";

export const metadata: Metadata = { title: { default: "لوحة الإدارة | رينكل", template: "%s | إدارة رينكل" }, robots: { index: false, follow: false } };
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaffPage();
  return <DashboardShell staff={staff}>{children}</DashboardShell>;
}
