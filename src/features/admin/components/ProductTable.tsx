"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { adminCategories, productPrice } from "../catalogStore";
import { useAdminCatalog } from "../AdminCatalogProvider";
import type { AdminProduct } from "../types";
import { AdminIcon } from "./AdminIcon";

export function ProductTable({ products, compact = false }: { products: AdminProduct[]; compact?: boolean }) {
  const { busy, setAvailability } = useAdminCatalog();
  return <div className="admin-table-scroll" role="region" aria-label="جدول المنتجات" tabIndex={0}>
    <table className="admin-table"><thead><tr><th scope="col">المنتج</th><th scope="col">السعر</th>{!compact && <th scope="col">التخصيص</th>}<th scope="col">الحالة</th><th scope="col"><span className="sr-only">الإجراءات</span></th></tr></thead>
      <tbody>{products.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><div className="admin-product-thumb">{product.photos[0] ? <Image src={product.photos[0].src} alt="" width={54} height={54} unoptimized={product.photos[0].src.startsWith("data:")} /> : <AdminIcon name="image" />}</div><div><Link className="admin-product-name" href={`/dashboard/products/${product.id}/edit`}>{product.name}</Link><span className="admin-table-subtitle">{adminCategories.find((category) => category.slug === product.category)?.name}{product.sizes.length > 0 && ` · ${product.sizes.length} أحجام`}</span></div></div></td>
        <td className="admin-price">{product.sizes.length > 0 && <span className="admin-table-subtitle">ابتداءً من</span>}{formatPrice(productPrice(product))}</td>
        {!compact && <td><div className="admin-mini-tags">{product.writing.enabled && <span><AdminIcon name="writing" />كتابة</span>}{product.candle.enabled && <span><AdminIcon name="candle" />شمعة</span>}{!product.writing.enabled && !product.candle.enabled && <span className="admin-muted">بدون إضافات</span>}</div></td>}
        <td>{compact ? <span className={`admin-status ${product.available ? "is-available" : "is-unavailable"}`}>{product.available ? "متوفر" : "غير متوفر"}</span> : <button type="button" className={`admin-status admin-status-button ${product.available ? "is-available" : "is-unavailable"}`} disabled={busy} onClick={() => void setAvailability(product.id, !product.available)} aria-label={`${product.name}: ${product.available ? "متوفر، تغييره إلى غير متوفر" : "غير متوفر، تغييره إلى متوفر"}`}><span />{product.available ? "متوفر" : "غير متوفر"}</button>}</td>
        <td><Link className="admin-icon-button" href={`/dashboard/products/${product.id}/edit`} aria-label={`تعديل ${product.name}`}><AdminIcon name="edit" /></Link></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
