"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { customerPhone, CUSTOMER_AUTH_UNAVAILABLE } from "@/lib/auth/policy";

export function LoginDialog({ changePhone, onClose }: { destination: string; changePhone: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [phone, setPhone] = useState("+967");
  const [error, setError] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previous; };
  }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    const result = customerPhone.safeParse(phone);
    setError(result.success ? CUSTOMER_AUTH_UNAVAILABLE : result.error.issues[0].message);
  }
  return <dialog ref={dialog} className="customer-dialog" aria-labelledby="login-title" onCancel={onClose} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="flex items-center justify-between"><span className="account-eyebrow">RINKLE · لحظات حلوة</span><button className="account-icon-button" onClick={onClose} aria-label="إغلاق تسجيل الدخول"><X size={20} /></button></div>
    <span className="account-symbol mt-6"><Smartphone size={27} strokeWidth={1.5} /></span><h2 id="login-title" className="mt-5 text-2xl font-bold">{changePhone ? "تغيير رقم الجوال" : "أهلًا بك في رينكل"}</h2>
    <p className="mt-3 text-sm leading-7 text-muted">{CUSTOMER_AUTH_UNAVAILABLE}</p>
    <form onSubmit={submit} noValidate className="mt-7 space-y-5"><label className="account-label">رقم الجوال<input autoFocus className="account-input" type="tel" dir="ltr" autoComplete="tel" value={phone} maxLength={24} onChange={(event) => { setPhone(event.target.value); setError(""); }} aria-invalid={!!error} aria-describedby="login-error" /></label><p id="login-error" role="alert" className="text-sm text-accent">{error}</p><Button type="submit" disabled>إرسال رمز التحقق — غير متاح حاليًا</Button></form>
  </dialog>;
}
