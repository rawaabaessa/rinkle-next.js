import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { OrderHeading } from "@/features/checkout/components/OrderHeading";
import { CUSTOMER_AUTH_UNAVAILABLE } from "@/lib/auth/policy";

export const metadata: Metadata = { title: "التوصيل والدفع | رينكل بيكري" };
export default function Page() {
  // Do not render checkout or its order submission UI before real phone verification.
  // When SMS is integrated, call verifiedCustomer() here and in every order API.
  return <Container className="pt-5 pb-16 sm:pt-8 sm:pb-24"><OrderHeading step="checkout" /><section className="account-card mx-auto max-w-xl text-center"><h1 className="text-xl font-bold">إتمام الطلب يتطلب التحقق من رقم الجوال</h1><p className="my-5 leading-8">{CUSTOMER_AUTH_UNAVAILABLE}</p><Link href="/cart" className="account-text-button">العودة للسلة</Link></section></Container>;
}
