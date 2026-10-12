"use client";

import { CartItem } from "@/features/cart/components/CartItem";
import Link from "next/link";
import { BagIcon } from "@/components/ui/IconSet";
import { formatPrice } from "@/lib/formatPrice";
import { useCart } from "@/features/cart/useCart";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function CartContents({ onNavigate, fullPage = false }: { onNavigate?: () => void; fullPage?: boolean }) {
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
      {!fullPage && <p className="my-3 text-sm text-muted" role="status">في سلتك {count} قطعة</p>}
      <ul className={fullPage ? "divide-y divide-line" : "max-h-[45dvh] divide-y divide-line overflow-y-auto"}>
        {items.map((item) => <CartItem key={item.lineId} item={item} fullPage={fullPage} onNavigate={onNavigate} setQuantity={setQuantity} />)}
      </ul>
      {!fullPage && <><div className="mt-3 flex items-center justify-between border-t border-line pt-5 font-bold"><span>المجموع</span><span>{formatPrice(total)}</span></div><Link href="/cart" onClick={onNavigate} className={`mt-5 flex min-h-12 items-center justify-center rounded-xl bg-cocoa px-4 font-bold text-white ${focus}`}>عرض السلة وإتمام الطلب</Link><p className="mt-3 text-xs leading-loose text-muted">الأسعار تجريبية. إتمام الطلب متاح للمعاينة فقط.</p></>}
    </div>
  );
}
