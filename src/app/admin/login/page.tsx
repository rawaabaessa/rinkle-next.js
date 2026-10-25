import { AdminLogin } from "@/features/admin/components/AdminLogin";
import { headers } from "next/headers";
import { localDemoEnabled } from "@/lib/auth/local-demo";
import "@/features/account/account.css";
export const metadata = { title: "دخول الإدارة | رينكل بيكري", robots: { index: false, follow: false } };
export default async function Page() {
  const demo = localDemoEnabled(process.env, (await headers()).get("host"));
  return <AdminLogin demo={demo} />;
}
