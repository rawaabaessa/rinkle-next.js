"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { useAdminCatalog } from "../AdminCatalogProvider";
import { adminCategories } from "../catalogStore";
import { fromProductForm, toProductForm, validateProductForm, type ProductFormState } from "../productForm";
import type { AdminProduct } from "../types";
import { AdminIcon } from "./AdminIcon";
import { PhotoUploader } from "./PhotoUploader";

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="admin-toggle-row"><span><strong>{label}</strong><small>{hint}</small></span><input type="checkbox" role="switch" aria-label={label} checked={checked} onChange={(event) => onChange(event.target.checked)} /><span className="admin-switch" aria-hidden="true" /></label>;
}
function Field({ id, label, error, children, optional = false }: { id: string; label: string; error?: string; children: ReactNode; optional?: boolean }) {
  return <div className="admin-field"><label htmlFor={id}>{label}<span>{optional ? "اختياري" : "*"}</span></label>{children}{error && <p id={`${id}-error`} className="admin-field-error">{error}</p>}</div>;
}

function Editor({ product }: { product?: AdminProduct }) {
  const { saveProduct, busy } = useAdminCatalog();
  const router = useRouter();
  const [form, setForm] = useState(() => toProductForm(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const discard = useRef<HTMLDialogElement>(null);
  const destination = useRef("/dashboard/products");
  const allowNavigation = useRef(false);
  const errorSummary = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { if (!allowNavigation.current) event.preventDefault(); };
    const navigate = (event: MouseEvent) => {
      if (allowNavigation.current || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.target === "_blank" || anchor.getAttribute("href")?.startsWith("#")) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin || url.href === location.href) return;
      event.preventDefault(); event.stopPropagation();
      destination.current = url.pathname + url.search + url.hash;
      discard.current?.showModal();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", navigate, true);
    return () => { window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("click", navigate, true); };
  }, [dirty]);

  function change<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setErrors((current) => ({ ...current, [key]: "" }));
  }
  function inputError(id: string) { return { "aria-invalid": Boolean(errors[id]), "aria-describedby": errors[id] ? `${id}-error` : undefined }; }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || busy) return;
    const validation = validateProductForm(form);
    setErrors(validation);
    if (Object.keys(validation).length) { requestAnimationFrame(() => errorSummary.current?.focus()); return; }
    const saved = await saveProduct(fromProductForm(form, product?.id ?? crypto.randomUUID()));
    if (saved) { allowNavigation.current = true; setDirty(false); router.push("/dashboard/products"); }
  }
  function cancel() {
    if (dirty) { destination.current = "/dashboard/products"; discard.current?.showModal(); }
    else router.push("/dashboard/products");
  }
  const previewPrice = form.hasSizes ? (form.sizes.length ? Math.min(...form.sizes.map((size) => Number(size.price) || 0)) : 0) : Number(form.price) || 0;
  return <>
    <Link className="admin-back-link" href="/dashboard/products"><AdminIcon name="arrow" />العودة للمنتجات</Link>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">تفاصيل تُظهر حلاوة منتجك</p><h1>{product ? "تعديل المنتج" : "إضافة منتج جديد"}</h1><p>{product ? `كل تفاصيل «${product.name}» في مكان واحد.` : "خلّينا نضيف شيئًا حلوًا لتشكيلة رينكل."}</p></div><span className="admin-soft-badge">{dirty ? "تغييرات غير محفوظة" : product ? "منتج من تشكيلتك" : "منتج جديد"}</span></div>
    <form onSubmit={submit} noValidate id="admin-product-form">
      {Object.values(errors).some(Boolean) && <div ref={errorSummary} tabIndex={-1} className="admin-alert admin-alert-error" role="alert"><strong>راجعي هذه التفاصيل قبل الحفظ:</strong><ul>{Object.entries(errors).filter(([, value]) => value).map(([key, message]) => <li key={key}><a href={`#${key}`} onClick={() => document.getElementById(key)?.focus()}>{message}</a></li>)}</ul></div>}
      <div className="admin-editor-grid"><div className="admin-editor-main">
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2><span className="admin-section-number">01</span>صور المنتج</h2><p>أول انطباع يبدأ بصورة حلوة وواضحة.</p></div><AdminIcon name="image" /></div><PhotoUploader photos={form.photos} onChange={(photos) => change("photos", photos)} error={errors.photos} onBusy={setUploading} /></section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2><span className="admin-section-number">02</span>البيانات الأساسية</h2><p>عرّفي عملاءك على منتجك وتفاصيله.</p></div></div><div className="admin-form-fields">
          <Field id="name" label="اسم المنتج" error={errors.name}><input id="name" value={form.name} maxLength={100} onChange={(event) => change("name", event.target.value)} placeholder="مثلاً: كيك كوكيز الماربل" required {...inputError("name")} /></Field>
          <Field id="category" label="القسم" error={errors.category}><select id="category" value={form.category} onChange={(event) => change("category", event.target.value)} {...inputError("category")}>{adminCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></Field>
          <Field id="description" label="وصف المنتج" error={errors.description}><textarea id="description" rows={4} value={form.description} maxLength={2000} onChange={(event) => change("description", event.target.value)} placeholder="اكتبي النكهة، المكونات، وكل شيء يميّز منتجك…" required {...inputError("description")} /><span className="admin-character-count">{form.description.length} / 2000</span></Field>
          <Field id="deliveryEstimate" label="وقت التجهيز / التوصيل المتوقع" optional><input id="deliveryEstimate" value={form.deliveryEstimate} maxLength={150} onChange={(event) => change("deliveryEstimate", event.target.value)} placeholder="مثلاً: خلال 24–48 ساعة من تأكيد الطلب" /></Field>
        </div></section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2><span className="admin-section-number">03</span>السعر والأحجام</h2><p>سعر واحد، أو سعر مستقل لكل حجم.</p></div><AdminIcon name="size" /></div><Toggle label="هذا المنتج له أحجام" hint="اختياري — مثل 10 سم، 14 سم، أو صغير وكبير" checked={form.hasSizes} onChange={(value) => { change("hasSizes", value); if (value && !form.sizes.length) change("sizes", [{ id: crypto.randomUUID(), label: "", price: "", servings: "" }]); }} />
          {form.hasSizes ? <div className="admin-sizes" id="sizes" tabIndex={-1}><p className="admin-help">كل حجم له سعره. عدد الأشخاص اختياري.</p>{form.sizes.map((size, index) => <div className="admin-size-row" key={size.id}><Field id={`size-${index}-label`} label={`الحجم ${index + 1}`} error={errors[`size-${index}-label`]}><input id={`size-${index}-label`} value={size.label} maxLength={40} placeholder="10 سم" onChange={(event) => change("sizes", form.sizes.map((item) => item.id === size.id ? { ...item, label: event.target.value } : item))} {...inputError(`size-${index}-label`)} /></Field><Field id={`size-${index}-price`} label="السعر (ر.ي)" error={errors[`size-${index}-price`]}><input id={`size-${index}-price`} type="number" min="0.01" step="0.01" inputMode="decimal" value={size.price} placeholder="3000" onChange={(event) => change("sizes", form.sizes.map((item) => item.id === size.id ? { ...item, price: event.target.value } : item))} {...inputError(`size-${index}-price`)} /></Field><Field id={`size-${index}-servings`} label="يكفي كم شخص؟" optional><input id={`size-${index}-servings`} value={size.servings} maxLength={40} placeholder="شخصين" onChange={(event) => change("sizes", form.sizes.map((item) => item.id === size.id ? { ...item, servings: event.target.value } : item))} /></Field><button type="button" className="admin-icon-button admin-remove-size" aria-label={`حذف الحجم ${index + 1}`} onClick={() => change("sizes", form.sizes.filter((item) => item.id !== size.id))}><AdminIcon name="close" /></button></div>)}{errors.sizes && <p id="sizes-error" className="admin-field-error">{errors.sizes}</p>}<button type="button" className="admin-add-size" onClick={() => change("sizes", [...form.sizes, { id: crypto.randomUUID(), label: "", price: "", servings: "" }])}><AdminIcon name="plus" />إضافة حجم آخر</button></div> : <div className="admin-option-content"><Field id="price" label="سعر المنتج (ر.ي)" error={errors.price}><input id="price" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.price} onChange={(event) => change("price", event.target.value)} placeholder="0" required {...inputError("price")} /></Field></div>}
        </section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2><span className="admin-section-number">04</span>لمسات إضافية</h2><p>خيارات تخلي المنتج على ذوق العميل.</p></div></div><Toggle label="السماح بالكتابة على المنتج" hint="تفعيل خيار كتابة عبارة خاصة" checked={form.writingEnabled} onChange={(value) => change("writingEnabled", value)} />{form.writingEnabled && <div className="admin-option-content"><fieldset id="languages" tabIndex={-1}><legend>اللغات المتاحة</legend><div className="admin-language-options"><label><input type="checkbox" checked={form.arabic} onChange={(event) => change("arabic", event.target.checked)} />العربية</label><label><input type="checkbox" checked={form.english} onChange={(event) => change("english", event.target.checked)} />English</label></div>{errors.languages && <p id="languages-error" className="admin-field-error">{errors.languages}</p>}</fieldset><Field id="maxLength" label="الحد الأقصى للحروف" error={errors.maxLength}><input id="maxLength" type="number" min="1" max="200" step="1" value={form.maxLength} onChange={(event) => change("maxLength", event.target.value)} {...inputError("maxLength")} /></Field></div>}<div className="admin-option-divider" /><Toggle label="إمكانية إضافة شمعة" hint="يختار العميل إضافة شمعة مع المنتج" checked={form.candleEnabled} onChange={(value) => change("candleEnabled", value)} />{form.candleEnabled && <div className="admin-option-content"><Field id="candlePrice" label="سعر إضافة الشمعة (ر.ي)" error={errors.candlePrice}><input id="candlePrice" type="number" inputMode="decimal" min="0" step="0.01" value={form.candlePrice} onChange={(event) => change("candlePrice", event.target.value)} {...inputError("candlePrice")} /></Field><p className="admin-help">اكتبي 0 إذا كانت الشمعة مجانية.</p></div>}</section>
      </div>
      <aside className="admin-editor-aside"><section className="admin-panel"><div className="admin-panel-heading"><h2>حالة المنتج</h2><span className={`admin-status ${form.available ? "is-available" : "is-unavailable"}`}>{form.available ? "متوفر" : "غير متوفر"}</span></div><Toggle label="متوفر للطلب" hint="يمكنك إيقاف التوفر مؤقتًا" checked={form.available} onChange={(value) => { change("available", value); if (!value) change("availableToday", false); }} />{form.available && <div className="admin-option-content"><label className="admin-checkbox"><input type="checkbox" checked={form.availableToday} onChange={(event) => change("availableToday", event.target.checked)} /><span>جاهز للتسليم اليوم<small>فعّليه فقط للمنتج الجاهز بالفعل.</small></span></label></div>}</section>
        <section className="admin-panel admin-live-preview"><div className="admin-panel-heading"><h2>نظرة على منتجك</h2><span className="admin-soft-badge">معاينة</span></div><div className="admin-preview-image">{form.photos[0] ? <Image src={form.photos[0].src} alt="معاينة الصورة الرئيسية" width={320} height={260} unoptimized={form.photos[0].src.startsWith("data:")} /> : <><AdminIcon name="image" /><span>صورتك الحلوة تظهر هنا</span></>}</div><p className="admin-eyebrow">{adminCategories.find((category) => category.slug === form.category)?.name}</p><h3>{form.name.trim() || "اسم منتجك الحلو"}</h3><p className="admin-preview-description">{form.description.trim() || "وصف بسيط يحكي للعميل عن منتجك."}</p><strong className="admin-preview-price">{form.hasSizes && <small>ابتداءً من </small>}{previewPrice ? formatPrice(previewPrice) : "أضيفي السعر"}</strong><div className="admin-mini-tags">{form.hasSizes && <span><AdminIcon name="size" />{form.sizes.length} أحجام</span>}{form.writingEnabled && <span><AdminIcon name="writing" />كتابة خاصة</span>}{form.candleEnabled && <span><AdminIcon name="candle" />شمعة</span>}</div></section>
        <div className="admin-editor-tip"><AdminIcon name="image" /><strong>تفاصيل أوضح، اختيار أسهل</strong><p>صوّري المنتج بإضاءة طبيعية، وأضيفي عدد الأشخاص لكل حجم. واذكري مكونات الحساسية في الوصف إذا وُجدت.</p></div>
      </aside></div>
      <div className="admin-save-bar"><p><AdminIcon name="check" />{uploading ? "جارٍ تجهيز الصور…" : "يُحفظ على هذا المتصفح — النشر في المتجر لاحقًا"}</p><div><button type="button" className="admin-button admin-button-secondary" onClick={cancel} disabled={busy}>إلغاء</button><button type="submit" className="admin-button" disabled={busy || uploading}><AdminIcon name="check" />{busy ? "جارٍ الحفظ…" : "حفظ المنتج"}</button></div></div>
    </form>
    <dialog ref={discard} className="admin-discard-dialog" aria-labelledby="discard-title"><h2 id="discard-title">عندك تغييرات غير محفوظة</h2><p>إذا غادرتِ الآن، لن تُحفظ تعديلات هذا المنتج.</p><div><button type="button" className="admin-button" onClick={() => discard.current?.close()}>متابعة التعديل</button><button type="button" className="admin-button admin-button-secondary" onClick={() => { allowNavigation.current = true; discard.current?.close(); router.push(destination.current); }}>مغادرة دون حفظ</button></div></dialog>
  </>;
}

export function ProductEditor({ id }: { id?: string }) {
  const { products, loading, error } = useAdminCatalog();
  if (loading) return <div className="admin-panel admin-loading" role="status">جارٍ تحميل بيانات المنتج…</div>;
  if (error && !products.length) return <div className="admin-panel admin-empty"><h1>تعذّر تحميل بيانات التجربة</h1><p>أعيدي تحميل الصفحة بعد السماح بالتخزين.</p></div>;
  const product = id ? products.find((item) => item.id === id) : undefined;
  if (id && !product) return <div className="admin-panel admin-empty"><AdminIcon name="box" /><h1>المنتج غير موجود في هذه التجربة</h1><p>قد يكون محفوظًا على متصفح أو جهاز آخر.</p><Link href="/dashboard/products" className="admin-button">العودة للمنتجات</Link></div>;
  return <Editor key={id ?? "new"} product={product} />;
}
