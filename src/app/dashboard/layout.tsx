import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/features/admin/components/DashboardShell";
import "./dashboard.css";

export const metadata: Metadata = { title: { default: "لوحة الإدارة | رينكل", template: "%s | إدارة رينكل" }, robots: { index: false, follow: false } };
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
