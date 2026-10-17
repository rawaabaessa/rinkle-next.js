"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/features/cart/useCart";
import { useOrderDraft } from "@/features/checkout/useOrderDraft";
import { useCustomer, type CustomerProfile } from "../accountStore";
import { useCustomerLogin } from "./CustomerProvider";

function CheckoutIdentity({ customer, children }: { customer: CustomerProfile; children: ReactNode }) {
  const { draft, updateDraft } = useOrderDraft();
  const initialized = useRef("");
  useEffect(() => {
    if (initialized.current === customer.phone) return;
    initialized.current = customer.phone;
    if (!draft.buyerName && customer.name) updateDraft({ buyerName: customer.name });
    if (!draft.buyerPhone) updateDraft({ buyerPhone: customer.phone });
  }, [customer.name, customer.phone, draft.buyerName, draft.buyerPhone, updateDraft]);
  return children;
}
export function CheckoutAccess({ children }: { children: ReactNode }) {
  const customer = useCustomer(); const login = useCustomerLogin(); const { items } = useCart();
  if (!items.length) return children;
  if (!customer) return <section className="account-card mx-auto max-w-xl py-12 text-center"><span className="account-symbol mx-auto"><UserRound size={28} /></span><h2 className="mt-6 text-xl font-bold">ادخلي لنكمل طلبك</h2><p className="mt-4 mb-6 text-sm leading-7 text-muted">سلتك محفوظة. رقم جوالك يساعدك تتابعين طلبك وتوصلين لبياناتك بسهولة.</p><Button onClick={() => login("/checkout")}>الدخول برقم الجوال</Button><p className="account-notice mt-5">الدخول تجريبي، ولن تصلك رسالة فعلية.</p></section>;
  return <CheckoutIdentity customer={customer}>{children}</CheckoutIdentity>;
}
