import type { Metadata } from "next";
import { SettingsManager } from "@/features/admin/settings/SettingsManager";

export const metadata: Metadata = { title: "إعدادات المتجر" };

export default function SettingsPage() {
  return <SettingsManager />;
}
