import type { Metadata } from "next";
import { DashboardPlaceholder } from "@/features/admin/components/DashboardPlaceholder";

export const metadata: Metadata = { title: "المستخدمين" };

export default function UsersPage() {
  return <DashboardPlaceholder title="المستخدمين" description="حسابات أعضاء فريق العمل الذين يديرون المتجر." icon="users" />;
}
