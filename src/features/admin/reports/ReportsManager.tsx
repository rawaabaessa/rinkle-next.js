"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, ChartNoAxesCombined, Download, Info, PackageCheck, ReceiptText, SlidersHorizontal, Truck, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { useAdminOrders } from "../orders/AdminOrdersProvider";
import { deliveryStatusOptions, orderStatusOptions } from "../orders/data";
import type { AdminOrder } from "../orders/types";
import { buildReport, recentReportDates, reportBounds, reportCsv, reportDateLabel, reportFilterSchema, reportTabLabels, type ReportFilters, type ReportTab } from "./reportData";
import { ReportTable } from "./ReportTable";

const ReportTrendChart = dynamic(() => import("./ReportTrendChart").then((module) => module.ReportTrendChart), { ssr: false, loading: () => <div className="report-chart admin-loading" role="status">جارٍ تجهيز الرسم…</div> });

export function ReportsManager() {
  const { orders, loading, error, refresh } = useAdminOrders();
  return <div className="reports-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">التسويق والمتابعة / التقارير</p><h1>أرقام تحكي عن متجرك</h1><p>تابعي الطلبات، وتعرّفي على المنتجات والمناطق الأكثر طلبًا.</p></div><Link className="admin-button admin-button-secondary" href="/dashboard/orders"><ReceiptText size={18} />إدارة الطلبات</Link></div>
    {loading ? <section className="admin-panel admin-loading" role="status">جارٍ إعداد تقارير الطلبات…</section> : error ? <div className="admin-alert admin-alert-error" role="alert">{error}<button className="admin-retry" onClick={() => void refresh()}>إعادة المحاولة</button></div> : <ReportContent orders={orders} />}
  </div>;
}

