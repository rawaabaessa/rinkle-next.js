"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatPrice } from "@/lib/formatPrice";
import { AdminIcon } from "../../components/AdminIcon";
import { useAdminOrders } from "../AdminOrdersProvider";
import { deliveryStatusOptions, orderDateLabel, orderStatusOptions } from "../data";
import type { AdminOrder, DeliveryStatus, OrderStatus } from "../types";

export function OrderDetails({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { updateOrder, busy, error } = useAdminOrders();
  const [status, setStatus] = useState(order.status);
  const [deliveryStatus, setDeliveryStatus] = useState(order.deliveryStatus);
  const changed = status !== order.status || deliveryStatus !== order.deliveryStatus;
  useEffect(() => { if (dialog.current && !dialog.current.open) dialog.current.showModal(); }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (await updateOrder({ id: order.id, status, deliveryStatus })) dialog.current?.close();
  }

  return <dialog ref={dialog} className="admin-order-dialog" aria-labelledby="order-detail-title" onClose={onClose} onCancel={(event) => { if (busy) event.preventDefault(); }}>
    <div className="admin-order-dialog-heading"><div><p className="admin-eyebrow">تفاصيل الطلب</p><h2 id="order-detail-title">طلب <bdi>#{order.id}</bdi></h2><p>{orderDateLabel(order.date)} · <bdi>{order.time}</bdi></p></div><button type="button" className="admin-icon-button" aria-label="إغلاق تفاصيل الطلب" disabled={busy} onClick={() => dialog.current?.close()} autoFocus><AdminIcon name="close" /></button></div>
    <div className="admin-order-dialog-body">
      <div className="admin-order-customer-card"><span className="admin-customer-initial" aria-hidden="true">{order.customer[0]}</span><div><strong>{order.customer}</strong><span>عميل تجريبي</span></div>{order.gift && <span className="admin-gift-label"><AdminIcon name="gift" />طلب هدية</span>}</div>
      <section aria-labelledby="order-items-title"><h3 id="order-items-title">محتويات الطلب</h3><ul className="admin-order-items">{order.items.map((item, index) => <li key={index}>
        <div className="admin-product-thumb">{item.image && <Image src={item.image} alt="" width={54} height={54} />}</div><div><strong>{item.name}</strong><span>{item.detail} · الكمية: {item.quantity}</span>{item.writing && <p>الكتابة: {item.writing}</p>}</div><b>{formatPrice(item.unitPrice * item.quantity)}</b>
      </li>)}</ul><dl className="admin-order-totals"><div><dt>المنتجات</dt><dd>{formatPrice(order.total - order.deliveryFee)}</dd></div><div><dt>رسوم التوصيل</dt><dd>{formatPrice(order.deliveryFee)}</dd></div><div><dt>الإجمالي</dt><dd>{formatPrice(order.total)}</dd></div></dl></section>
      <div className="admin-order-info-grid"><section><h3><AdminIcon name="delivery" />بيانات التوصيل</h3><p>{order.deliveryAreaName} · {order.address}</p><p>{order.phone || "رقم التواصل غير مضاف للتجربة"}</p><p>{orderDateLabel(order.deliveryDate)}</p><p>{order.deliveryWindow}</p></section><section><h3><AdminIcon name="wallet" />طريقة الدفع</h3><p>{order.paymentMethod}</p><small>معلومات تجريبية، لا تمثل تحصيلًا فعليًا.</small></section></div>
      <section className="admin-order-note"><h3><AdminIcon name="writing" />ملاحظة العميل</h3><p>{order.note || "لا توجد ملاحظة على هذا الطلب."}</p></section>
      <form onSubmit={save}>
        <div className="admin-order-state-fields"><div className="admin-field"><label htmlFor="order-status">حالة الطلب</label><select id="order-status" value={status} disabled={busy} onChange={(event) => setStatus(event.target.value as OrderStatus)}>{Object.entries(orderStatusOptions).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}</select></div><div className="admin-field"><label htmlFor="order-delivery-status">حالة التوصيل</label><select id="order-delivery-status" value={deliveryStatus} disabled={busy} onChange={(event) => setDeliveryStatus(event.target.value as DeliveryStatus)}>{Object.entries(deliveryStatusOptions).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}</select></div></div>
        <p className="admin-order-state-hint">حالة الطلب لتجهيز المنتجات، وحالة التوصيل لمتابعة وصولها للعميل.</p>
        {error && <p className="admin-alert admin-alert-error" role="alert">{error}</p>}
        <div className="admin-order-dialog-actions"><button type="button" className="admin-button admin-button-secondary" disabled={busy} onClick={() => dialog.current?.close()}>إغلاق</button><button type="submit" className="admin-button" disabled={busy || !changed}><AdminIcon name="check" />{busy ? "جارٍ الحفظ…" : "حفظ الحالات"}</button></div>
      </form>
      <p className="admin-order-preview-note">الطلب ومحتوياته بيانات تجريبية. التعديلات محفوظة على هذا المتصفح فقط.</p>
    </div>
  </dialog>;
}
