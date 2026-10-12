"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import type { AdminPhoto } from "../types";
import { AdminIcon } from "./AdminIcon";

async function readPhoto(file: File): Promise<AdminPhoto> {
  if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("حجم كل صورة يجب أن يكون أقل من أو يساوي 5 ميغابايت، وألا تكون فارغة.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("اختاري صورًا بصيغة JPG أو PNG أو WebP فقط.");
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذّرت قراءة الصورة. جرّبي ملفًا آخر."));
    reader.readAsDataURL(file);
  });
  await new Promise<void>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => { image.src = ""; resolve(); };
    image.onerror = () => reject(new Error("تعذّر عرض إحدى الصور. تأكدي من صلاحية الملف."));
    image.src = src;
  });
  return { id: crypto.randomUUID(), src, alt: file.name };
}

export function PhotoUploader({ photos, onChange, error, onBusy }: { photos: AdminPhoto[]; onChange: (photos: AdminPhoto[]) => void; error?: string; onBusy: (busy: boolean) => void }) {
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(false);
  const processing = useRef(false);
  async function select(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = "";
    if (!files.length || processing.current) return;
    setUploadError("");
    if (photos.length + files.length > 6) { setUploadError("يمكنك إضافة حتى 6 صور للمنتج. احذفي صورة قبل إضافة المزيد."); return; }
    processing.current = true;
    setLoading(true); onBusy(true);
    try { onChange([...photos, ...await Promise.all(files.map(readPhoto))]); }
    catch (reason) { setUploadError(reason instanceof Error ? reason.message : "تعذّرت إضافة الصور."); }
    finally { processing.current = false; setLoading(false); onBusy(false); }
  }
  return <>
    <label className={`admin-upload ${loading ? "is-loading" : ""}`}><input id="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={loading || photos.length >= 6} onChange={select} aria-label="إضافة صور المنتج" aria-describedby="photo-hint photo-errors" /><span className="admin-upload-icon"><AdminIcon name="image" /></span><strong>{loading ? "جارٍ تجهيز الصور…" : photos.length >= 6 ? "اكتمل عدد الصور" : "اختاري صورًا تشهّي"}</strong><span>اضغطي لاختيار صورة أو أكثر</span><small id="photo-hint">JPG، PNG، WebP · حتى 6 صور · 5 MB للصورة</small></label>
    <div id="photo-errors" role={uploadError || error ? "alert" : undefined} className="admin-field-error">{uploadError || error}</div>
    {photos.length > 0 && <div className="admin-photos">{photos.map((photo, index) => <div className="admin-photo" key={photo.id}><Image src={photo.src} alt={`صورة المنتج ${index + 1}`} width={150} height={150} unoptimized={photo.src.startsWith("data:")} /><button type="button" disabled={loading} className="admin-photo-remove" aria-label={`إزالة الصورة ${index + 1}`} onClick={() => onChange(photos.filter((item) => item.id !== photo.id))}><AdminIcon name="close" /></button><button type="button" disabled={loading} className={`admin-photo-primary ${index === 0 ? "is-primary" : ""}`} onClick={() => onChange([photo, ...photos.filter((item) => item.id !== photo.id)])} aria-pressed={index === 0}>{index === 0 ? "✓ الصورة الرئيسية" : "اجعليها الرئيسية"}</button></div>)}</div>}
    <p className="admin-help">الصورة الرئيسية تظهر في بطاقة المنتج. تقدرين تغيّرينها في أي وقت.</p>
  </>;
}
