"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { useAdminOrders } from "../orders/AdminOrdersProvider";
import { orderStatusOptions, deliveryStatusOptions } from "../orders/data";
import { AdminIcon } from "./AdminIcon";

export function RecentOrders() {
  const { orders, loading, error } = useAdminOrders();
  return <section className="admin-panel admin-recent-orders" aria-labelledby="recent-orders-title">
    <div className="admin-panel-heading"><div><h2 id="recent-orders-title">آخر الطلبات</h2><p>تفاصيل صغيرة، تستحق المتابعة.</p></div><Link className="admin-text-link" href="/dashboard/orders">قسم الطلبات<AdminIcon name="arrow" /></Link></div>
    <div className="admin-table-scroll" role="region" aria-label="آخر الطلبات التجريبية" tabIndex={0}>
      {loading ? <p className="admin-loading" role="status">جارٍ تحميل الطلبات…</p> : error ? <p className="admin-empty" role="alert">{error}</p> : <table className="admin-table admin-orders-table">
        <caption className="sr-only">عينة طلبات ليوم 10 أكتوبر 2026، جميع الأسماء والبيانات تجريبية</caption>
        <thead><tr><th scope="col">الطلب</th><th scope="col">العميل</th><th scope="col">الإجمالي</th><th scope="col">حالة الطلب</th><th scope="col">التوصيل</th><th scope="col">الوقت</th></tr></thead>
        <tbody>{orders.slice(0, 5).map((order) => <tr key={order.id}>
          <td><span className="admin-order-number" dir="ltr">#{order.id}</span></td>
          <td><div className="admin-order-customer"><span className="admin-customer-initial" aria-hidden="true">{order.customer[0]}</span>{order.customer}</div></td>
          <td className="admin-price">{formatPrice(order.total)}</td>
          <td><span className={`admin-order-status status-${orderStatusOptions[order.status].tone}`}><i />{orderStatusOptions[order.status].label}</span></td>
          <td><span className={`admin-order-status status-${deliveryStatusOptions[order.deliveryStatus].tone}`}><i />{deliveryStatusOptions[order.deliveryStatus].label}</span></td>
          <td><time dateTime={`2026-10-10T${order.time}:00+03:00`}><span dir="ltr">{order.time}</span><small>10 أكتوبر</small></time></td>
        </tr>)}</tbody>
      </table>}
    </div>
    <p className="admin-table-note">عينة للعرض فقط · الأسماء والطلبات تجريبية</p>
  </section>;
}

