import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { SettingsManager } from "@/features/admin/settings/SettingsManager";

export const metadata: Metadata = { title: "إعدادات المتجر" };

export default async function SettingsPage() {
  await requireStaffPage("settings.view");

  return <SettingsManager />;
}
