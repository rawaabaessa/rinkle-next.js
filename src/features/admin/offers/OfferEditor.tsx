"use client";

import { useEffect, useRef, useState } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Info, Search, TicketPercent, X } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { useAdminCatalog } from "../AdminCatalogProvider";
import { AdminFormField } from "../components/AdminFormField";
import { newOffer, offerFormSchema, previewDiscount, type Offer, type OfferFields } from "./offerData";

const optionalNumber = { setValueAs: (value: string | number | null | undefined) => value === "" || value == null ? null : Number(value) };
export function OfferEditor({ offer, kind, onSave, onClose }: {
  offer?: Offer; kind: OfferFields["kind"]; onSave: (values: OfferFields, baseline?: Offer) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { products, categories, loading, error: catalogError } = useAdminCatalog();
  const [defaults] = useState(() => offer ?? newOffer(kind));
  const [discard, setDiscard] = useState(false);
  const [search, setSearch] = useState("");
  const [sample, setSample] = useState(5000);
  const { register, control, handleSubmit, setValue, setError, formState: { errors, isDirty, isSubmitting } } = useForm<OfferFields>({ resolver: zodResolver(offerFormSchema), defaultValues: defaults });
  const values = useWatch({ control }) as OfferFields;
  const { field: targets } = useController({ control, name: "targetIds" });
  useEffect(() => { dialog.current?.showModal(); }, []);
  function close() { if (isDirty) setDiscard(true); else dialog.current?.close(); }
  function accessibility(name: keyof OfferFields) { return { "aria-invalid": !!errors[name], "aria-describedby": errors[name] ? `offer-${name}-error` : undefined }; }
  const choices = values.scope === "products" ? products.map((item) => ({ id: item.id, name: item.name, active: item.available && categories.some((category) => category.slug === item.category && category.active) })) : categories.map((item) => ({ id: item.slug, name: item.name, active: item.active }));
  const missing = targets.value.filter((id) => !choices.some((choice) => choice.id === id)).map((id) => ({ id, name: `عنصر لم يعد موجودًا (${id})`, active: false }));
  const visibleChoices = [...choices, ...missing].filter((choice) => choice.name.includes(search.trim()));
  const discount = previewDiscount(values, sample);
  return <dialog ref={dialog} className="admin-order-dialog offer-dialog" aria-labelledby="offer-editor-title" onClose={onClose} onCancel={(event) => { event.preventDefault(); close(); }}>
    <div className="admin-order-dialog-heading"><div><p className="admin-eyebrow">العروض والكوبونات</p><h2 id="offer-editor-title">{offer ? "تعديل" : "إضافة"} {values.kind === "coupon" ? "كوبون خصم" : "عرض تلقائي"}</h2><p>اضبطي التفاصيل، وراجعي الخصم قبل الحفظ.</p></div><button type="button" className="admin-icon-button" aria-label="إغلاق محرر العرض" onClick={close}><X size={20} /></button></div>
    <form className="admin-order-dialog-body" noValidate onSubmit={(event) => { void handleSubmit((next) => {
      try { onSave(next, offer); dialog.current?.close(); }
      catch (cause) { setError("root", { message: cause instanceof z.ZodError ? cause.issues[0].message : cause instanceof Error ? cause.message : "تعذّر الحفظ. حاولي مجددًا." }); }
    })(event); }}>
      <div className="offer-editor-layout"><div className="offer-editor-fields">
        <fieldset className="offer-fieldset"><legend><span>01</span> تفاصيل العرض</legend>
          <div className="offer-form-grid">
            <AdminFormField id="offer-name" label="اسم العرض *" error={errors.name?.message}><input id="offer-name" {...register("name")} maxLength={80} autoFocus placeholder="مثل: لحظة حلوة مع رينكل" {...accessibility("name")} /></AdminFormField>
            <AdminFormField id="offer-kind" label="طريقة التطبيق *"><select id="offer-kind" {...register("kind")} onChange={(event) => { setValue("kind", event.target.value as OfferFields["kind"], { shouldDirty: true }); if (event.target.value === "automatic") { setValue("code", "", { shouldDirty: true }); setValue("usageLimit", null, { shouldDirty: true }); setValue("perCustomerLimit", null, { shouldDirty: true }); } }}><option value="automatic">عرض تلقائي</option><option value="coupon">كوبون برمز</option></select></AdminFormField>
          </div>
          {values.kind === "coupon" && <AdminFormField id="offer-code" label="رمز الكوبون *" error={errors.code?.message}><input id="offer-code" {...register("code")} dir="ltr" maxLength={24} autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="RINKLE10" {...accessibility("code")} /><p className="admin-help">حروف إنجليزية أو أرقام، ويمكن استخدام - أو _. لا فرق بين الأحرف الكبيرة والصغيرة.</p></AdminFormField>}
          <AdminFormField id="offer-description" label="وصف داخلي (اختياري)" error={errors.description?.message}><textarea id="offer-description" {...register("description")} rows={2} maxLength={300} placeholder="ملاحظات للفريق عن الحملة…" {...accessibility("description")} /></AdminFormField>
        </fieldset>
        <fieldset className="offer-fieldset"><legend><span>02</span> قيمة الخصم وشروطه</legend>
          <div className="offer-form-grid">
            <AdminFormField id="offer-discountType" label="نوع الخصم *"><select id="offer-discountType" {...register("discountType")} onChange={(event) => { setValue("discountType", event.target.value as OfferFields["discountType"], { shouldDirty: true }); setValue("maxDiscount", null, { shouldDirty: true }); }}><option value="percentage">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></AdminFormField>
            <AdminFormField id="offer-discountValue" label={values.discountType === "percentage" ? "النسبة (%) *" : "مبلغ الخصم (ر.ي) *"} error={errors.discountValue?.message}><input id="offer-discountValue" type="number" min="0.01" step="0.01" inputMode="decimal" {...register("discountValue", { valueAsNumber: true })} {...accessibility("discountValue")} /></AdminFormField>
            <AdminFormField id="offer-minimumSubtotal" label="الحد الأدنى للمنتجات المشمولة (ر.ي)" error={errors.minimumSubtotal?.message}><input id="offer-minimumSubtotal" type="number" min="0" step="0.01" inputMode="decimal" {...register("minimumSubtotal", { valueAsNumber: true })} {...accessibility("minimumSubtotal")} /><p className="admin-help">0 يعني دون حد أدنى. لا يشمل رسوم التوصيل.</p></AdminFormField>
            {values.discountType === "percentage" && <AdminFormField id="offer-maxDiscount" label="أقصى مبلغ خصم (ر.ي، اختياري)" error={errors.maxDiscount?.message}><input id="offer-maxDiscount" type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="دون سقف" {...register("maxDiscount", optionalNumber)} {...accessibility("maxDiscount")} /></AdminFormField>}
          </div>
          <AdminFormField id="offer-scope" label="المنتجات المشمولة *"><select id="offer-scope" {...register("scope")} onChange={(event) => { setValue("scope", event.target.value as OfferFields["scope"], { shouldDirty: true }); setValue("targetIds", [], { shouldDirty: true }); setSearch(""); }}><option value="all">جميع المنتجات</option><option value="products">منتجات محددة</option><option value="categories">أقسام محددة</option></select></AdminFormField>
          {values.scope !== "all" && <div className="offer-targets"><div className="offer-targets-heading"><strong>{values.scope === "products" ? "اختاري المنتجات" : "اختاري الأقسام"}</strong><span>المحدد: {targets.value.length}</span></div><label className="admin-search"><Search size={17} aria-hidden="true" /><input type="search" aria-label="البحث في العناصر المشمولة" placeholder="بحث في القائمة" value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="offer-target-list" role="group" aria-label="العناصر المشمولة" aria-describedby={errors.targetIds ? "offer-targetIds-error" : undefined}>{visibleChoices.map((choice, index) => <label key={choice.id}><input ref={index === 0 ? targets.ref : undefined} type="checkbox" checked={targets.value.includes(choice.id)} onChange={(event) => targets.onChange(event.target.checked ? [...targets.value, choice.id] : targets.value.filter((id) => id !== choice.id))} /><span>{choice.name}{!choice.active && <small>غير متاح حاليًا</small>}</span></label>)}{!visibleChoices.length && <p className="admin-help">لا توجد عناصر مطابقة.</p>}</div>{errors.targetIds && <p id="offer-targetIds-error" className="admin-field-error" role="alert">{errors.targetIds.message}</p>}<p className="admin-help">تحديد منتج أو قسم متوقف لا يجعله متاحًا للطلب.</p></div>}
        </fieldset>
        <fieldset className="offer-fieldset"><legend><span>03</span> الصلاحية والاستخدام</legend>
          <div className="offer-form-grid">
            <AdminFormField id="offer-startsOn" label="تاريخ البداية *" error={errors.startsOn?.message}><input id="offer-startsOn" type="date" {...register("startsOn")} {...accessibility("startsOn")} /></AdminFormField>
            <AdminFormField id="offer-endsOn" label="تاريخ النهاية (اختياري)" error={errors.endsOn?.message}><input id="offer-endsOn" type="date" {...register("endsOn")} {...accessibility("endsOn")} /></AdminFormField>
          </div><p className="admin-help">بداية يوم البداية حتى نهاية يوم النهاية بتوقيت اليمن. اتركي النهاية فارغة لصلاحية مفتوحة.</p>
          {values.kind === "coupon" && <div className="offer-form-grid">
            <AdminFormField id="offer-usageLimit" label="حد الاستخدام الكلي (اختياري)" error={errors.usageLimit?.message}><input id="offer-usageLimit" type="number" min="1" step="1" inputMode="numeric" placeholder="دون حد" {...register("usageLimit", optionalNumber)} {...accessibility("usageLimit")} /></AdminFormField>
            <AdminFormField id="offer-perCustomerLimit" label="حد الاستخدام لكل عميل (اختياري)" error={errors.perCustomerLimit?.message}><input id="offer-perCustomerLimit" type="number" min="1" step="1" inputMode="numeric" placeholder="دون حد" {...register("perCustomerLimit", optionalNumber)} {...accessibility("perCustomerLimit")} /></AdminFormField>
          </div>}
          <AdminFormField id="offer-state" label="حالة الحفظ"><select id="offer-state" {...register("state")}><option value="draft">مسودة</option><option value="active">مفعّل بحسب فترة الصلاحية</option><option value="paused">موقوف</option></select></AdminFormField>
        </fieldset>
      </div><aside className="offer-preview" aria-label="معاينة الخصم"><div className="offer-preview-ticket"><TicketPercent size={26} aria-hidden="true" /><p>{values.kind === "coupon" ? "كوبون خصم" : "عرض تلقائي"}</p><h3>{values.name || "لحظة أحلى مع رينكل"}</h3><strong>{Number.isFinite(values.discountValue) ? values.discountType === "percentage" ? `${values.discountValue}٪` : formatPrice(values.discountValue) : "—"}</strong><span>{values.kind === "coupon" ? <bdi>{values.code.trim().toUpperCase() || "رمز الكوبون"}</bdi> : "يُطبّق دون رمز عند الربط"}</span></div><div className="offer-preview-calculator"><h3>جرّبي قيمة الخصم</h3><label htmlFor="offer-sample">قيمة منتجات مشمولة (ر.ي)</label><input id="offer-sample" type="number" min="0" step="0.01" value={Number.isFinite(sample) ? sample : ""} onChange={(event) => setSample(event.target.valueAsNumber)} /><dl><div><dt>الخصم</dt><dd><bdi>{formatPrice(Number.isFinite(discount) ? discount : 0)}</bdi></dd></div><div><dt>بعد الخصم</dt><dd><bdi>{formatPrice(Number.isFinite(sample - discount) ? Math.max(0, sample - discount) : 0)}</bdi></dd></div></dl><p>مثال حسابي للخصم فقط؛ دون توصيل أو التحقق من التاريخ وحدود الاستخدام.</p>{sample < values.minimumSubtotal && <p className="offer-preview-warning">القيمة أقل من الحد الأدنى المحدد.</p>}</div><p className="offer-preview-note"><Info size={16} />لا تُجمع الخصومات في هذه المعاينة. قواعد الجمع وتطبيقها في الدفع تُحدّد عند الربط.</p></aside></div>
      {(catalogError || errors.root) && <p className="admin-alert admin-alert-error" role="alert">{catalogError || errors.root?.message}</p>}
      {discard && <div className="offer-discard" role="alert"><p>لديك تعديلات غير محفوظة. هل تريدين تجاهلها؟</p><div><button type="button" className="admin-button admin-button-secondary" onClick={() => setDiscard(false)}>متابعة التعديل</button><button type="button" className="admin-button" onClick={() => dialog.current?.close()}>تجاهل وإغلاق</button></div></div>}
      <div className="offer-editor-footer"><span>الحفظ للمعاينة المحلية؛ لا يغيّر أسعار المتجر.</span><div><button type="button" className="admin-button admin-button-secondary" onClick={close}>إلغاء</button><button type="submit" className="admin-button" disabled={isSubmitting || loading || !!catalogError}><Check size={17} />{isSubmitting ? "جارٍ الحفظ…" : "حفظ العرض"}</button></div></div>
    </form>
  </dialog>;
}
