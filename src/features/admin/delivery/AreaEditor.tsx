"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { areaFormSchema } from "@/features/delivery/validation";
import type { DeliveryArea } from "@/features/delivery/types";
import { AdminIcon } from "../components/AdminIcon";

type Values = { name: string; fee: string; active: boolean };
export function AreaEditor({ area, onSave, onClose }: { area?: DeliveryArea; onSave: (area: DeliveryArea) => Promise<void>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useRef(area?.id ?? "");
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(areaFormSchema), defaultValues: { name: area?.name ?? "", fee: area ? String(area.fee) : "", active: area?.active ?? true } });
  useEffect(() => { if (!dialog.current?.open) dialog.current?.showModal(); }, []);
  const submit = (event: FormEvent<HTMLFormElement>) => handleSubmit(async (values) => {
    try {
      id.current ||= crypto.randomUUID();
      await onSave({ id: id.current, name: values.name.trim(), fee: Number(values.fee), active: values.active });
      dialog.current?.close();
    } catch (error) { setError("root", { message: error instanceof Error ? error.message : "تعذّر الحفظ. حاولي مجددًا." }); }
  })(event);
  return <dialog ref={dialog} className="admin-order-dialog admin-area-dialog" aria-labelledby="area-editor-title" onClose={onClose} onCancel={(event) => { if (isSubmitting) event.preventDefault(); }}>
    <div className="admin-order-dialog-heading"><div><p className="admin-eyebrow">مساحة جديدة للحلاوة</p><h2 id="area-editor-title">{area ? "تعديل منطقة التوصيل" : "إضافة منطقة توصيل"}</h2><p>رسوم ثابتة لجميع العناوين داخل المنطقة.</p></div><button type="button" disabled={isSubmitting} className="admin-icon-button" aria-label="إغلاق منطقة التوصيل" onClick={() => dialog.current?.close()}><AdminIcon name="close" /></button></div>
    <form className="admin-order-dialog-body" onSubmit={submit} noValidate>
      <div className="admin-field"><label htmlFor="area-name">اسم المنطقة أو المدينة</label><input id="area-name" {...register("name")} autoFocus maxLength={80} disabled={isSubmitting} placeholder="مثل: غيل باوزير" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "area-name-error" : undefined} />{errors.name && <p id="area-name-error" className="admin-field-error">{errors.name.message}</p>}</div>
      <div className="admin-field admin-area-fee"><label htmlFor="area-fee">رسوم التوصيل بالريال</label><input id="area-fee" {...register("fee")} inputMode="numeric" disabled={isSubmitting} placeholder="1000" aria-invalid={Boolean(errors.fee)} aria-describedby={errors.fee ? "area-fee-error" : "area-fee-hint"} />{errors.fee && <p id="area-fee-error" className="admin-field-error">{errors.fee.message}</p>}<p id="area-fee-hint" className="admin-order-state-hint">يمكن إدخال صفر للتوصيل المجاني. السعر الجديد يخص الطلبات الجديدة فقط.</p></div>
      <label className="admin-checkbox"><input type="checkbox" {...register("active")} disabled={isSubmitting} /><span>تفعيل التوصيل لهذه المنطقة<small>المناطق المتوقفة لا يمكن اختيارها في صفحة الدفع.</small></span></label>
      {errors.root && <p className="admin-alert admin-alert-error" role="alert">{errors.root.message}</p>}
      <div className="admin-order-dialog-actions"><button type="button" className="admin-button admin-button-secondary" disabled={isSubmitting} onClick={() => dialog.current?.close()}>إلغاء</button><button type="submit" className="admin-button" disabled={isSubmitting}><AdminIcon name="check" />{isSubmitting ? "جارٍ الحفظ…" : "حفظ المنطقة"}</button></div>
    </form>
  </dialog>;
}
