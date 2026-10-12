import { Field, type CheckoutFields } from "@/features/checkout/components/CheckoutField";
import { panelClass } from "@/components/ui/controlStyles";
import { OrderIcon } from "@/components/ui/OrderIcon";
import { formatPrice } from "@/lib/formatPrice";
import type { OrderDraft } from "@/features/checkout/types";
import type { DeliveryArea } from "@/features/delivery/types";

export function DeliveryForm({ inputProps, draft, areas, loading, error, retry }: CheckoutFields & { draft: OrderDraft; areas: DeliveryArea[]; loading: boolean; error: string; retry: () => void }) {
  const region = inputProps("deliveryAreaId");
  const activeAreas = areas.filter((area) => area.active);
  const unavailable = Boolean(region.value) && !activeAreas.some((area) => area.id === region.value);
  return <section className={panelClass} aria-labelledby="delivery-title">
    <div className="flex items-center justify-between gap-3"><h2 id="delivery-title" className="text-lg font-bold"><span className="me-2 text-accent">02</span>{draft.isGift ? "إلى من نهدي الحلاوة؟" : "عنوان التوصيل"}</h2><OrderIcon kind={draft.isGift ? "gift" : "pin"} className="size-6 text-cocoa" /></div>
    <p className="mt-2 mb-5 text-sm leading-loose text-muted">اختاري منطقة التوصيل، ثم اكتبي العنوان بالتفصيل. الرسوم ثابتة داخل المنطقة.</p>
    <div className="grid gap-5 sm:grid-cols-2">
      {draft.isGift && <><Field {...inputProps("recipientName")} label="اسم مستلم الهدية" autoComplete="section-recipient name" /><Field {...inputProps("recipientPhone")} label="جوال مستلم الهدية" autoComplete="section-recipient tel" placeholder="+967…" /></>}
      <div><label htmlFor="deliveryAreaId" className="mb-2 block text-sm font-medium">منطقة التوصيل <span className="text-accent" aria-hidden="true">*</span></label><select id="deliveryAreaId" name="deliveryAreaId" value={region.value} onChange={(event) => region.onChange(event.target.value)} disabled={loading || Boolean(error)} required aria-invalid={Boolean(region.error || unavailable)} aria-describedby="delivery-area-hint" className="min-h-12 w-full rounded-xl border border-line bg-surface px-3 text-sm outline-offset-4 focus:outline-cocoa"><option value="">{loading ? "جارٍ تحميل المناطق…" : "اختاري المنطقة"}</option>{unavailable && <option value={region.value} disabled>المنطقة السابقة لم تعد متاحة</option>}{activeAreas.map((area) => <option key={area.id} value={area.id}>{area.name} — {formatPrice(area.fee)}</option>)}</select><p id="delivery-area-hint" className={`mt-2 text-xs leading-loose ${region.error || unavailable || error ? "text-accent" : "text-muted"}`}>{error || region.error || (unavailable ? "المنطقة المختارة متوقفة. اختاري منطقة أخرى." : !loading && !activeAreas.length ? "التوصيل غير متاح حاليًا؛ لا توجد مناطق مفعّلة." : "تظهر هنا المناطق المتاحة للتوصيل فقط.")}</p>{error && <button type="button" onClick={retry} className="min-h-11 text-sm text-cocoa underline">إعادة المحاولة</button>}</div>
      <Field {...inputProps("district")} label="الحي" autoComplete="shipping address-level3" placeholder="اسم الحي داخل المنطقة" />
      <div className="sm:col-span-2"><Field {...inputProps("address")} label="العنوان بالتفصيل" autoComplete="shipping street-address" placeholder="الشارع، المبنى، وأقرب معلم واضح" /></div>
    </div>
  </section>;
}
