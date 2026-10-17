import { CustomerOrderDetails } from "@/features/account/components/CustomerOrders";
export const metadata = { title: "تفاصيل الطلب | رينكل بيكري" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <CustomerOrderDetails id={id} />; }
