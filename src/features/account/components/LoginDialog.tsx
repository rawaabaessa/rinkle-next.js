"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Smartphone, X } from "lucide-react";
import { phoneSchema, previewSignIn } from "../accountStore";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

export function LoginDialog({ destination, changePhone, onClose }: { destination: string; changePhone: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState("+967");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(30);
  const [expiresAt, setExpiresAt] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previous; };
  }, []);
  useEffect(() => {
    if (step !== "code") return;
    codeInput.current?.focus();
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [step]);
  function issueCode() { setStep("code"); setSeconds(30); setExpiresAt(Date.now() + 300_000); setCode(""); setError(""); setAttempts(0); }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (step === "phone") {
      const result = phoneSchema.safeParse(phone);
      if (!result.success) { setError(result.error.issues[0].message); return; }
      setPhone(result.data); issueCode(); return;
    }
    if (Date.now() > expiresAt) { setError("انتهت صلاحية الرمز التجريبي. اطلبي رمزًا جديدًا."); return; }
    if (attempts >= 5) { setError("وصلتِ إلى حد المحاولات التجريبي. اطلبي رمزًا جديدًا."); return; }
    if (code !== "123456") { setAttempts((value) => value + 1); setError("الرمز غير صحيح. رمز هذه المعاينة هو 123456."); return; }
    try { previewSignIn(phone, changePhone); onClose(); router.push(destination); }
    catch (error) { setError(error instanceof Error ? error.message : "تعذّر إكمال المعاينة."); }
  }
  return <dialog ref={dialog} className="customer-dialog" aria-labelledby="login-title" onCancel={onClose} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="flex items-center justify-between"><span className="account-eyebrow">RINKLE · لحظات حلوة</span><button className="account-icon-button" onClick={onClose} aria-label="إغلاق تسجيل الدخول"><X size={20} /></button></div>
    <span className="account-symbol mt-6"><Smartphone size={27} strokeWidth={1.5} /></span>
    <h2 id="login-title" className="mt-5 text-2xl font-bold">{step === "code" ? "باقي خطوة ونورتينا" : changePhone ? "تغيير رقم الجوال" : "أهلًا بك في رينكل"}</h2>
    <p className="mt-3 text-sm leading-7 text-muted">{step === "code" ? <>أدخلي رمز التحقق للرقم <bdi className="font-medium text-ink">{phone}</bdi></> : "رقم جوالك يكفي. ادخلي لحسابك وتابعي كل لحظاتك الحلوة."}</p>
    <form onSubmit={submit} noValidate className="mt-7 space-y-5">
      <label className="account-label">{step === "phone" ? "رقم الجوال مع مفتاح الدولة" : "رمز التحقق"}{step === "phone" ? <input autoFocus className="account-input" type="tel" dir="ltr" autoComplete="tel" value={phone} maxLength={24} onChange={(event) => { setPhone(event.target.value); setError(""); }} aria-invalid={!!error} aria-describedby="login-hint login-error" /> : <input ref={codeInput} className="account-input text-center text-2xl tracking-[0.5em]" dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => { setCode(event.target.value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/\D/g, "")); setError(""); }} aria-invalid={!!error} aria-describedby="login-hint login-error" />}</label>
      <p id="login-error" role="alert" className="text-sm text-accent">{error}</p>
      <Button type="submit">{step === "phone" ? "متابعة" : changePhone ? "تأكيد تغيير الرقم تجريبيًا" : "دخول تجريبي"}</Button>
      {step === "code" && <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><button type="button" className="account-text-button" onClick={() => { setStep("phone"); setError(""); }}><ArrowRight size={16} /> تعديل الرقم</button><button type="button" className="account-text-button" disabled={seconds > 0} onClick={issueCode}>{seconds > 0 ? `إعادة الرمز بعد ${seconds} ث` : "إعادة إنشاء الرمز"}</button></div>}
    </form>
    <div id="login-hint" className="account-notice mt-6">معاينة للواجهة فقط؛ لا تُرسل رسالة ولا يتم التحقق من ملكية الرقم. {step === "code" && <>رمز التجربة: <bdi className="font-bold">123456</bdi> · صالح 5 دقائق.</>}</div>
    {changePhone && <a className="account-text-button mt-4" href={siteConfig.contact.whatsapp} target="_blank" rel="noreferrer">فقدتِ الوصول لرقمك؟ تواصلي معنا</a>}
  </dialog>;
}
