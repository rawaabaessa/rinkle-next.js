"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

const schema = z.object({ email: z.email("أدخلي بريدًا إلكترونيًا صالحًا.").max(150), password: z.string().min(1, "أدخلي كلمة المرور.").max(128) });
export function AdminLogin({ demo = false }: { demo?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  async function signIn(values: z.infer<typeof schema>) {
    setError("");
    try {
      const response = await fetch(demo ? "/api/auth/demo" : "/api/auth/staff/sign-in/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(demo ? { ...values, action: "sign-in" } : values) });
      if (!response.ok) {
        setError(response.status === 429 ? "محاولات كثيرة. انتظري 15 دقيقة قبل المحاولة مجددًا." : response.status >= 500 ? "خدمة الدخول غير متاحة حاليًا. حاولي لاحقًا." : "تعذّر الدخول. تحققي من البريد وكلمة المرور.");
        return;
      }
      window.location.replace("/dashboard");
    } catch { setError("تعذّر الاتصال. حاولي مجددًا."); }
  }
  return <main className="account-area min-h-dvh bg-[#f7f8f9] px-5 sm:px-10">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 py-3"><Link href="/"><Image src={siteConfig.logo} alt="رينكل بيكري" width={150} height={50} /></Link><Link href="/" className="account-text-button"><ArrowRight size={16} />العودة للمتجر</Link></div>
    <div className="mx-auto mt-12 grid max-w-5xl items-stretch gap-8 lg:grid-cols-2">
      <section className="hidden flex-col justify-between overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#382219,#633b2b_60%,#8a5c43)] p-12 text-white lg:flex"><span className="text-xs tracking-[0.2em] text-white/60">RINKLE BAKERY · الإدارة</span><div className="py-20"><ShieldCheck size={48} strokeWidth={1} className="mb-9 text-[#dec8b8]" /><p className="text-4xl font-medium leading-[1.6]">وراء كل لحظة حلوة،<br />تفاصيل مرتّبة.</p><p className="mt-6 text-sm leading-8 text-white/65">مساحتك لإدارة المنتجات والطلبات،<br />ومتابعة رحلة الحلا إلى عملائك.</p></div><p className="text-xs text-white/50">دخول مخصص لفريق رينكل</p></section>
      <section className="account-card !p-7 sm:!p-10"><span className="account-symbol"><ShieldCheck size={27} strokeWidth={1.5} /></span><h1 className="mt-7 text-2xl font-bold">دخول الإدارة</h1><p className="mt-3 text-sm leading-7 text-muted">أهلًا بعودتك. ادخلي ببريدك وكلمة المرور.</p>
        <form noValidate className="mt-8 space-y-5" onSubmit={handleSubmit(signIn)}>
          <label className="account-label">البريد الإلكتروني<input {...register("email")} className="account-input" type="email" dir="ltr" autoComplete="username" maxLength={150} aria-invalid={!!errors.email} />{errors.email && <span role="alert" className="text-xs text-accent">{errors.email.message}</span>}</label>
          <label className="account-label" htmlFor="admin-password">كلمة المرور</label><div className="relative"><input id="admin-password" {...register("password")} className="account-input !pr-14" type={visible ? "text" : "password"} dir="ltr" autoComplete="current-password" maxLength={128} aria-invalid={!!errors.password} /><button type="button" aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"} onClick={() => setVisible(!visible)} className="account-icon-button absolute right-1 top-1 !bg-transparent">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {errors.password && <p role="alert" className="text-xs text-accent">{errors.password.message}</p>}{error && <p role="alert" className="text-sm text-accent">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "جارٍ التحقق…" : "تسجيل الدخول"}</Button>
        </form><p className="mt-5 text-xs leading-7 text-muted">{demo ? "دخول تجريبي محلي لتصوير الواجهات." : "الدخول للحسابات المعتمدة فقط. لا يتوفر إنشاء حساب عام."}</p>
      </section>
    </div>
  </main>;
}
