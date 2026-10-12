import type { ReactNode } from "react";
import { BagIcon } from "@/components/ui/IconSet";
import { OrderIcon } from "@/components/ui/OrderIcon";
import { formatPrice } from "@/lib/formatPrice";
import { panelClass } from "@/components/ui/controlStyles";

export function CartSummary({
  count,
  total,
  isGift,
  children,
  deliveryFee,
}: {
  count: number;
  total: number;
  isGift: boolean;
  children?: ReactNode;
  deliveryFee?: number | null;
}) {
  return (
    <aside
      className={`${panelClass} lg:sticky lg:top-6`}
      aria-label="ملخص الطلب"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">ملخص الطلب</h2>
        <BagIcon className="size-5 text-cocoa" />
      </div>
      {isGift && (
        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-cocoa/5 px-3 py-1.5 text-xs font-medium text-cocoa">
          <OrderIcon kind="gift" className="size-4" />
          طلب يُرسل كهدية
        </p>
      )}
      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">المنتجات ({count} قطعة)</dt>
          <dd className="font-medium">{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">التوصيل</dt>
          <dd className="text-xs text-muted">{deliveryFee != null ? formatPrice(deliveryFee) : "اختاري منطقة التوصيل عند الدفع"}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-line pt-5 text-lg font-bold">
          <dt>{deliveryFee != null ? "الإجمالي شامل التوصيل" : "قيمة المنتجات"}</dt>
          <dd className="text-cocoa">{formatPrice(total + (deliveryFee ?? 0))}</dd>
        </div>
      </dl>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        {deliveryFee != null ? "رسوم ثابتة لكل العناوين داخل المنطقة المختارة." : "لا تشمل رسوم التوصيل حتى اختيار المنطقة."}
      </p>
      {children}
      <div className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-xs leading-loose text-muted">
        <OrderIcon kind="check" className="mt-1 size-4 shrink-0 text-cocoa" />
        <p>
          الأسعار تجريبية لحين اعتماد قائمة المتجر. تُراجع تفاصيل الطلب قبل
          التأكيد.
        </p>
      </div>
    </aside>
  );
}
