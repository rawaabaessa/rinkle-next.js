"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { AdminIcon, type AdminIconName } from "../../components/AdminIcon";
import { numberLabel } from "../../dashboardPreviewData";
import { useAdminOrders } from "../AdminOrdersProvider";
import { deliveryStatusOptions, orderDateLabel, orderStatusOptions } from "../data";
import type { DeliveryStatus, OrderStatus } from "../types";
import { OrderDetails } from "./OrderDetails";

export function OrdersManager() {
  const { orders, loading, error, notice, refresh } = useAdminOrders();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [delivery, setDelivery] = useState<DeliveryStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const normalize = (value: string) => value.replace(/[أإآ]/g, "ا").replace(/[\u064B-\u065F\u0640#]/g, "").trim().toLowerCase();
  const visible = orders.filter((order) => (status === "all" || order.status === status) && (delivery === "all" || order.deliveryStatus === delivery) && normalize(`${order.id} ${order.customer}`).includes(normalize(query)));
  const selectedOrder = orders.find((order) => order.id === selectedId);
  const metrics: { label: string; count: number; hint: string; icon: AdminIconName }[] = [
    { label: "كل الطلبات", count: orders.length, hint: "طلبات التجربة في مكان واحد", icon: "orders" },
    { label: "قيد المراجعة", count: orders.filter((order) => order.status === "review").length, hint: "بانتظار مراجعة تفاصيلها", icon: "clock" },
    { label: "قيد التنفيذ", count: orders.filter((order) => order.status === "processing").length, hint: "لحظات حلوة قيد التجهيز", icon: "box" },
    { label: "جاهز", count: orders.filter((order) => order.status === "ready").length, hint: "اكتمل تجهيز المنتجات", icon: "check" },
  ];
  const clearFilters = () => { setQuery(""); setStatus("all"); setDelivery("all"); };

  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">من الفرن، إلى لحظتهم الحلوة</p><h1>إدارة الطلبات</h1><p>تابعي تجهيز كل طلب وتوصيله، بكل وضوح.</p></div><span className="admin-demo-label">طلبات تجريبية</span></div>
    <section className="admin-kpis" aria-label="ملخص الطلبات">{metrics.map((metric, index) => <article className={`admin-kpi${index === 0 ? " admin-kpi-featured" : ""}`} key={metric.label}><div className="admin-kpi-heading"><h2>{metric.label}</h2><AdminIcon name={metric.icon} /></div><p className="admin-kpi-value">{loading || error && !orders.length ? "—" : numberLabel(metric.count)}</p><p className="admin-kpi-hint">{metric.hint}</p></article>)}</section>
    {error && <div className="admin-alert admin-alert-error" role="alert">{error} <button type="button" className="admin-retry" onClick={() => void refresh()}>إعادة المحاولة</button></div>}
    {notice && <p className="admin-alert admin-alert-success" role="status"><AdminIcon name="check" />{notice}</p>}
    <section className="admin-panel admin-products-panel admin-orders-panel" aria-labelledby="orders-table-title">
      <div className="admin-manager-heading"><div><h2 id="orders-table-title">قائمة الطلبات</h2><p>حالة التجهيز والتوصيل، كل واحدة في مكانها.</p></div><span className="admin-soft-badge">{numberLabel(visible.length)} طلب</span></div>
      <div className="admin-list-toolbar"><div className="admin-tabs" role="group" aria-label="تصفية حالة الطلب"><button type="button" aria-pressed={status === "all"} onClick={() => setStatus("all")}>الكل<span>{orders.length}</span></button>{Object.entries(orderStatusOptions).map(([value, option]) => <button type="button" key={value} aria-pressed={status === value} onClick={() => setStatus(value as OrderStatus)}>{option.label}<span>{orders.filter((order) => order.status === value).length}</span></button>)}</div><div className="admin-filters"><div className="admin-search"><AdminIcon name="search" /><label className="sr-only" htmlFor="admin-order-search">البحث برقم الطلب أو اسم العميل</label><input type="search" id="admin-order-search" placeholder="رقم الطلب أو اسم العميل…" value={query} onChange={(event) => setQuery(event.target.value)} /></div><label className="sr-only" htmlFor="delivery-filter">تصفية حالة التوصيل</label><select id="delivery-filter" value={delivery} onChange={(event) => setDelivery(event.target.value as DeliveryStatus | "all")}><option value="all">كل حالات التوصيل</option>{Object.entries(deliveryStatusOptions).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}</select></div></div>
      {loading ? <div className="admin-loading" role="status">جارٍ تحميل الطلبات…</div> : error && !orders.length ? <div className="admin-empty"><h2>تعذّر تحميل الطلبات</h2><p>أعيدي المحاولة من التنبيه أعلى الصفحة.</p></div> : visible.length ? <div className="admin-table-scroll" role="region" aria-label="جدول الطلبات" tabIndex={0}><table className="admin-table admin-orders-manager-table"><caption className="sr-only">طلبات تجريبية، مع حالة تجهيز الطلب وحالة التوصيل بشكل منفصل.</caption><thead><tr><th scope="col">الطلب</th><th scope="col">العميل</th><th scope="col">الإجمالي</th><th scope="col">حالة الطلب</th><th scope="col">حالة التوصيل</th><th scope="col">موعد التوصيل</th><th scope="col"><span className="sr-only">التفاصيل</span></th></tr></thead><tbody>{visible.map((order) => <tr key={order.id}>
        <td><button type="button" className="admin-order-number admin-order-open" onClick={() => setSelectedId(order.id)} aria-label={`تفاصيل الطلب ${order.id}`}><bdi>#{order.id}</bdi></button><span className="admin-table-subtitle">{orderDateLabel(order.date)}</span></td>
        <td><div className="admin-order-customer"><span className="admin-customer-initial" aria-hidden="true">{order.customer[0]}</span><div>{order.customer}{order.gift && <span className="admin-gift-label"><AdminIcon name="gift" />هدية</span>}</div></div></td>
        <td className="admin-price">{formatPrice(order.total)}<span className="admin-table-subtitle">{order.paymentMethod}</span></td>
        <td><span className={`admin-order-status status-${orderStatusOptions[order.status].tone}`}><i />{orderStatusOptions[order.status].label}</span></td>
        <td><span className={`admin-order-status status-${deliveryStatusOptions[order.deliveryStatus].tone}`}><AdminIcon name={order.deliveryStatus === "delivered" ? "check" : "delivery"} />{deliveryStatusOptions[order.deliveryStatus].label}</span></td>
        <td className="admin-delivery-date">{orderDateLabel(order.deliveryDate)}<span className="admin-table-subtitle">{order.deliveryWindow}</span></td>
        <td><button type="button" className="admin-icon-button" aria-label={`عرض وتعديل الطلب ${order.id}`} onClick={() => setSelectedId(order.id)}><AdminIcon name="arrow" /></button></td>
      </tr>)}</tbody></table></div> : <div className="admin-empty"><AdminIcon name="search" /><h2>ما لقينا طلبات بهذا الاختيار</h2><p>جرّبي رقم طلب أو اسمًا آخر، أو امسحي التصفية.</p><button type="button" className="admin-button admin-button-secondary" onClick={clearFilters}>عرض كل الطلبات</button></div>}
      <div className="admin-table-footer"><span role="status">عرض {numberLabel(visible.length)} من {numberLabel(orders.length)} طلب</span><span>افتحي الطلب لعرض التفاصيل وتحديث الحالات</span></div>
    </section>
    <p className="admin-storage-note"><AdminIcon name="orders" />الطلبات والأسماء بيانات تجريبية. تحديث الحالات محلي فقط، ولا يرسل إشعارات للعملاء.</p>
    {selectedOrder && <OrderDetails key={selectedOrder.id} order={selectedOrder} onClose={() => setSelectedId(null)} />}
  </>;
}
