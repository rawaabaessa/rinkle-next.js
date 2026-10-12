"use client";

import Link from "next/link";
import { useAdminCatalog } from "../AdminCatalogProvider";
import { numberLabel, tomorrowPreview } from "../dashboardPreviewData";
import { useAdminOrders } from "../orders/AdminOrdersProvider";
import { AdminIcon } from "./AdminIcon";

export function DashboardOperations() {
  const { products, loading, error } = useAdminCatalog();
  const { orders, loading: ordersLoading, error: ordersError } = useAdminOrders();
  const pending = orders.filter((order) => order.status === "review").length;
  const outForDelivery = orders.filter((order) => order.deliveryStatus === "out").length;
  const unavailable = products.filter((product) => !product.available).length;
  return <aside className="admin-operations">
    <section className="admin-panel admin-attention" aria-labelledby="attention-title">
      <div className="admin-panel-heading"><h2 id="attention-title">يحتاج انتباهك</h2><AdminIcon name="clock" /></div>
      <Link href="/dashboard/orders" className="admin-attention-row"><span><strong>طلبات قيد المراجعة</strong><small>من عينة الطلبات</small></span><b className="admin-attention-count">{ordersLoading || ordersError ? "—" : numberLabel(pending)}</b><AdminIcon name="arrow" /></Link>
      <Link href="/dashboard/orders" className="admin-attention-row"><span><strong>طلبات خرجت للتوصيل</strong><small>من عينة الطلبات</small></span><b className="admin-attention-count">{ordersLoading || ordersError ? "—" : numberLabel(outForDelivery)}</b><AdminIcon name="arrow" /></Link>
      <Link href="/dashboard/products" className="admin-attention-row"><span><strong>منتجات غير متوفرة</strong><small>{error ? "تعذّر قراءة الكتالوج" : "من كتالوجك المحلي"}</small></span><b className={`admin-attention-count${!unavailable ? " is-clear" : ""}`}>{loading || error ? "—" : numberLabel(unavailable)}</b><AdminIcon name="arrow" /></Link>
    </section>
    <section className="admin-tomorrow" aria-labelledby="tomorrow-title">
      <div className="admin-tomorrow-heading"><h2 id="tomorrow-title">بكرة في رينكل</h2><AdminIcon name="calendar" /></div>
      <div className="admin-tomorrow-total"><strong>{numberLabel(tomorrowPreview.afternoon + tomorrowPreview.evening)}</strong><span>طلبات للحظات حلوة<small>11 أكتوبر · معاينة تجريبية</small></span></div>
      <div className="admin-tomorrow-times"><span>بعد الظهر<b>{numberLabel(tomorrowPreview.afternoon)} طلبات</b></span><span>المساء<b>{numberLabel(tomorrowPreview.evening)} طلبات</b></span></div>
      <p>الأكثر طلبًا <strong>{tomorrowPreview.mostRequested}</strong><span>{numberLabel(tomorrowPreview.mostRequestedCount)} طلبات</span></p>
    </section>
  </aside>;
}
