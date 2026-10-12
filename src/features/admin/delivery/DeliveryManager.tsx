"use client";

import { useState } from "react";
import { useDeliveryAreas } from "@/features/delivery/useDeliveryAreas";
import { deliveryAreasTransaction } from "@/features/delivery/deliveryStore";
import type { DeliveryArea } from "@/features/delivery/types";
import { formatPrice } from "@/lib/formatPrice";
import { AdminIcon, type AdminIconName } from "../components/AdminIcon";
import { numberLabel } from "../dashboardPreviewData";
import { useAdminOrders } from "../orders/AdminOrdersProvider";
import { AreaEditor } from "./AreaEditor";
import { DeliveryTracking } from "./DeliveryTracking";

export function DeliveryManager() {
  const { areas, loading, error, retry } = useDeliveryAreas();
  const { orders, loading: ordersLoading, error: ordersError } = useAdminOrders();
  const [view, setView] = useState("areas");
  const [editor, setEditor] = useState<DeliveryArea | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const metrics: { label: string; count: string; hint: string; icon: AdminIconName }[] = [
    { label: "مناطق التوصيل", count: loading || error ? "—" : numberLabel(areas.length), hint: "تغطية قابلة للتوسع مع رينكل", icon: "delivery" },
    { label: "مناطق مفعّلة", count: loading || error ? "—" : numberLabel(areas.filter((area) => area.active).length), hint: "متاحة للاختيار عند الدفع", icon: "check" },
    { label: "بانتظار التوصيل", count: ordersLoading || ordersError ? "—" : numberLabel(orders.filter((order) => order.deliveryStatus === "waiting").length), hint: "من الطلبات التجريبية", icon: "clock" },
    { label: "خرجت للتوصيل", count: ordersLoading || ordersError ? "—" : numberLabel(orders.filter((order) => order.deliveryStatus === "out").length), hint: "في الطريق إلى العميل", icon: "box" },
  ];
  async function saveArea(area: DeliveryArea) {
    await deliveryAreasTransaction({ type: "save", area });
    setNotice(`تم حفظ منطقة ${area.name}. رسوم الطلبات السابقة لم تتغير.`); setSaveError("");
  }
  async function toggle(area: DeliveryArea) {
    if (busy) return;
    setBusy(true); setSaveError(""); setNotice("");
    try { await deliveryAreasTransaction({ type: "toggle", id: area.id, active: !area.active }); setNotice(area.active ? `تم إيقاف ${area.name} للطلبات الجديدة.` : `تم تفعيل التوصيل إلى ${area.name}.`); }
    catch { setSaveError("تعذّر حفظ الحالة. تحققي من إتاحة التخزين ثم حاولي مجددًا."); }
    finally { setBusy(false); }
  }
  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">الحلاوة أقرب، أينما كانوا</p><h1>إدارة التوصيل</h1><p>حددي مناطقك وأسعارها، وتابعي وصول الطلبات.</p></div><button className="admin-button" type="button" disabled={loading || Boolean(error) || busy} onClick={() => setEditor("new")}><AdminIcon name="plus" />إضافة منطقة</button></div>
    <section className="admin-kpis" aria-label="ملخص التوصيل">{metrics.map((metric, index) => <article key={metric.label} className={`admin-kpi${index === 0 ? " admin-kpi-featured" : ""}`}><div className="admin-kpi-heading"><h2>{metric.label}</h2><AdminIcon name={metric.icon} /></div><p className="admin-kpi-value">{metric.count}</p><p className="admin-kpi-hint">{metric.hint}</p></article>)}</section>
    {error && <p className="admin-alert admin-alert-error" role="alert">{error}<button className="admin-retry" onClick={retry}>إعادة المحاولة</button></p>}{saveError && <p className="admin-alert admin-alert-error" role="alert">{saveError}</p>}{notice && <p className="admin-alert admin-alert-success" role="status"><AdminIcon name="check" />{notice}</p>}
    <div className="admin-delivery-views admin-tabs" role="group" aria-label="أقسام التوصيل"><button type="button" aria-pressed={view === "areas"} onClick={() => setView("areas")}><AdminIcon name="categories" />المناطق والأسعار</button><button type="button" aria-pressed={view === "tracking"} onClick={() => setView("tracking")}><AdminIcon name="delivery" />متابعة التوصيلات</button></div>
    {view === "areas" ? <section className="admin-panel admin-products-panel" aria-labelledby="areas-title"><div className="admin-manager-heading"><div><h2 id="areas-title">مناطق نوصل لها</h2><p>سعر واحد لكل منطقة، مهما اختلف العنوان داخلها.</p></div><span className="admin-soft-badge">بالريال اليمني</span></div>
      {loading ? <div className="admin-loading" role="status">جارٍ تحميل المناطق…</div> : error ? <div className="admin-empty">تعذّر تحميل المناطق، أعيدي المحاولة.</div> : <div className="admin-table-scroll admin-area-table" role="region" aria-label="جدول مناطق التوصيل" tabIndex={0}><table className="admin-table"><thead><tr><th scope="col">المنطقة / المدينة</th><th scope="col">رسوم التوصيل</th><th scope="col">الحالة</th><th scope="col">تعديل</th></tr></thead><tbody>{areas.map((area) => <tr key={area.id}><td><div className="admin-area-name"><span className="admin-area-icon"><AdminIcon name="delivery" /></span><strong>{area.name}</strong></div></td><td className="admin-price">{formatPrice(area.fee)}<span className="admin-table-subtitle">ثابتة داخل المنطقة</span></td><td><button type="button" className={`admin-status admin-status-button ${area.active ? "is-available" : "is-unavailable"}`} aria-label={`${area.active ? "إيقاف" : "تفعيل"} التوصيل إلى ${area.name}`} disabled={busy} onClick={() => void toggle(area)}><span />{area.active ? "مفعّل" : "متوقف"}</button></td><td><button type="button" className="admin-icon-button" aria-label={`تعديل منطقة ${area.name}`} disabled={busy} onClick={() => setEditor(area)}><AdminIcon name="edit" /></button></td></tr>)}</tbody></table></div>}
      <div className="admin-table-footer"><span>أوقفي المنطقة مؤقتًا بدل حذفها</span><span>تعديل السعر لا يؤثر على الطلبات السابقة</span></div></section> : <DeliveryTracking />}
    <p className="admin-storage-note"><AdminIcon name="check" />المناطق والأسعار محفوظة محليًا وتظهر في صفحة الدفع على هذا المتصفح. الربط بقاعدة البيانات لاحقًا.</p>
    {editor && <AreaEditor key={editor === "new" ? "new" : editor.id} area={editor === "new" ? undefined : editor} onSave={saveArea} onClose={() => setEditor(null)} />}
  </>;
}
