"use client";

import Image from "next/image";
import { useDeliveryAreas } from "@/features/delivery/useDeliveryAreas";
import { deliveryAreasTransaction } from "@/features/delivery/deliveryStore";
import { quoteDelivery } from "@/features/delivery/validation";
import type { DeliveryQuote } from "@/features/delivery/types";
import type { FieldName } from "@/features/checkout/types";
import { CustomerForm } from "@/features/checkout/components/CustomerForm";
import { DeliveryForm } from "@/features/checkout/components/DeliveryForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeftIcon, CloseIcon } from "@/components/ui/IconSet";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/features/cart/useCart";
import { useOrderDraft } from "@/features/checkout/useOrderDraft";
import { validateOrderDraft, validateReceipt } from "@/features/checkout/validation";
import { EmptyCart } from "@/features/cart/components/EmptyCart";
import { focus, panelClass } from "@/components/ui/controlStyles";
import { OrderIcon } from "@/components/ui/OrderIcon";
import { CartSummary } from "@/features/cart/components/CartSummary";




export function CheckoutPage() {
  const { items, count, total } = useCart();
  const { draft, receipt, updateDraft, setReceipt } = useOrderDraft();
  const { areas, loading: areasLoading, error: areasError, retry: retryAreas } = useDeliveryAreas();
  const selectedArea = !areasError && !areasLoading ? areas.find((area) => area.id === draft.deliveryAreaId && area.active) : undefined;
  const [deliveryReview, setDeliveryReview] = useState<(DeliveryQuote & { productsTotal: number }) | null>(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const deliveryChecking = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receiptError, setReceiptError] = useState("");
  const [checkingFile, setCheckingFile] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadVersion = useRef(0);
  const review = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);

  function changeField(name: FieldName, value: string) {
    updateDraft(name === "deliveryAreaId" ? { deliveryAreaId: value, city: areas.find((area) => area.id === value)?.name ?? "" } : { [name]: value });
    setErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  }

  async function selectReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const version = ++uploadVersion.current;
    setCheckingFile(true);
    setReceiptError("");
    setReceipt(null);
    const error = await validateReceipt(file);
    if (version !== uploadVersion.current) return;
    setCheckingFile(false);
    if (error) { setReceiptError(error); if (fileInput.current) fileInput.current.value = ""; return; }
    setReceipt(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (deliveryChecking.current) return;
    const validation = validateOrderDraft(draft);
    if (!selectedArea) validation.deliveryAreaId = "اختاري منطقة توصيل مفعّلة.";
    setErrors(validation);
    if (Object.keys(validation).length) {
      setFormError("راجعي الحقول الموضّحة لإكمال بيانات الطلب.");
      form.current?.querySelector<HTMLInputElement>(`[name="${Object.keys(validation)[0]}"]`)?.focus();
      return;
    }
    if (draft.payment === "bank" && (!receipt || checkingFile)) {
      setReceiptError("اختاري سند الحوالة قبل مراجعة الطلب.");
      fileInput.current?.focus();
      return;
    }
    if (!items.length || items.some((item) => item.sizes?.length && !item.size)) {
      setFormError("راجعي المنتجات والأحجام في السلة أولًا."); return;
    }
    deliveryChecking.current = true; setCheckingDelivery(true);
    try {
      const quote = quoteDelivery(await deliveryAreasTransaction(), draft.deliveryAreaId);
      if (quote.fee !== selectedArea?.fee || quote.areaName !== selectedArea?.name) {
        retryAreas(); setFormError("تغيّرت بيانات أو رسوم المنطقة. راجعي الإجمالي المحدّث ثم اضغطي مراجعة الطلب مجددًا."); return;
      }
      setDeliveryReview({ ...quote, productsTotal: total });
      setFormError(""); review.current?.showModal();
    } catch (error) { retryAreas(); setFormError(error instanceof Error ? error.message : "تعذّر التحقق من رسوم التوصيل. حاولي مجددًا."); }
    finally { deliveryChecking.current = false; setCheckingDelivery(false); }
  }

  if (!items.length) return <EmptyCart />;
  if (items.some((item) => item.sizes?.length && !item.size)) return <div className={panelClass}><h2 className="text-xl font-bold">اختاري الحجم أولًا</h2><p className="mt-3 text-muted">بعض المنتجات في سلتك لا تحتوي على حجم محدد.</p><Button href="/cart" className="mt-6 max-w-sm">العودة للسلة</Button></div>;

  const inputProps = (name: FieldName) => ({ name, value: draft[name], error: errors[name], onChange: (value: string) => changeField(name, value) });
  const recipient = draft.isGift ? draft.recipientName : draft.buyerName;
  const recipientPhone = draft.isGift ? draft.recipientPhone : draft.buyerPhone;

  return <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
    <form id="checkout-form" ref={form} onSubmit={submit} noValidate className="min-w-0 space-y-5">
      {formError && <p role="alert" className="rounded-xl border border-accent/30 bg-surface p-4 text-sm text-accent">{formError}</p>}
      <CustomerForm inputProps={inputProps} />
      <DeliveryForm inputProps={inputProps} draft={draft} areas={areas} loading={areasLoading} error={areasError} retry={retryAreas} />
      <section className={panelClass} aria-labelledby="payment-title"><h2 id="payment-title" className="text-lg font-bold"><span className="me-2 text-accent">03</span>طريقة الدفع</h2><p className="mt-2 mb-5 text-sm text-muted">اختاري الطريقة المناسبة لك.</p>
        <fieldset><legend className="sr-only">اختيار طريقة الدفع</legend><div className="grid gap-3 sm:grid-cols-2">{([{ value: "bank", label: "حوالة بنكية", hint: "إرفاق سند التحويل", icon: "bank" }, { value: "cod", label: "الدفع عند الاستلام", hint: "نقدًا عند وصول الطلب", icon: "cash" }] as const).map((option) => <label key={option.value} className="relative cursor-pointer"><input type="radio" name="payment" value={option.value} checked={draft.payment === option.value} onChange={() => { updateDraft({ payment: option.value }); setReceiptError(""); }} className="peer sr-only" /><span className="flex min-h-28 items-start gap-3 rounded-2xl border border-line bg-page p-4 text-cocoa peer-checked:border-cocoa peer-checked:bg-cocoa/5 peer-checked:ring-1 peer-checked:ring-cocoa peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"><OrderIcon kind={option.icon} className="mt-1 size-6 shrink-0" /><span className="min-w-0"><span className="block text-sm font-bold">{option.label}</span><span className="mt-2 block text-xs leading-relaxed text-muted">{option.hint}</span><span className="mt-2 block text-xs font-medium">{draft.payment === option.value ? "✓ تم الاختيار" : "اختيار"}</span></span></span></label>)}</div></fieldset>
        {draft.payment === "bank" ? <div className="mt-5 space-y-4"><div className="rounded-xl bg-cocoa/5 p-4 text-sm leading-loose text-cocoa"><p className="font-bold">بيانات الحساب البنكي تُضاف قريبًا</p><p className="text-xs text-muted">هذه معاينة لطريقة الدفع. لا توجد حوالة أو دفعة مطلوبة الآن.</p></div>
          <div><label htmlFor="transfer-receipt" className="mb-2 block text-sm font-bold">سند الحوالة</label><label className={`relative flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-page p-5 text-center focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-accent ${receiptError ? "border-accent" : "border-cocoa/30 hover:border-cocoa"}`}><input ref={fileInput} id="transfer-receipt" name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={selectReceipt} aria-invalid={Boolean(receiptError)} aria-describedby={`receipt-hint${receiptError ? " receipt-error" : ""}`} className="sr-only" /><OrderIcon kind="upload" className="size-7 text-cocoa" /><span className="text-sm font-bold text-cocoa">{checkingFile ? "جارٍ فحص الملف…" : receipt ? "اختيار سند آخر" : "اضغطي لإرفاق سند الحوالة"}</span><span id="receipt-hint" className="text-xs text-muted">JPG، PNG، WebP أو PDF · حتى 5 ميغابايت</span></label>
            {receiptError && <p id="receipt-error" role="alert" className="mt-3 text-sm text-accent">{receiptError}</p>}
            {receipt && <div className="mt-3 flex items-center gap-3 rounded-xl border border-line p-3">{receipt.url ? <Image src={receipt.url} unoptimized width={56} height={56} alt="معاينة سند الحوالة المختار" className="size-14 rounded-lg bg-page object-contain" /> : <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-cocoa/5 text-xs font-bold text-cocoa">PDF</span>}<div className="min-w-0 flex-1"><p className="break-all text-sm font-medium" dir="auto">{receipt.file.name}</p><p className="mt-1 text-xs text-muted">تم اختيار السند · {(receipt.file.size / 1024 / 1024).toFixed(2)} MB</p></div><button type="button" onClick={() => { ++uploadVersion.current; setReceipt(null); setReceiptError(""); setCheckingFile(false); if (fileInput.current) fileInput.current.value = ""; }} aria-label="إزالة سند الحوالة" className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-page ${focus}`}><CloseIcon className="size-4" /></button></div>}
            <p className="mt-3 text-xs leading-loose text-muted">اختيار السند لا يعني تأكيد الدفع. في هذه المعاينة يبقى الملف محليًا، وقد تحتاجين لإعادة اختياره بعد تحديث الصفحة.</p>
          </div>
        </div> : <div className="mt-5 rounded-xl bg-cocoa/5 p-4 text-sm leading-loose text-cocoa">{draft.isGift ? "مستلم الهدية هو من سيدفع عند الاستلام. إذا تحبين تكون الهدية مدفوعة منك، اختاري الحوالة البنكية." : "تُدفع قيمة الطلب ورسوم التوصيل نقدًا عند الاستلام، بعد تأكيد المبلغ النهائي."}</div>}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-muted"><span className="flex items-center gap-2 text-sm"><OrderIcon kind="card" className="size-5" />الدفع بالبطاقات</span><div className="flex items-center gap-2"><span className="rounded border border-line px-2 py-1 text-xs font-bold" dir="ltr">Visa / Mastercard</span><span className="rounded-full bg-page px-3 py-1 text-xs">قريبًا</span></div></div>
      </section>
    </form>
    <CartSummary count={count} total={total} isGift={draft.isGift} deliveryFee={selectedArea?.fee ?? null}>
      <ul className="mt-5 space-y-3 border-t border-line pt-5">{items.map((item) => <li key={item.lineId} className="flex gap-3"><Image src={item.image} alt="" width={48} height={48} className="size-12 shrink-0 rounded-xl bg-page object-contain" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.name}</p><p className="mt-1 text-xs text-muted">{item.size ? `${item.size.diameterCm} سم · ` : ""}الكمية: {item.quantity}</p>{item.writing && <p className="mt-1 break-words text-xs text-muted">الكتابة: <bdi>{item.writing.text}</bdi></p>}</div><span className="pt-1 text-xs text-cocoa">{formatPrice(item.price * item.quantity)}</span></li>)}</ul>
      <div className="mt-5 border-t border-line pt-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold">ملاحظة الطلب</h3><Link href="/cart" className={`inline-flex min-h-11 items-center text-xs text-cocoa underline underline-offset-4 ${focus}`}>تعديل السلة والملاحظة</Link></div><p className="whitespace-pre-wrap break-words text-sm leading-loose text-muted">{draft.note.trim() || "لا توجد ملاحظات إضافية."}</p></div>
      <Button type="submit" form="checkout-form" disabled={areasLoading || Boolean(areasError) || checkingDelivery || checkingFile && draft.payment === "bank"} className="mt-6 cursor-pointer">{checkingDelivery ? "جارٍ التحقق…" : "مراجعة الطلب"}<OrderIcon kind="check" className="size-5" /></Button>
      <p className="mt-3 text-center text-xs leading-loose text-muted">معاينة فقط — لن يُرسل طلب أو تُنفّذ دفعة.</p>
    </CartSummary>
    <dialog ref={review} aria-labelledby="review-title" onClick={(event) => { if (event.target === event.currentTarget) review.current?.close(); }} className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-32px)] max-w-xl overflow-y-auto rounded-3xl border border-line bg-surface p-6 text-ink backdrop:bg-ink/50 sm:p-8">
      <div className="flex items-start justify-between gap-4"><span className="grid size-14 place-items-center rounded-full bg-cocoa/5 text-cocoa"><OrderIcon kind="check" className="size-7" /></span><button type="button" onClick={() => review.current?.close()} aria-label="إغلاق مراجعة الطلب" className={`grid size-11 cursor-pointer place-items-center rounded-full bg-page ${focus}`}><CloseIcon className="size-5" /></button></div><h2 id="review-title" className="mt-5 text-2xl font-bold">كل التفاصيل في مكان واحد</h2><p className="mt-2 text-sm leading-loose text-muted">هذه مراجعة تجريبية. لم يتم إرسال طلب أو تأكيد أي دفعة.</p>
      <dl className="mt-6 space-y-4 text-sm"><div><dt className="text-muted">نوع الطلب</dt><dd className="mt-1 font-medium">{draft.isGift ? "هدية" : "طلب عادي"}</dd></div><div><dt className="text-muted">صاحب الطلب</dt><dd className="mt-1">{draft.buyerName} · <bdi>{draft.buyerPhone}</bdi></dd></div><div><dt className="text-muted">المستلم وعنوان التوصيل</dt><dd className="mt-1 leading-loose">{recipient} · <bdi>{recipientPhone}</bdi><br />{deliveryReview?.areaName}، {draft.district}، {draft.address}</dd></div><div><dt className="text-muted">طريقة الدفع</dt><dd className="mt-1">{draft.payment === "bank" ? "حوالة بنكية — السند مختار للمعاينة فقط" : "الدفع عند الاستلام"}</dd>{draft.payment === "bank" && receipt && <dd className="mt-1 break-all text-xs text-muted">{receipt.file.name}</dd>}</div><div><dt className="text-muted">ملاحظة الطلب</dt><dd className="mt-1 whitespace-pre-wrap break-words leading-loose">{draft.note.trim() || "بدون ملاحظات"}</dd></div><div className="flex justify-between border-t border-line pt-4 font-bold"><dt>قيمة المنتجات</dt><dd>{formatPrice(deliveryReview?.productsTotal ?? total)}</dd></div><div className="flex justify-between"><dt>رسوم التوصيل — {deliveryReview?.areaName}</dt><dd>{formatPrice(deliveryReview?.fee ?? 0)}</dd></div><div className="flex justify-between border-t border-line pt-4 font-bold"><dt>الإجمالي شامل التوصيل</dt><dd>{formatPrice((deliveryReview?.productsTotal ?? total) + (deliveryReview?.fee ?? 0))}</dd></div></dl><p className="mt-2 text-xs text-muted">رسوم المنطقة ثابتة. تُراجع الأسعار مجددًا عند فتح مراجعة جديدة.</p><Button type="button" onClick={() => review.current?.close()} className="mt-6 cursor-pointer">العودة لتعديل التفاصيل<ArrowLeftIcon className="size-4" /></Button>
    </dialog>
  </div>;
}
