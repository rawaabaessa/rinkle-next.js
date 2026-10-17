"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminCatalog } from "../AdminCatalogProvider";
import { numberLabel } from "../dashboardPreviewData";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import { ProductTable } from "./ProductTable";

export function ProductsManager({ initialCategory = "all" }: { initialCategory?: string }) {
  const { products, categories: adminCategories, loading, error } = useAdminCatalog();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState("all");
  const normalize = (value: string) => value.replace(/[أإآ]/g, "ا").replace(/[\u064B-\u065F\u0640]/g, "").toLowerCase().trim();
  const visible = products.filter((product) => (category === "all" || product.category === category) && (status === "all" || product.available === (status === "available")) && normalize(product.name).includes(normalize(query)));
  const metrics: { label: string; count: number; hint: string; icon: AdminIconName }[] = [
    { label: "كل المنتجات", count: products.length, hint: "تشكيلة رينكل، بكل تفاصيلها", icon: "box" },
    { label: "متوفر", count: products.filter((item) => item.available).length, hint: "منتجات متاحة للطلب", icon: "check" },
    { label: "غير متوفر", count: products.filter((item) => !item.available).length, hint: "يمكنك إعادة إتاحتها في أي وقت", icon: "clock" },
    { label: "تقبل التخصيص", count: products.filter((item) => item.sizes.length || item.writing.enabled || item.candle.enabled).length, hint: "أحجام أو كتابة أو إضافة شمعة", icon: "writing" },
  ];
  return <>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">كل منتج، له حكاية</p><h1>إدارة المنتجات</h1><p>أضيفي، عدّلي، ورتّبي تفاصيل تشكيلتك من مكان واحد.</p></div><Link href="/dashboard/products/new" className="admin-button"><AdminIcon name="plus" />إضافة منتج</Link></div>
    <section className="admin-kpis" aria-label="ملخص المنتجات">{metrics.map((metric, index) => <article key={metric.label} className={`admin-kpi${index === 0 ? " admin-kpi-featured" : ""}`}><div className="admin-kpi-heading"><h2>{metric.label}</h2><AdminIcon name={metric.icon} /></div><p className="admin-kpi-value">{loading || error && !products.length ? "—" : numberLabel(metric.count)}</p><p className="admin-kpi-hint">{metric.hint}</p></article>)}</section>
    <section className="admin-panel admin-products-panel" aria-label="إدارة قائمة المنتجات"><div className="admin-manager-heading"><div><h2>تشكيلة رينكل</h2><p>الصورة، الحجم، واللمسة الأخيرة… كلها تبدأ من هنا.</p></div><span className="admin-soft-badge">{loading ? "—" : numberLabel(products.length)} منتج</span></div><div className="admin-list-toolbar"><div className="admin-tabs" role="group" aria-label="حالة المنتجات">{[{ id: "all", label: "الكل", count: products.length }, { id: "available", label: "متوفر", count: products.filter((item) => item.available).length }, { id: "unavailable", label: "غير متوفر", count: products.filter((item) => !item.available).length }].map((tab) => <button key={tab.id} type="button" aria-pressed={status === tab.id} onClick={() => setStatus(tab.id)}>{tab.label}<span>{loading ? "—" : tab.count}</span></button>)}</div><div className="admin-filters"><div className="admin-search"><AdminIcon name="search" /><label className="sr-only" htmlFor="admin-product-search">البحث عن منتج</label><input id="admin-product-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحثي باسم المنتج…" /></div><label className="sr-only" htmlFor="admin-category-filter">تصفية حسب القسم</label><select id="admin-category-filter" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">كل الأقسام</option>{adminCategories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div></div>
      {loading ? <div className="admin-loading" role="status">جارٍ تحميل المنتجات…</div> : error && !products.length ? <div className="admin-empty"><h2>تعذّر تحميل الكتالوج</h2><p>راجعي رسالة التخزين أعلى الصفحة وأعيدي المحاولة.</p></div> : visible.length ? <ProductTable products={visible} /> : <div className="admin-empty"><AdminIcon name="search" /><h2>ما لقينا منتجات بهذا الاختيار</h2><p>جرّبي اسمًا ثانيًا أو غيّري التصفية.</p><button className="admin-button admin-button-secondary" type="button" onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); }}>عرض كل المنتجات</button></div>}
      <div className="admin-table-footer"><span role="status">عرض {visible.length} من {products.length} منتجات</span><span>اضغطي على حالة المنتج لتغيير توفره</span></div>
    </section>
    <p className="admin-storage-note"><AdminIcon name="check" />الصور والتعديلات محفوظة على هذا المتصفح. لم يتم ربط النشر في المتجر بعد.</p>
  </>;
}
