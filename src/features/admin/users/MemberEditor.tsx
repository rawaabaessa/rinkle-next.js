"use client";
import { useEffect, useRef, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { AdminFormField } from "../components/AdminFormField";
import { roles, userFormSchema, type Member, type UserFields } from "./userData";

export function MemberEditor({ member, onSave, onClose }: { member?: Member; onSave: (member: Member) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<UserFields>({ resolver: zodResolver(userFormSchema), defaultValues: { name: member?.name ?? "", email: member?.email ?? "", role: member && member.role !== "owner" ? member.role : "orders", status: member?.status ?? "invited" } });
  useEffect(() => { dialog.current?.showModal(); }, []);
  const submit = (event: FormEvent<HTMLFormElement>) => handleSubmit((values) => {
    try { onSave({ ...values, id: member?.id ?? crypto.randomUUID(), created: member?.created ?? new Date().toISOString().slice(0, 10) }); dialog.current?.close(); }
    catch (error) { setError("root", { message: error instanceof Error ? error.message : "تعذّر الحفظ المحلي. حاولي مجددًا." }); }
  })(event);
  return <dialog ref={dialog} className="admin-order-dialog admin-area-dialog" aria-labelledby="member-title" onClose={onClose}><div className="admin-order-dialog-heading"><div><p className="admin-eyebrow">فريق رينكل</p><h2 id="member-title">{member ? "تعديل عضو الفريق" : "إضافة عضو للفريق"}</h2><p>حساب تجريبي محلي، دون إرسال دعوة بالبريد.</p></div><button className="admin-icon-button" onClick={() => dialog.current?.close()} aria-label="إغلاق عضو الفريق"><X /></button></div><form className="admin-order-dialog-body" noValidate onSubmit={submit}>
    <AdminFormField id="member-name" label="الاسم" error={errors.name?.message}><input id="member-name" {...register("name")} maxLength={80} autoFocus aria-invalid={!!errors.name} aria-describedby={errors.name ? "member-name-error" : undefined} /></AdminFormField>
    <AdminFormField id="member-email" label="البريد الإلكتروني" error={errors.email?.message}><input id="member-email" {...register("email")} type="email" dir="ltr" maxLength={150} placeholder="name@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "member-email-error" : undefined} /></AdminFormField>
    <div className="admin-management-grid"><AdminFormField id="member-role" label="الدور" error={errors.role?.message}><select id="member-role" {...register("role")}>{Object.entries(roles).filter(([role]) => role !== "owner").map(([role, label]) => <option key={role} value={role}>{label}</option>)}</select></AdminFormField><AdminFormField id="member-status" label="حالة الحساب" error={errors.status?.message}><select id="member-status" {...register("status")}><option value="invited">بانتظار التفعيل</option><option value="active">نشط</option><option value="paused">موقوف</option></select></AdminFormField></div>
    <p className="admin-order-state-hint">اختيار الدور والحالة للعرض فقط، ولا يمنح صلاحيات دخول فعلية. لا تحتاجين لإدخال كلمة مرور.</p>{errors.root && <p role="alert" className="admin-alert admin-alert-error">{errors.root.message}</p>}<div className="admin-order-dialog-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => dialog.current?.close()}>إلغاء</button><button type="submit" disabled={isSubmitting} className="admin-button"><Check size={17} />حفظ العضو</button></div>
  </form></dialog>;
}
