"use client";
import Link from "next/link";
import { ArrowUpLeft, MapPin, Package, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { updateProfile, useCustomer } from "../accountStore";
import { useCustomerLogin } from "./CustomerProvider";

export function ProfilePage() {
  const customer = useCustomer(); const login = useCustomerLogin(); const [notice, setNotice] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (name.length < 2) { setNotice("أدخلي اسمًا من حرفين على الأقل."); return; }
    updateProfile({ name }); setNotice("تم حفظ بياناتك في المعاينة.");
  }
  if (!customer) return null;
  return <><section className="account-card"><p className="account-eyebrow">ملفك الشخصي</p><h2 className="mt-3 text-xl font-bold">نتعرّف عليك أكثر</h2><p className="mt-2 text-sm leading-7 text-muted">أضيفي اسمك الآن، أو أكمليه وقت الطلب.</p><form onSubmit={save} className="mt-7 space-y-6"><label className="account-label">الاسم الكامل<input name="name" className="account-input" defaultValue={customer.name} maxLength={100} autoComplete="name" placeholder="اسمك الكريم" required minLength={2} /></label><div><span className="account-label">رقم الحساب</span><div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f8f7f6] px-4 py-2"><span className="flex items-center gap-3"><Phone size={18} className="text-cocoa" /><bdi>{customer.phone}</bdi></span><button type="button" className="account-text-button" onClick={() => login("/account", true)}>تغيير الرقم</button></div><p className="mt-2 text-xs leading-6 text-muted">التحقق هنا تجريبي. عند الربط الفعلي سيُطلب تأكيد ملكية الرقم.</p></div><p role="status" className="text-sm text-cocoa">{notice}</p><Button type="submit" className="sm:!w-auto sm:!px-12">حفظ التغييرات</Button></form></section><div className="mt-5 grid gap-5 sm:grid-cols-2">{[{ href: "/account/orders", title: "كل لحظة لها حكاية", text: "عرض الطلبات ومتابعة حالتها", Icon: Package }, { href: "/account/addresses", title: "نوصل الحلا لبابك", text: `${customer.addresses.length} عنوان محفوظ · إدارة العناوين`, Icon: MapPin }].map(({ href, title, text, Icon }) => <Link href={href} key={href} className="account-card group"><div className="flex justify-between text-cocoa"><Icon size={23} strokeWidth={1.5} /><ArrowUpLeft size={19} /></div><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 text-sm text-muted">{text}</p></Link>)}</div></>;
}
