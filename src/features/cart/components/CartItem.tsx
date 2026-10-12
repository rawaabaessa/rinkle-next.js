"use client";

import Image from "next/image";
import Link from "next/link";
import { PlusIcon } from "@/components/ui/IconSet";
import { formatPrice } from "@/lib/formatPrice";
import type { useCart } from "../useCart";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function CartItem({ item, fullPage, onNavigate, setQuantity }: { item: ReturnType<typeof useCart>["items"][number]; fullPage: boolean; onNavigate?: () => void; setQuantity: ReturnType<typeof useCart>["setQuantity"] }) {
  return (<li className={fullPage ? "grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 py-6 sm:grid-cols-[88px_minmax(0,1fr)_auto]" : "flex items-center gap-3 py-4"}>
          <Link href={`/products/${item.id}`} onClick={onNavigate} aria-label={`تفاصيل ${item.name}`} className={`block shrink-0 rounded-xl ${focus}`}><Image src={item.image} alt="" width={fullPage ? 88 : 64} height={fullPage ? 88 : 64} className={`${fullPage ? "size-16 sm:size-22" : "size-16"} rounded-xl bg-page object-contain`} /></Link>
          <div className="min-w-0 flex-1">
            <h3 className={fullPage ? "text-base font-bold" : "text-sm font-bold"}><Link href={`/products/${item.id}`} onClick={onNavigate} className={focus}>{item.name}</Link></h3>
            {item.size ? <p className="mt-1 text-xs leading-relaxed text-muted">الحجم: {item.size.diameterCm} سم{item.size.servings ? ` · يكفي ${item.size.servings}` : ""}</p> : Boolean(item.sizes?.length) && <Link href={`/products/${item.id}`} onClick={onNavigate} className={`mt-1 inline-block text-xs text-accent underline ${focus}`}>الحجم غير محدد — أعيدي الإضافة بالحجم المطلوب</Link>}
            {item.writing && <p className="mt-1 break-words text-xs leading-relaxed text-muted">كتابة {item.writing.language === "ar" ? "عربي" : "إنجليزي"}: <bdi dir={item.writing.language === "ar" ? "rtl" : "ltr"}>{item.writing.text}</bdi></p>}
            <p className="mt-1 text-sm text-cocoa">{formatPrice(item.price * item.quantity)}</p>
            <button type="button" onClick={() => setQuantity(item.lineId, 0)} aria-label={`إزالة ${item.name} من السلة`} className={`min-h-9 cursor-pointer text-xs text-muted underline underline-offset-4 ${focus}`}>إزالة</button>
          </div>
          <div className={`flex w-fit items-center rounded-full border border-line ${fullPage ? "col-start-2 sm:col-start-auto" : ""}`}>
            <button type="button" disabled={item.quantity >= 99} onClick={() => setQuantity(item.lineId, item.quantity + 1)} aria-label={`زيادة كمية ${item.name}`} className={`grid size-11 cursor-pointer place-items-center rounded-full disabled:cursor-not-allowed disabled:opacity-40 ${focus}`}><PlusIcon className="size-4" /></button>
            <span className="min-w-5 text-center text-sm tabular-nums">{item.quantity}</span>
            <button type="button" onClick={() => setQuantity(item.lineId, item.quantity - 1)} aria-label={`تقليل كمية ${item.name}`} className={`size-11 cursor-pointer rounded-full text-xl ${focus}`}>−</button>
          </div>
        </li>);
}
