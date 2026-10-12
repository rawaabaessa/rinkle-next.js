"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { seedProducts } from "../catalogStore";
import { numberLabel, previewDateLabel, previewSummary, topProductPreview } from "../dashboardPreviewData";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import { DashboardOperations } from "./DashboardOperations";
import { useAdminOrders } from "../orders/AdminOrdersProvider";
import { RecentOrders } from "./RecentOrders";

const VisitorTrendChart = dynamic(() => import("./VisitorTrendChart").then((module) => module.VisitorTrendChart), {
  loading: () => <div className="admin-panel admin-chart-loading" role="status">جارٍ تجهيز رسم الزيارات…</div>,
  ssr: false,
});

export function DashboardHome() {
  const { orders, loading: ordersLoading, error: ordersError } = useAdminOrders();
  const pendingOrders = orders.filter((order) => order.status === "review").length;
  const conversion = (previewSummary.orders / previewSummary.visitors * 100).toLocaleString("ar-YE", { maximumFractionDigits: 1 });
  const metrics: { label: string; value: string; unit?: string; hint: string; icon: AdminIconName }[] = [
    { label: "زوار اليوم", value: numberLabel(previewSummary.visitors), hint: "زائر خلال يوم العرض", icon: "customers" },
    { label: "طلبات اليوم", value: numberLabel(previewSummary.orders), hint: ordersLoading || ordersError ? "جارٍ التحقق من الحالات" : `${numberLabel(pendingOrders)} طلبات قيد المراجعة`, icon: "orders" },
    { label: "قيمة طلبات اليوم", value: ordersLoading || ordersError ? "—" : numberLabel(orders.reduce((sum, order) => sum + order.total, 0)), unit: "ر.ي", hint: "قيمة الطلبات، قبل تحصيل الدفع", icon: "wallet" },
    { label: "نسبة التحويل", value: `${conversion}٪`, hint: "عدد الطلبات ÷ عدد الزوار", icon: "conversion" },
  ];

  return <div className="admin-overview">
    <div className="admin-page-heading admin-overview-heading">
      <div><p className="admin-eyebrow">لوحة المتجر / نظرة عامة</p><h1>أهلًا، يوم حلو في رينكل</h1><p>كل ما تحتاجينه لمتابعة متجرك، في نظرة واحدة.</p></div>
      <div className="admin-heading-actions"><Link className="admin-button admin-button-secondary" href="/" target="_blank" rel="noreferrer"><AdminIcon name="external" />زيارة المتجر</Link><Link className="admin-button" href="/dashboard/products/new"><AdminIcon name="plus" />إضافة منتج</Link></div>
    </div>
    <div className="admin-overview-meta"><span><AdminIcon name="calendar" />السبت، {previewDateLabel}</span><span className="admin-demo-label">بيانات عرض تجريبية</span></div>
    <section className="admin-kpis" aria-label="مؤشرات يوم العرض التجريبية">
      {metrics.map((metric, index) => <article className={`admin-kpi${index === 2 ? " admin-kpi-featured" : ""}`} key={metric.label}>
        <div className="admin-kpi-heading"><h2>{metric.label}</h2><AdminIcon name={metric.icon} /></div>
        <p className="admin-kpi-value">{metric.value}{metric.unit && <small>{metric.unit}</small>}</p>
        <p className="admin-kpi-hint">{metric.hint}</p>
      </article>)}
    </section>
    <div className="admin-analytics-layout"><VisitorTrendChart /><DashboardOperations /></div>
    <div className="admin-detail-layout">
      <RecentOrders />
      <section className="admin-panel admin-top-products" aria-labelledby="top-products-title">
        <div className="admin-panel-heading"><div><h2 id="top-products-title">الأكثر طلبًا</h2><p>تشكيلة يحبّون يرجعون لها.</p></div><span className="admin-soft-badge">هذا الأسبوع</span></div>
        <ol className="admin-ranking-list">{topProductPreview.map((item, index) => {
          const product = seedProducts.find((entry) => entry.id === item.id)!;
          return <li key={item.id}><span className="admin-ranking-number">{String(index + 1).padStart(2, "0")}</span><div className="admin-ranking-photo"><Image src={product.photos[0].src} alt="" width={56} height={56} /></div><div className="admin-ranking-description"><strong>{product.name}</strong><span>{numberLabel(item.quantity)} قطعة</span></div></li>;
        })}</ol>
        <div className="admin-ranking-footer"><span>ترتيب تجريبي</span><Link className="admin-text-link" href="/dashboard/products">إدارة المنتجات<AdminIcon name="arrow" /></Link></div>
      </section>
    </div>
    <p className="admin-overview-disclaimer">هذه معاينة ليوم {previewDateLabel}. الزيارات والطلبات والترتيب بيانات تجريبية، وليست تقارير فعلية للمتجر.</p>
  </div>;
}
