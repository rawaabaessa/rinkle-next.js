import type { Metadata } from "next";
import { UsersManager } from "@/features/admin/users/UsersManager";

export const metadata: Metadata = { title: "المستخدمين" };

export default function UsersPage() {
  return <UsersManager />;
}