function ReportContent({ orders }: { orders: AdminOrder[] }) {
  const [filters, setFilters] = useState<ReportFilters>(() => ({ ...reportBounds(orders), status: "", deliveryStatus: "" }));
  const [period, setPeriod] = useState("all");
  const [tab, setTab] = useState<ReportTab>("products");
  const [sort, setSort] = useState<"volume" | "value">("volume");
  const [notice, setNotice] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ReportFilters>({ resolver: zodResolver(reportFilterSchema), defaultValues: filters });
  const report = buildReport(orders, filters);
  const bounds = reportBounds(orders);
  function preset(value: string) {
    const next = { ...filters, ...(value === "all" ? bounds : recentReportDates(Number(value))) };
    setFilters(next); reset(next); setPeriod(value); setNotice("");
  }
  function clearFilters() {
    const next = { ...bounds, status: "" as const, deliveryStatus: "" as const };
    setFilters(next); reset(next); setPeriod("all"); setNotice("");
  }
  function exportReport() {
    try {
      const headers = tab === "products" ? ["المنتج", "الحجم", "القطع المطلوبة", "عدد الطلبات", "قيمة المنتجات ر.ي"] : tab === "areas" ? ["المنطقة", "عدد الطلبات", "تم توصيلها", "رسوم التوصيل ر.ي", "قيمة الطلبات ر.ي"] : ["رقم الطلب", "تاريخ الطلب", "المنطقة", "حالة الطلب", "حالة التوصيل", "رسوم التوصيل ر.ي", "قيمة الطلب ر.ي"];
      const rows: (string | number)[][] = tab === "products" ? [...report.products].sort((a, b) => sort === "value" ? b.value - a.value : b.quantity - a.quantity).map((item) => [item.name, item.detail, item.quantity, item.orders, item.value]) : tab === "areas" ? [...report.areas].sort((a, b) => sort === "value" ? b.value - a.value : b.orders - a.orders).map((area) => [area.name, area.orders, area.delivered, area.fees, area.value]) : [...report.orders].sort((a, b) => sort === "value" ? b.total - a.total : `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)).map((order) => [order.id, order.date, order.deliveryAreaName, orderStatusOptions[order.status].label, deliveryStatusOptions[order.deliveryStatus].label, order.deliveryFee, order.total]);
      const context = [filters.from, filters.to, filters.status ? orderStatusOptions[filters.status].label : "كل الحالات", filters.deliveryStatus ? deliveryStatusOptions[filters.deliveryStatus].label : "كل الحالات", "معاينة تجريبية — قيمة طلبات وليست تحصيلًا ماليًا"];
      const csv = reportCsv([...headers, "من", "إلى", "تصفية الطلب", "تصفية التوصيل", "مصدر البيانات"], rows.map((row) => [...row, ...context]));
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `rinkle-${tab}-${filters.from}-${filters.to}.csv`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(`تم تجهيز ملف تقرير ${reportTabLabels[tab]} حسب التصفية الحالية.`);
    } catch { setNotice("تعذّر تجهيز الملف. حاولي التصدير مرة أخرى."); }
  }
  const metrics = [
    { label: "قيمة الطلبات", value: formatPrice(report.total), hint: "تشمل رسوم التوصيل · ليست مبالغ محصّلة", Icon: Wallet },
    { label: "عدد الطلبات", value: report.orders.length.toLocaleString("ar-YE"), hint: `${report.quantity.toLocaleString("ar-YE")} قطعة ضمن الفترة`, Icon: ReceiptText },
    { label: "متوسط قيمة الطلب", value: formatPrice(report.average), hint: "إجمالي القيمة ÷ عدد الطلبات", Icon: ChartNoAxesCombined },
    { label: "طلبات تم توصيلها", value: `${report.deliveredPercent.toLocaleString("ar-YE")}٪`, hint: `${report.delivery.delivered.toLocaleString("ar-YE")} من ${report.orders.length.toLocaleString("ar-YE")} طلبات`, Icon: PackageCheck },
  ];
  return <>
    <div className="report-source"><Info size={18} aria-hidden="true" /><p>معاينة من الطلبات التجريبية المحفوظة في هذا المتصفح. البيانات المتاحة من {reportDateLabel(bounds.from)} إلى {reportDateLabel(bounds.to)}؛ لا توجد بيانات تحصيل أو أرباح فعلية.</p></div>
    <section className="admin-panel report-filters" aria-labelledby="report-filters-title"><div className="admin-panel-heading"><h2 id="report-filters-title"><SlidersHorizontal size={18} />فترة التقرير</h2><div className="admin-range-control" role="group" aria-label="فترات التقارير">{[{ value: "all", label: "كل البيانات" }, { value: "7", label: "آخر 7 أيام" }, { value: "30", label: "آخر 30 يومًا" }].map((item) => <button key={item.value} type="button" aria-pressed={period === item.value} onClick={() => preset(item.value)}>{item.label}</button>)}</div></div>
      <form onSubmit={handleSubmit((next) => { setFilters(next); reset(next); setPeriod("custom"); setNotice(""); })} noValidate><div className="report-filter-fields">
        <div className="admin-field"><label htmlFor="report-from">من تاريخ</label><input id="report-from" type="date" {...register("from")} aria-invalid={!!errors.from} aria-describedby={errors.from ? "report-from-error" : undefined} />{errors.from && <p id="report-from-error" role="alert" className="admin-field-error">{errors.from.message}</p>}</div>
        <div className="admin-field"><label htmlFor="report-to">إلى تاريخ</label><input id="report-to" type="date" {...register("to")} aria-invalid={!!errors.to} aria-describedby={errors.to ? "report-to-error" : undefined} />{errors.to && <p id="report-to-error" role="alert" className="admin-field-error">{errors.to.message}</p>}</div>
        <div className="admin-field"><label htmlFor="report-status">حالة الطلب</label><select id="report-status" {...register("status")}><option value="">كل الحالات</option>{Object.entries(orderStatusOptions).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></div>
        <div className="admin-field"><label htmlFor="report-delivery">حالة التوصيل</label><select id="report-delivery" {...register("deliveryStatus")}><option value="">كل الحالات</option>{Object.entries(deliveryStatusOptions).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></div>
        <button type="submit" className="admin-button">تطبيق التصفية</button>
      </div><div className="report-filter-footer"><span>{isDirty ? "لديك تغييرات في التصفية لم تُطبّق بعد." : "التصفية حسب تاريخ إنشاء الطلب، بتوقيت اليمن."}</span><button type="button" className="admin-text-link" onClick={clearFilters}>مسح التصفية</button></div></form>
    </section>
    <div className="report-period" role="status"><CalendarDays size={16} aria-hidden="true" /><span>النتائج المعروضة: {reportDateLabel(filters.from)} — {reportDateLabel(filters.to)}</span><span>{report.orders.length.toLocaleString("ar-YE")} طلبات</span></div>
    <section className="admin-kpis admin-product-kpis" aria-label="مؤشرات الفترة المحددة">{metrics.map(({ label, value, hint, Icon }, index) => <article key={label} className={`admin-kpi${index === 0 ? " admin-kpi-featured" : ""}`}><div className="admin-kpi-heading"><h2>{label}</h2><Icon aria-hidden="true" /></div><p className="admin-kpi-value"><bdi>{value}</bdi></p><p className="admin-kpi-hint">{hint}</p></article>)}</section>
    {!report.orders.length ? <section className="admin-panel admin-empty report-empty"><ChartNoAxesCombined /><h2>لا توجد طلبات ضمن هذه التصفية</h2><p>جرّبي فترة أخرى أو أزيلي تصفية الحالات لعرض البيانات المتاحة.</p><button className="admin-button admin-button-secondary" onClick={clearFilters}>عرض كل البيانات</button></section> : <>
      <div className="report-analysis-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-eyebrow">قيمة الطلبات / ر.ي</p><h2>حركة الطلبات عبر الوقت</h2></div><span className="admin-soft-badge">{report.monthly ? "شهريًا" : "يوميًا"}</span></div><ReportTrendChart data={report.series} /><p className="report-chart-note">{report.series.length === 1 ? "تتضمن الفترة يومًا واحدًا من البيانات؛ يُعرض عمود واحد دون افتراض اتجاه." : "الأيام أو الأشهر بلا طلبات تظهر بقيمة صفر ضمن الفترة المحددة."}</p><details className="admin-chart-data"><summary>عرض بيانات الرسم كجدول</summary><div className="admin-chart-data-scroll"><table><caption className="sr-only">قيمة وعدد الطلبات حسب الفترة</caption><thead><tr><th scope="col">{report.monthly ? "الشهر" : "اليوم"}</th><th scope="col">الطلبات</th><th scope="col">القيمة</th></tr></thead><tbody>{report.series.map((point) => <tr key={point.date}><th scope="row">{reportDateLabel(point.date)}</th><td>{point.count}</td><td><bdi>{formatPrice(point.value)}</bdi></td></tr>)}</tbody></table></div></details></section>
      <aside className="admin-panel report-breakdown"><div className="admin-panel-heading"><h2>تفاصيل الفترة</h2><Truck size={20} aria-hidden="true" /></div><dl><div><dt>قيمة المنتجات</dt><dd><bdi>{formatPrice(report.productsValue)}</bdi></dd></div><div><dt>رسوم التوصيل</dt><dd><bdi>{formatPrice(report.fees)}</bdi></dd></div><div className="report-breakdown-total"><dt>إجمالي الطلبات</dt><dd><bdi>{formatPrice(report.total)}</bdi></dd></div></dl><h3>مراحل التجهيز</h3><ul>{Object.entries(orderStatusOptions).map(([key, option]) => <li key={key}><span>{option.label}</span><strong>{report.preparation[key as keyof typeof report.preparation]}</strong></li>)}</ul><h3>متابعة التوصيل</h3><ul>{Object.entries(deliveryStatusOptions).map(([key, option]) => <li key={key}><span>{option.label}</span><strong>{report.delivery[key as keyof typeof report.delivery]}</strong></li>)}</ul></aside></div>
      <section className="admin-panel admin-products-panel report-details"><div className="report-details-heading"><div><h2>تفاصيل تساعدك على القرار</h2><p>القيم من نسخ الطلبات المحفوظة، وليست من أسعار الكتالوج الحالية.</p></div><button className="admin-button admin-button-secondary" onClick={exportReport} disabled={isDirty}><Download size={17} />تصدير CSV</button></div>
        <div className="report-table-tools"><div className="admin-tabs" role="group" aria-label="نوع التقرير التفصيلي">{(Object.keys(reportTabLabels) as ReportTab[]).map((key) => <button key={key} type="button" aria-pressed={tab === key} className={tab === key ? "is-active" : ""} onClick={() => { setTab(key); setNotice(""); }}>{reportTabLabels[key]}</button>)}</div><label className="report-sort">ترتيب حسب<select value={sort} onChange={(event) => setSort(event.target.value as "volume" | "value")}><option value="volume">{tab === "products" ? "القطع الأكثر طلبًا" : tab === "areas" ? "عدد الطلبات" : "الأحدث"}</option><option value="value">الأعلى قيمة</option></select></label></div>
        {notice && <p role="status" className="report-export-notice">{notice}</p>}<ReportTable report={report} tab={tab} sort={sort} /><div className="admin-table-footer"><span>{tab === "products" ? `${report.products.length} منتج / حجم` : tab === "areas" ? `${report.areas.length} مناطق` : `${report.orders.length} طلبات`}</span><span>{tab === "products" ? "التجميع بالاسم والحجم المحفوظين في الطلب" : "النتائج والتصدير يتبعان التصفية نفسها"}</span></div>
      </section>
    </>}
    <p className="admin-storage-note"><Info size={16} />التقارير المالية والتحصيل والربح تحتاج ربط المدفوعات والتكاليف لاحقًا.</p>
  </>;
}
