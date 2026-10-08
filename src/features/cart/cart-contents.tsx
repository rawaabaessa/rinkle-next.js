"use client";

import Image from "next/image";
import Link from "next/link";
import { BagIcon, PlusIcon } from "@/components/ui/icons";
import { formatPrice } from "@/features/catalog/products";
import { useCart } from "./use-cart";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function CartContents({ onNavigate }: { onNavigate?: () => void }) {
  const { items, count, total, setQuantity } = useCart();
  if (!items.length) return (
    <div className="py-8 text-center">
      <BagIcon className="mx-auto mb-4 size-10 text-cocoa" />
      <h3 className="text-lg font-bold">سلتك تنتظر أول اختيار</h3>
      <p className="mt-2 text-muted">اختاري شي لذيذ من منتجات رينكل.</p>
      <Link href="/products" onClick={onNavigate} className={`mt-5 inline-flex min-h-11 items-center rounded-full bg-cocoa px-6 text-sm font-bold text-white ${focus}`}>تصفّحي المنتجات</Link>
    </div>
  );
  return (
    <div>
      <p className="my-3 text-sm text-muted" role="status">في سلتك {count} قطعة</p>
      <ul className="max-h-[45dvh] divide-y divide-line overflow-y-auto">
        {items.map((item) => <li key={item.lineId} className="flex items-center gap-3 py-4">
          <Image src={item.image} alt={item.name} width={64} height={64} className="size-16 shrink-0 rounded-xl bg-page object-contain" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold">{item.name}</h3>
            {item.size ? <p className="mt-1 text-xs leading-relaxed text-muted">الحجم: {item.size.diameterCm} سم{item.size.servings ? ` · يكفي ${item.size.servings}` : ""}</p> : Boolean(item.sizes?.length) && <Link href={`/products/${item.id}`} onClick={onNavigate} className={`mt-1 inline-block text-xs text-accent underline ${focus}`}>الحجم غير محدد — أعيدي الإضافة بالحجم المطلوب</Link>}
            {item.writing && <p className="mt-1 break-words text-xs leading-relaxed text-muted">كتابة {item.writing.language === "ar" ? "عربي" : "إنجليزي"}: <bdi dir={item.writing.language === "ar" ? "rtl" : "ltr"}>{item.writing.text}</bdi></p>}
            <p className="mt-1 text-sm text-cocoa">{formatPrice(item.price * item.quantity)}</p>
            <button type="button" onClick={() => setQuantity(item.lineId, 0)} aria-label={`إزالة ${item.name} من السلة`} className={`min-h-9 cursor-pointer text-xs text-muted underline underline-offset-4 ${focus}`}>إزالة</button>
          </div>
          <div className="flex items-center rounded-full border border-line">
            <button type="button" disabled={item.quantity >= 99} onClick={() => setQuantity(item.lineId, item.quantity + 1)} aria-label={`زيادة كمية ${item.name}`} className={`grid size-11 cursor-pointer place-items-center rounded-full disabled:cursor-not-allowed disabled:opacity-40 ${focus}`}><PlusIcon className="size-4" /></button>
            <span className="min-w-5 text-center text-sm tabular-nums">{item.quantity}</span>
            <button type="button" onClick={() => setQuantity(item.lineId, item.quantity - 1)} aria-label={`تقليل كمية ${item.name}`} className={`size-11 cursor-pointer rounded-full text-xl ${focus}`}>−</button>
          </div>
        </li>)}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-5 font-bold"><span>المجموع</span><span>{formatPrice(total)}</span></div>
      <p className="mt-3 text-xs leading-loose text-muted">سلة تجريبية — الأسعار مبدئية، وإتمام الطلب غير متاح حاليًا.</p>
    </div>
  );
}
