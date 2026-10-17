"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ImagePlus, X } from "lucide-react";
import { useAdminCatalog } from "../AdminCatalogProvider";
import { AdminFormField } from "../components/AdminFormField";
import { readPhoto } from "../components/PhotoUploader";
import { categoryFormSchema, normalizeCategoryName, type AdminCategory, type CategoryValues } from "./categoryData";

export function CategoryEditor({ category, onClose }: { category?: AdminCategory; onClose: () => void }) {
  const { categories, saveCategory } = useAdminCatalog();
  const dialog = useRef<HTMLDialogElement>(null);
  const slug = useRef(category?.slug ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [discard, setDiscard] = useState(false);
  const { register, control, setValue, setError, setFocus, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<CategoryValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: category?.name ?? "", description: category?.description ?? "", image: category?.image ?? "", active: category?.active ?? true },
  });
  const image = useWatch({ control, name: "image" });
  const busy = uploading || isSubmitting;
  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
    setFocus("name");
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [setFocus]);
  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);
  function close() { if (!busy) { if (isDirty) setDiscard(true); else dialog.current?.close(); } }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    setUploading(true); setUploadError("");
    try { const photo = await readPhoto(file); setValue("image", photo.src, { shouldDirty: true, shouldValidate: true }); }
    catch (reason) { setUploadError(reason instanceof Error ? reason.message : "تعذّرت قراءة الصورة."); }
    finally { setUploading(false); }
  }
  const submit = (event: FormEvent<HTMLFormElement>) => handleSubmit(async (values) => {
    if (uploading) return;
    if (categories.some((item) => item.slug !== category?.slug && normalizeCategoryName(item.name) === normalizeCategoryName(values.name))) {
      setError("name", { message: "يوجد قسم بهذا الاسم بالفعل." }, { shouldFocus: true }); return;
    }
    slug.current ||= `category-${crypto.randomUUID()}`;
    if (await saveCategory({ ...values, slug: slug.current })) dialog.current?.close();
    else setError("root", { message: "لم يتم حفظ القسم. قد يكون الاسم مستخدمًا في تبويب آخر أو التخزين ممتلئًا؛ راجعي الاسم وحجم الصورة وحاولي مجددًا." });
  })(event);
  return <dialog ref={dialog} className="admin-order-dialog admin-category-dialog" aria-labelledby="category-editor-title" onClose={onClose} onCancel={(event) => { event.preventDefault(); close(); }}>
    <div className="admin-order-dialog-heading"><div><p className="admin-eyebrow">كل حلاوة، في مكانها</p><h2 id="category-editor-title">{category ? "تعديل القسم" : "إضافة قسم جديد"}</h2><p>اسم وصورة يعرّفان بتشكيلتك من أول نظرة.</p></div><button type="button" className="admin-icon-button" aria-label="إغلاق محرر القسم" disabled={busy} onClick={close}><X /></button></div>
    <form className="admin-order-dialog-body" onSubmit={submit} noValidate>
      <fieldset disabled={busy} className="admin-category-fields">
        <AdminFormField id="category-name" label="اسم القسم" error={errors.name?.message}><input id="category-name" {...register("name")} maxLength={60} autoFocus placeholder="مثل: تشيز كيك" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "category-name-error" : undefined} /></AdminFormField>
        <AdminFormField id="category-description" label="وصف قصير (اختياري)" error={errors.description?.message}><textarea id="category-description" {...register("description")} rows={3} maxLength={200} placeholder="وصف بسيط يميز هذا القسم…" aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "category-description-error" : undefined} /></AdminFormField>
        <div className="admin-category-image-field"><span>صورة القسم (اختياري)</span><div className="admin-category-image-row"><div className="admin-category-image-preview">{image ? <Image src={image} alt="معاينة صورة القسم" width={112} height={112} unoptimized={image.startsWith("data:")} /> : <ImagePlus aria-hidden="true" />}</div><div><label className="admin-button admin-button-secondary admin-category-upload"><ImagePlus aria-hidden="true" />{uploading ? "جارٍ تجهيز الصورة…" : image ? "تغيير الصورة" : "اختيار صورة"}<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="اختيار صورة القسم" onChange={upload} /></label><p className="admin-help">JPG، PNG، WebP · حتى 5 MB</p>{image && <button type="button" className="admin-text-link" onClick={() => setValue("image", "", { shouldDirty: true, shouldValidate: true })}>إزالة الصورة</button>}</div></div>{(uploadError || errors.image) && <p className="admin-field-error" role="alert">{uploadError || errors.image?.message}</p>}</div>
        <label className="admin-toggle-row"><span><strong>قسم مفعّل</strong><small>يمكن اختياره عند إضافة المنتجات. الإيقاف يحتفظ بالمنتجات المرتبطة.</small></span><input type="checkbox" role="switch" aria-label="قسم مفعّل" {...register("active")} /><span className="admin-switch" aria-hidden="true" /></label>
      </fieldset>
      {errors.root && <p className="admin-alert admin-alert-error" role="alert">{errors.root.message}</p>}
      {discard ? <div className="admin-category-discard" role="alert"><p>عندك تعديلات غير محفوظة. هل تريدين إغلاقها؟</p><div className="admin-order-dialog-actions"><button type="button" className="admin-button admin-button-secondary" onClick={() => dialog.current?.close()}>تجاهل التعديلات</button><button type="button" className="admin-button" onClick={() => setDiscard(false)}>متابعة التعديل</button></div></div> : <div className="admin-order-dialog-actions"><button type="button" className="admin-button admin-button-secondary" disabled={busy} onClick={close}>إلغاء</button><button type="submit" className="admin-button" disabled={busy}><Check />{isSubmitting ? "جارٍ الحفظ…" : "حفظ القسم"}</button></div>}
    </form>
  </dialog>;
}
