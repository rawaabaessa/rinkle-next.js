"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp, Check, FolderOpen, ImageIcon, Layers, Package, Pencil, Plus, Search } from "lucide-react";
import { useAdminCatalog } from "../AdminCatalogProvider";
import { CategoryEditor } from "./CategoryEditor";
import { normalizeCategoryName, type AdminCategory } from "./categoryData";

export function CategoriesManager() {
  const { categories, products, loading, error, busy, setCategoryActive, reorderCategory } = useAdminCatalog();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editor, setEditor] = useState<AdminCategory | "new" | null>(null);
  const counts = new Map<string, number>();
  for (const product of products) counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  const active = categories.filter((item) => item.active).length;
  const visible = categories.filter((item) => (status === "all" || item.active === (status === "active")) && normalizeCategoryName(`${item.name} ${item.description}`).includes(normalizeCategoryName(query)));
  const filtered = Boolean(query.trim()) || status !== "all";
  const unavailable = loading || Boolean(error && !categories.length);
  function reset() { setQuery(""); setStatus("all"); }
  return <div className="admin-categories-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">إدارة المتجر / الأقسام</p><h1>لكل حلاوة، قسمها</h1><p>نظّمي تشكيلتك، ورتّبي الأقسام بطريقتك.</p></div><button type="button" className="admin-button" disabled={busy || unavailable} onClick={() => setEditor("new")}><Plus />إضافة قسم</button></div>
    <section className="admin-kpis" aria-label="ملخص الأقسام">{[
      { label: "كل الأقسام", value: categories.length, hint: "تشكيلة مرتبة، واختيار أسهل", Icon: Layers },
      { label: "أقسام مفعّلة", value: active, hint: "متاحة لاختيارها في إدارة المنتجات", Icon: Check },
      { label: "أقسام متوقفة", value: categories.length - active, hint: "محفوظة، ويمكن تفعيلها في أي وقت", Icon: FolderOpen },
      { label: "المنتجات المرتبطة", value: products.filter((item) => categories.some((category) => category.slug === item.category)).length, hint: "موزعة على أقسام تشكيلتك", Icon: Package },
    ].map(({ label, value, hint, Icon }, index) => <article className={`admin-kpi${index === 0 ? " admin-kpi-featured" : ""}`} key={label}><div className="admin-kpi-heading"><h2>{label}</h2><Icon /></div><p className="admin-kpi-value">{unavailable ? "—" : value}</p><p className="admin-kpi-hint">{hint}</p></article>)}</section>
    <section className="admin-panel admin-products-panel" aria-label="إدارة قائمة الأقسام">
      <div className="admin-manager-heading"><div><h2>أقسام تشكيلتك</h2><p>الصورة والاسم والترتيب… تفاصيل صغيرة تصنع الفرق.</p></div><span className="admin-soft-badge">{loading ? "—" : categories.length} أقسام</span></div>
      <div className="admin-list-toolbar"><div className="admin-tabs" role="group" aria-label="حالة الأقسام">{[{ id: "all", label: "الكل", count: categories.length }, { id: "active", label: "مفعّلة", count: active }, { id: "inactive", label: "متوقفة", count: categories.length - active }].map((tab) => <button type="button" key={tab.id} aria-pressed={status === tab.id} onClick={() => setStatus(tab.id)}>{tab.label}<span>{loading ? "—" : tab.count}</span></button>)}</div><label className="admin-search"><Search aria-hidden="true" /><span className="sr-only">البحث عن قسم</span><input type="search" placeholder="ابحثي باسم القسم…" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
      {loading ? <p className="admin-loading" role="status">جارٍ تحميل الأقسام…</p> : unavailable ? <div className="admin-empty"><h2>تعذّر تحميل الأقسام</h2><p>اسمحي بالتخزين ثم أعيدي تحميل الصفحة.</p></div> : visible.length ? <div className="admin-table-scroll" role="region" aria-label="جدول الأقسام" tabIndex={0}><table className="admin-table admin-category-table"><thead><tr>{["الترتيب", "القسم", "المنتجات", "الحالة", "الإجراءات"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{visible.map((category) => {
        const index = categories.findIndex((item) => item.slug === category.slug);
        return <tr key={category.slug}><td className="admin-category-order-cell" data-label="الترتيب"><span className="admin-category-position">{String(index + 1).padStart(2, "0")}</span></td><td className="admin-category-identity-cell"><div className="admin-product-cell"><div className="admin-product-thumb">{category.image ? <Image src={category.image} alt="" width={54} height={54} unoptimized={category.image.startsWith("data:")} /> : <ImageIcon aria-hidden="true" />}</div><div><button type="button" className="admin-product-name" onClick={() => setEditor(category)} disabled={busy}>{category.name}</button><span className="admin-table-subtitle admin-category-description">{category.description || "بدون وصف"}</span></div></div></td><td className="admin-category-count-cell"><Link className="admin-category-count" href={`/dashboard/products?category=${encodeURIComponent(category.slug)}`} aria-label={`عرض منتجات ${category.name}`}><span>المنتجات</span><bdi>{counts.get(category.slug) ?? 0}</bdi></Link></td><td className="admin-category-status-cell"><button type="button" className={`admin-status admin-status-button ${category.active ? "is-available" : "is-unavailable"}`} aria-label={`${category.name}: ${category.active ? "إيقاف القسم" : "تفعيل القسم"}`} aria-pressed={category.active} disabled={busy} onClick={() => void setCategoryActive(category.slug, !category.active)}><span />{category.active ? "مفعّل" : "متوقف"}</button></td><td className="admin-category-actions-cell"><div className="admin-category-actions"><button type="button" className="admin-icon-button" aria-label={`تعديل قسم ${category.name}`} disabled={busy} onClick={() => setEditor(category)}><Pencil /></button><button type="button" className="admin-icon-button" aria-label={`تقديم قسم ${category.name}`} title={filtered ? "امسحي التصفية لتغيير الترتيب" : "تقديم القسم"} disabled={busy || filtered || index === 0} onClick={() => void reorderCategory(category.slug, -1)}><ArrowUp /></button><button type="button" className="admin-icon-button" aria-label={`تأخير قسم ${category.name}`} title={filtered ? "امسحي التصفية لتغيير الترتيب" : "تأخير القسم"} disabled={busy || filtered || index === categories.length - 1} onClick={() => void reorderCategory(category.slug, 1)}><ArrowDown /></button></div></td></tr>;
      })}</tbody></table></div> : <div className="admin-empty"><FolderOpen /><h2>{categories.length ? "ما لقينا أقسام بهذا الاختيار" : "أول قسم يبدأ من هنا"}</h2><p>{categories.length ? "جرّبي اسمًا ثانيًا أو غيّري التصفية." : "أضيفي قسمًا لتنظيم منتجاتك."}</p><button type="button" className="admin-button admin-button-secondary" onClick={categories.length ? reset : () => setEditor("new")}>{categories.length ? "عرض كل الأقسام" : "إضافة قسم"}</button></div>}
      <div className="admin-table-footer"><span role="status">عرض {visible.length} من {categories.length} أقسام</span><span>{filtered ? "امسحي التصفية لتغيير ترتيب الأقسام" : "استخدمي الأسهم لترتيب الأقسام"}</span></div>
    </section>
    <p className="admin-storage-note">التعديلات محفوظة على هذا المتصفح ومرتبطة بإدارة المنتجات. نشر الأقسام وصورها في المتجر سيكون بعد الربط.</p>
    {editor && <CategoryEditor category={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} />}
  </div>;
}
