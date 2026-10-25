import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { PermissionsManager } from "@/features/admin/permissions/PermissionsManager";
import "@/features/admin/permissions/permissions.css";

export const metadata: Metadata = { title: "الصلاحيات" };

export default async function PermissionsPage() {
  await requireStaffPage("permissions.view");

  return <PermissionsManager />;
}
