"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Archive, CalendarClock, Check, ChevronLeft, ChevronRight, Info, Pause, Pencil, Play, Plus, RotateCcw, Search, Sparkles, TicketPercent, X } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { useAdminCatalog } from "../AdminCatalogProvider";
import { usePreviewDocument } from "../usePreviewDocument";
import { OfferEditor } from "./OfferEditor";
import { initialOffers, offerDateLabel, offersSchema, offerStatus, offerStatusLabels, offerToday, upsertOffer, type Offer, type OfferFields, type OfferStatus } from "./offerData";

function errorMessage(cause: unknown) { return cause instanceof z.ZodError ? cause.issues[0].message : cause instanceof Error ? cause.message : "تعذّر الحفظ. حاولي مرة أخرى."; }

export function OffersManager() {
  const { value: offers, loading, error, refresh, save } = usePreviewDocument("rinkle-offers-preview-v1", offersSchema, initialOffers);
  const catalog = useAdminCatalog();
  const [today, setToday] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | OfferFields["kind"]>("all");
  const [status, setStatus] = useState<"" | OfferStatus>("");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<{ kind: OfferFields["kind"]; offer?: Offer } | null>(null);
  const [archive, setArchive] = useState<Offer | null>(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    const update = () => setToday(offerToday());
    const initialize = async () => update(); void initialize();
    const interval = window.setInterval(update, 60_000);
    window.addEventListener("focus", update);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", update); };
  }, []);
  const ready = !loading && !error && !!today;
  const available = offers.filter((offer) => offer.state !== "archived");
  const hasFilters = !!query.trim() || kind !== "all" || !!status;
  const filtered = offers.filter((offer) => (kind === "all" || offer.kind === kind) && (status ? offerStatus(offer, today) === status : offer.state !== "archived") && `${offer.name} ${offer.code}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  function clearFilters() { setQuery(""); setKind("all"); setStatus(""); setPage(1); }
  function openEditor(selectedKind: OfferFields["kind"], offer?: Offer) { setNotice(""); setActionError(""); setEditor({ kind: selectedKind, offer }); }
  function persist(values: OfferFields, baseline?: Offer) {
    if (catalog.loading || catalog.error) throw new Error("انتظري تحميل المنتجات والأقسام قبل الحفظ.");
    const ids = values.scope === "products" ? catalog.products.map((item) => item.id) : catalog.categories.map((item) => item.slug);
    if (values.scope !== "all" && values.targetIds.some((id) => !ids.includes(id))) throw new Error("بعض العناصر المحددة لم تعد موجودة. راجعي الاختيارات قبل الحفظ.");
    try { save((current) => upsertOffer(current, values, baseline)); }
    catch (cause) { refresh(); throw cause; }
    setNotice("تم حفظ العرض في هذا المتصفح. لم يُطبّق خصم على طلبات المتجر.");
    setActionError(""); clearFilters();
  }
  function changeState(offer: Offer, state: OfferFields["state"]) {
    setNotice(""); setActionError("");
    try {
      save((current) => upsertOffer(current, { ...offer, state }, offer));
      setNotice(state === "archived" ? "تمت الأرشفة. يمكنك استعادة العرض كمسودة من فلتر الأرشيف." : state === "draft" ? "تمت استعادة العرض كمسودة." : state === "paused" ? "تم إيقاف العرض في المعاينة." : "تم تفعيل العرض في المعاينة وفق فترة صلاحيته.");
      return true;
    } catch (cause) { setActionError(errorMessage(cause)); refresh(); return false; }
  }
  function scopeLabel(offer: Offer) {
    if (offer.scope === "all") return "جميع المنتجات";
    const names = offer.targetIds.map((id) => offer.scope === "products" ? catalog.products.find((item) => item.id === id)?.name : catalog.categories.find((item) => item.slug === id)?.name);
    return names.map((name) => name ?? (catalog.loading ? "جارٍ التحميل…" : "عنصر غير موجود")).join("، ");
  }
  return <div className="offers-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">التسويق والمتابعة / العروض والكوبونات</p><h1>سبب إضافي للحظة حلوة</h1><p>صمّمي عروضك، وحدّدي لمن ومتى تكون الفرصة أحلى.</p></div><div className="offers-heading-actions"><button className="admin-button admin-button-secondary" disabled={!ready || catalog.loading || !!catalog.error} onClick={() => openEditor("automatic")}><Plus size={17} />إضافة عرض</button><button className="admin-button" disabled={!ready || catalog.loading || !!catalog.error} onClick={() => openEditor("coupon")}><TicketPercent size={18} />إضافة كوبون</button></div></div>
    <section className="admin-kpis admin-product-kpis" aria-label="ملخص العروض">{[
      { label: "العروض والكوبونات", count: available.length, hint: "دون العناصر المؤرشفة", Icon: TicketPercent },
      { label: "نشطة الآن", count: available.filter((item) => offerStatus(item, today) === "active").length, hint: "مفعّلة وضمن فترة الصلاحية", Icon: Check },
      { label: "عروض قادمة", count: available.filter((item) => offerStatus(item, today) === "scheduled").length, hint: "تبدأ في تاريخ لاحق", Icon: CalendarClock },
      { label: "مسودات", count: available.filter((item) => item.state === "draft").length, hint: "جاهزة للمراجعة قبل التفعيل", Icon: Pencil },
    ].map(({ label, count, hint, Icon }, index) => <article className={`admin-kpi${index === 0 ? " admin-kpi-featured" : ""}`} key={label}><div className="admin-kpi-heading"><h2>{label}</h2><Icon aria-hidden="true" /></div><p className="admin-kpi-value">{ready ? count.toLocaleString("ar-YE") : "—"}</p><p className="admin-kpi-hint">{hint}</p></article>)}</section>
    <p className="offers-source"><Info size={17} aria-hidden="true" />معاينة محلية لإعداد العروض. تطبيق الخصم وحدود الاستخدام في السلة والدفع يُربطان لاحقًا.</p>
    {notice && <p className="admin-alert admin-alert-success" role="status">{notice}</p>}
    {(error || actionError || catalog.error) && <div className="admin-alert admin-alert-error" role="alert">{error || actionError || catalog.error}{error && <button className="admin-retry" onClick={refresh}>إعادة المحاولة</button>}</div>}
    <section className="admin-panel admin-products-panel offers-panel"><div className="offers-panel-heading"><div><h2>كل عروضك في مكان واحد</h2><p>العرض التلقائي يُطبق دون رمز، والكوبون يُستخدم برمز يدخله العميل.</p></div><span className="admin-soft-badge">التوقيت: اليمن</span></div>
      <div className="offers-toolbar"><div className="admin-tabs" role="group" aria-label="نوع العرض">{([{ value: "all", label: "الكل" }, { value: "automatic", label: "العروض التلقائية" }, { value: "coupon", label: "الكوبونات" }] as const).map((item) => <button key={item.value} className={kind === item.value ? "is-active" : ""} aria-pressed={kind === item.value} onClick={() => { setKind(item.value); setPage(1); }}>{item.label}</button>)}</div><div className="offers-filters"><label className="admin-search"><Search size={18} aria-hidden="true" /><input type="search" aria-label="البحث في العروض" placeholder="ابحثي بالاسم أو الرمز" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label><select aria-label="حالة العرض" value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }}><option value="">كل الحالات (دون الأرشيف)</option>{Object.entries(offerStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
      {!ready ? <p className="admin-loading" role="status">{error ? "أعيدي المحاولة لعرض البيانات المحفوظة." : "جارٍ تحميل العروض…"}</p> : !visible.length ? <div className="offers-empty"><span className="offers-empty-icon"><TicketPercent size={32} /></span><h3>{hasFilters ? "لا توجد عروض تطابق البحث" : offers.length ? "مساحة جاهزة لعرض جديد" : "أول عرض يبدأ بفكرة حلوة"}</h3><p>{hasFilters ? "غيّري نوع العرض أو حالته، أو امسحي البحث لعرض القائمة." : offers.length ? "عروضك السابقة محفوظة في الأرشيف. استعيدي أحدها أو جهّزي فكرة جديدة." : "أنشئي خصمًا على تشكيلة مختارة، أو جهّزي كوبونًا لمناسبة قادمة. يُحفظ العرض أولًا كمسودة."}</p><div className="offers-empty-actions">{hasFilters ? <button className="admin-button admin-button-secondary" onClick={clearFilters}>مسح التصفية</button> : <><button className="admin-button" disabled={catalog.loading || !!catalog.error} onClick={() => openEditor("automatic")}><Plus size={17} />إنشاء عرض</button>{offers.length > 0 && <button className="admin-button admin-button-secondary" onClick={() => setStatus("archived")}><Archive size={17} />عرض الأرشيف</button>}</>}</div></div> : <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="جدول العروض والكوبونات"><table className="admin-table offers-table"><thead><tr>{["العرض", "الخصم", "النطاق", "فترة الصلاحية", "الحالة", "الإجراءات"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{visible.map((offer) => {
        const currentStatus = offerStatus(offer, today);
        return <tr key={offer.id}><th scope="row"><div className="offers-name"><span className="offers-type-icon">{offer.kind === "coupon" ? <TicketPercent size={19} /> : <Sparkles size={19} />}</span><div><strong>{offer.name}</strong><small>{offer.kind === "coupon" ? <bdi className="offers-code">{offer.code}</bdi> : "عرض تلقائي"}</small></div></div></th><td><strong className="offers-value"><bdi>{offer.discountType === "percentage" ? `${offer.discountValue}٪` : formatPrice(offer.discountValue)}</bdi></strong><span className="admin-table-subtitle">{offer.minimumSubtotal ? `من ${formatPrice(offer.minimumSubtotal)}` : "دون حد أدنى"}</span>{offer.maxDiscount !== null && <span className="admin-table-subtitle">سقف {formatPrice(offer.maxDiscount)}</span>}</td><td><span className="offers-scope">{scopeLabel(offer)}</span></td><td><div className="offers-dates"><span>{offerDateLabel(offer.startsOn)}</span><small>{offer.endsOn ? `حتى ${offerDateLabel(offer.endsOn)}` : "نهاية مفتوحة"}</small></div></td><td><span className={`offer-status is-${currentStatus}`}>{offerStatusLabels[currentStatus]}</span></td><td><div className="offers-row-actions">{offer.state === "archived" ? <button className="admin-button admin-button-secondary" aria-label={`استعادة ${offer.name} كمسودة`} onClick={() => changeState(offer, "draft")}><RotateCcw size={16} />استعادة</button> : <><button className="admin-icon-button" aria-label={`تعديل ${offer.name}`} title="تعديل" disabled={catalog.loading || !!catalog.error} onClick={() => openEditor(offer.kind, offer)}><Pencil size={17} /></button>{offer.state === "active" ? <button className="admin-icon-button" aria-label={`إيقاف ${offer.name}`} title="إيقاف" onClick={() => changeState(offer, "paused")}><Pause size={17} /></button> : (!offer.endsOn || offer.endsOn >= today) && <button className="admin-icon-button" aria-label={`تفعيل ${offer.name}`} title="تفعيل" onClick={() => changeState(offer, "active")}><Play size={17} /></button>}<button className="admin-icon-button" aria-label={`أرشفة ${offer.name}`} title="أرشفة" onClick={() => { setActionError(""); setArchive(offer); }}><Archive size={17} /></button></>}</div></td></tr>;
      })}</tbody></table></div>}
      <div className="admin-table-footer"><span>{ready ? `عدد النتائج: ${filtered.length}` : "—"}</span><div className="offers-pagination"><button className="admin-icon-button" aria-label="الصفحة السابقة" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronRight size={16} /></button><span>{currentPage} / {pageCount}</span><button className="admin-icon-button" aria-label="الصفحة التالية" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronLeft size={16} /></button></div></div>
    </section><p className="admin-storage-note"><Info size={16} />إحصاءات استخدام الكوبونات وتأثيرها على المبيعات تتاح بعد ربط الطلبات. رموز الكوبونات المؤرشفة تبقى محفوظة ولا تتكرر.</p>
    {editor && <OfferEditor {...editor} onSave={persist} onClose={() => setEditor(null)} />}
    {archive && <ArchiveOfferDialog offer={archive} error={actionError} onClose={() => setArchive(null)} onConfirm={() => changeState(archive, "archived")} />}
  </div>;
}

function ArchiveOfferDialog({ offer, error, onClose, onConfirm }: { offer: Offer; error: string; onClose: () => void; onConfirm: () => boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="admin-order-dialog offer-archive-dialog" aria-labelledby="offer-archive-title" onClose={onClose}><div className="admin-order-dialog-heading"><h2 id="offer-archive-title">أرشفة العرض</h2><button className="admin-icon-button" aria-label="إغلاق تأكيد الأرشفة" onClick={() => dialog.current?.close()}><X size={19} /></button></div><div className="admin-order-dialog-body"><p>سيُنقل «{offer.name}» إلى الأرشيف ويتوقف في المعاينة. يمكنك استعادته لاحقًا كمسودة.</p>{error && <p role="alert" className="admin-alert admin-alert-error">{error}</p>}<div className="admin-order-dialog-actions"><button className="admin-button admin-button-secondary" autoFocus onClick={() => dialog.current?.close()}>إلغاء</button><button className="admin-button" onClick={() => { if (onConfirm()) dialog.current?.close(); }}><Archive size={17} />تأكيد الأرشفة</button></div></div></dialog>;
}
