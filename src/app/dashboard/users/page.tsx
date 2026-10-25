import { requireStaffPage } from "@/lib/auth/guards";
import type { Metadata } from "next";
import { UsersManager } from "@/features/admin/users/UsersManager";

export const metadata: Metadata = { title: "المستخدمين" };

export default async function UsersPage() {
  await requireStaffPage("users.view");

  return <UsersManager />;
}
