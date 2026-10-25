import { requireStaffPage } from "@/lib/auth/guards";
import { DashboardHome } from "@/features/admin/components/DashboardHome";
export default async function DashboardPage() {
  await requireStaffPage("dashboard.view");
 return <DashboardHome />; }
