"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { AdminIcon } from "../components/AdminIcon";
import { useAdminOrders } from "../orders/AdminOrdersProvider";
import { deliveryStatusOptions, orderDateLabel, orderStatusOptions } from "../orders/data";
import type { DeliveryStatus } from "../orders/types";
import { OrderDetails } from "../orders/components/OrderDetails";

export function DeliveryTracking() {
  const { orders, loading, error, notice, refresh } = useAdminOrders();
  const [area, setArea] = useState("all");
  const [status, setStatus] = useState<DeliveryStatus | "all">("all");
  const [date, setDate] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const regions = [...new Map(orders.map((order) => [order.deliveryAreaId, order.deliveryAreaName])).entries()];
  const visible = orders.filter((order) => (area === "all" || order.deliveryAreaId === area) && (status === "all" || order.deliveryStatus === status) && (!date || order.deliveryDate === date));
  const selected = orders.find((order) => order.id === selectedId);
  return <>
    {error && <p className="admin-alert admin-alert-error" role="alert">{error}<button className="admin-retry" onClick={() => void refresh()}>إعادة المحاولة</button></p>}
    {notice && <p className="admin-alert admin-alert-success" role="status"><AdminIcon name="check" />{notice}</p>}
    <section className="admin-panel admin-products-panel" aria-labelledby="delivery-tracking-title">
      <div className="admin-manager-heading"><div><h2 id="delivery-tracking-title">من التجهيز إلى الباب</h2><p>نفس طلبات المتجر، مع التركيز على رحلة التوصيل.</p></div><span className="admin-soft-badge">بيانات تجريبية</span></div>
      <div className="admin-delivery-filters"><div className="admin-field"><label htmlFor="tracking-area">المنطقة</label><select id="tracking-area" value={area} onChange={(event) => setArea(event.target.value)}><option value="all">كل المناطق</option>{regions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div><div className="admin-field"><label htmlFor="tracking-status">حالة التوصيل</label><select id="tracking-status" value={status} onChange={(event) => setStatus(event.target.value as DeliveryStatus | "all")}><option value="all">كل الحالات</option>{Object.entries(deliveryStatusOptions).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}</select></div><div className="admin-field"><label htmlFor="tracking-date">موعد التوصيل</label><input id="tracking-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div><button className="admin-button admin-button-secondary" type="button" onClick={() => { setArea("all"); setStatus("all"); setDate(""); }}>مسح التصفية</button></div>
      {loading ? <div className="admin-loading" role="status">جارٍ تحميل التوصيلات…</div> : visible.length ? <div className="admin-table-scroll" role="region" tabIndex={0} aria-label="جدول متابعة التوصيل"><table className="admin-table admin-delivery-table"><thead><tr><th scope="col">الطلب / المستلم</th><th scope="col">المنطقة والعنوان</th><th scope="col">الموعد</th><th scope="col">الرسوم</th><th scope="col">التجهيز</th><th scope="col">التوصيل</th><th scope="col">التفاصيل</th></tr></thead><tbody>{visible.map((order) => <tr key={order.id}>
        <td><button type="button" className="admin-order-open" onClick={() => setSelectedId(order.id)} aria-label={`تفاصيل توصيل ${order.id}`}><bdi>#{order.id}</bdi></button><span className="admin-table-subtitle">{order.customer}</span><span className="admin-table-subtitle">{order.phone ? <a href={`tel:${order.phone}`} dir="ltr">{order.phone}</a> : "رقم التواصل غير مضاف للتجربة"}</span></td>
        <td><strong className="admin-delivery-area-name">{order.deliveryAreaName}</strong><span className="admin-table-subtitle">{order.address}</span></td>
        <td className="admin-delivery-date">{orderDateLabel(order.deliveryDate)}<span className="admin-table-subtitle">{order.deliveryWindow}</span></td><td className="admin-price">{formatPrice(order.deliveryFee)}</td>
        <td><span className={`admin-order-status status-${orderStatusOptions[order.status].tone}`}><i />{orderStatusOptions[order.status].label}</span></td><td><span className={`admin-order-status status-${deliveryStatusOptions[order.deliveryStatus].tone}`}><AdminIcon name="delivery" />{deliveryStatusOptions[order.deliveryStatus].label}</span></td><td><button className="admin-icon-button" type="button" aria-label={`تحديث توصيل ${order.id}`} onClick={() => setSelectedId(order.id)}><AdminIcon name="edit" /></button></td>
      </tr>)}</tbody></table></div> : <div className="admin-empty"><AdminIcon name="delivery" /><h3>{error ? "تعذّر عرض التوصيلات" : "لا توجد توصيلات بهذا الاختيار"}</h3><p>{error ? "أعيدي المحاولة من التنبيه أعلى القسم." : "غيّري المنطقة أو الموعد أو حالة التوصيل."}</p></div>}
      <div className="admin-table-footer"><span role="status">عرض {visible.length} من {orders.length} طلب</span><span>رسوم كل طلب محفوظة وقت إنشائه</span></div>
    </section>
    {selected && <OrderDetails key={selected.id} order={selected} onClose={() => setSelectedId(null)} />}
  </>;
}
