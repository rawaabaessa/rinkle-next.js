import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CheckoutPage } from "@/features/checkout/components/CheckoutPage";
import { OrderHeading } from "@/features/checkout/components/OrderHeading";
import { CheckoutAccess } from "@/features/account/components/CheckoutAccess";

export const metadata: Metadata = { title: "التوصيل والدفع | رينكل بيكري" };
export default function Page() {
  return <Container className="pt-5 pb-16 sm:pt-8 sm:pb-24"><OrderHeading step="checkout" /><CheckoutAccess><CheckoutPage /></CheckoutAccess></Container>;
}
