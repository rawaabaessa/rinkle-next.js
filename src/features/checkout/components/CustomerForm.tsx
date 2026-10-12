import { Field, type CheckoutFields } from "@/features/checkout/components/CheckoutField";
import { panelClass } from "@/components/ui/controlStyles";

export function CustomerForm({ inputProps }: CheckoutFields) {
  return (<section className={panelClass} aria-labelledby="contact-title"><h2 id="contact-title" className="text-lg font-bold"><span className="me-2 text-accent">01</span>بياناتك</h2><p className="mt-2 mb-5 text-sm text-muted">للتواصل معك بخصوص طلبك.</p><div className="grid gap-5 sm:grid-cols-2"><Field {...inputProps("buyerName")} label="الاسم الكامل" autoComplete="section-buyer name" placeholder="اسمك الكريم" /><Field {...inputProps("buyerPhone")} label="رقم الجوال" autoComplete="section-buyer tel" placeholder="+967…" /></div></section>);
}
