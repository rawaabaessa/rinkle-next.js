"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MapPin, Package, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { previewSignOut, useCustomer } from "../accountStore";
import { useCustomerLogin } from "./CustomerProvider";
import { useOrderDraft } from "@/features/checkout/useOrderDraft";

export function AccountShell({ children }: { children: ReactNode }) {
  const customer = useCustomer(); const login = useCustomerLogin(); const pathname = usePathname(); const router = useRouter();
  const { updateDraft, setReceipt } = useOrderDraft();
  function logout() {
    previewSignOut();
    updateDraft({ buyerName: "", buyerPhone: "", recipientName: "", recipientPhone: "", city: "", deliveryAreaId: "", district: "", address: "" }); setReceipt(null);
    router.push("/");
  }
  return <Container className="account-area">
    <div className="mb-8"><p className="account-eyebrow">مساحتك في رينكل</p><h1 className="mt-3 text-3xl font-bold">{customer?.name ? `أهلًا، ${customer.name}` : "حسابي"}</h1><p className="mt-3 text-sm text-muted">تفاصيلك، عناوينك، وكل لحظاتك الحلوة.</p></div>
    {!customer ? <div className="account-card mx-auto max-w-xl py-12 text-center"><span className="account-symbol mx-auto"><UserRound size={28} /></span><h2 className="mt-6 text-xl font-bold">كل طلباتك في مكان واحد</h2><p className="my-4 text-sm leading-7 text-muted">ادخلي برقم جوالك للوصول إلى حسابك ومتابعة طلباتك.</p><Button onClick={() => login(pathname)}>تسجيل الدخول</Button><p className="account-notice mt-5">حساب تجريبي محلي في هذا التبويب، دون إرسال رسائل تحقق.</p></div> : <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="account-card !p-4"><div className="hidden border-b border-line/60 px-3 pb-5 pt-2 lg:block"><span className="account-symbol mb-4"><UserRound size={25} /></span><p className="font-bold">{customer.name || "أهلًا بك"}</p><p dir="ltr" className="mt-2 text-right text-sm text-muted">{customer.phone}</p></div><nav className="account-nav lg:mt-4" aria-label="حساب العميل">{[{ href: "/account", label: "بياناتي", Icon: UserRound }, { href: "/account/orders", label: "طلباتي", Icon: Package }, { href: "/account/addresses", label: "عناويني", Icon: MapPin }].map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={(href === "/account" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}><Icon size={18} />{label}</Link>)}</nav><button onClick={logout} className="account-text-button mt-4 w-full border-t border-line/60 pt-3"><LogOut size={17} />تسجيل الخروج</button></aside>
      <div className="min-w-0"><p className="account-notice mb-5">معاينة فقط · تُحفظ بيانات التجربة في هذا التبويب. استخدمي بيانات وهمية.</p>{children}</div>
    </div>}
  </Container>;
}
