import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CartPage } from "@/features/cart/components/CartPage";
import { OrderHeading } from "@/features/checkout/components/OrderHeading";

export const metadata: Metadata = { title: "سلة التسوق | رينكل بيكري" };
export default function Page() {
  return (
    <Container className="pt-5 pb-16 sm:pt-8 sm:pb-24">
      <OrderHeading step="cart" />
      <CartPage />
    </Container>
  );
}
