"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon } from "@/components/ui/IconSet";
import { CartContents } from "@/features/cart/components/CartContents";
import { useCart } from "@/features/cart/useCart";
import { useOrderDraft } from "@/features/checkout/useOrderDraft";
import { EmptyCart } from "@/features/cart/components/EmptyCart";
import { fieldClass, focus, panelClass } from "@/components/ui/controlStyles";
import { OrderIcon } from "@/components/ui/OrderIcon";
import { CartSummary } from "@/features/cart/components/CartSummary";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/features/account/accountStore";
import { useCustomerLogin } from "@/features/account/components/CustomerProvider";

export function CartPage() {
  const customer = useCustomer(); const login = useCustomerLogin(); const router = useRouter();
  const { items, count, total } = useCart();
  const { draft, updateDraft } = useOrderDraft();
  if (!items.length) return <EmptyCart />;
  const needsSize = items.some((item) => item.sizes?.length && !item.size);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
      <div className="min-w-0 space-y-5">
        <section className={panelClass} aria-labelledby="cart-items-title">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <h2 id="cart-items-title" className="text-lg font-bold">
              اختياراتك{" "}
              <span className="ms-2 text-sm font-normal text-muted">
                ({count} قطعة)
              </span>
            </h2>
            <Link
              href="/products"
              className={`inline-flex min-h-11 items-center gap-2 text-sm font-medium text-cocoa ${focus}`}
            >
              كمّلي التسوّق
              <ArrowLeftIcon className="size-4" />
            </Link>
          </div>
          <CartContents fullPage />
        </section>
        <section
          className={`${panelClass} ${draft.isGift ? "border-cocoa/40" : ""}`}
          aria-labelledby="gift-title"
        >
          <label className="flex cursor-pointer items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cocoa/5 text-cocoa">
              <OrderIcon kind="gift" className="size-6" />
            </span>
            <span className="flex-1">
              <span id="gift-title" className="block text-lg font-bold">
                فرحة حلوة لشخص تحبينه
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">
                أرسلي هذا الطلب كهدية
              </span>
            </span>
            <input
              type="checkbox"
              checked={draft.isGift}
              onChange={(event) =>
                updateDraft({ isGift: event.target.checked })
              }
              aria-label="إرسال الطلب كهدية"
              aria-describedby="gift-hint"
              className={`size-6 shrink-0 cursor-pointer accent-cocoa ${focus}`}
            />
          </label>
          <p id="gift-hint" className="mt-4 text-sm leading-loose text-muted">
            {draft.isGift
              ? "اختيار جميل! أضيفي اسم المستلم ورقمه وعنوانه في الخطوة التالية."
              : "فعّلي الخيار، وبنطلب منك بيانات مستلم الهدية في إتمام الطلب."}
          </p>
        </section>
        <section className={panelClass}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label htmlFor="order-note" className="text-lg font-bold">
              ملاحظة على الطلب
            </label>
            <span className="text-xs text-muted">اختياري</span>
          </div>
          <p
            id="order-note-hint"
            className="mb-4 text-sm leading-loose text-muted"
          >
            عندك تفاصيل تحبين نعرفها؟ اكتبيها هنا، سواء كان طلبك لك أو هدية.
          </p>
          <textarea
            id="order-note"
            value={draft.note}
            onChange={(event) => updateDraft({ note: event.target.value })}
            rows={3}
            maxLength={500}
            aria-describedby="order-note-hint"
            placeholder="مثلاً: يُرجى الاتصال قبل الوصول…"
            className={`${fieldClass} resize-y`}
          />
          <p className="mt-2 text-end text-xs text-muted">
            <bdi dir="ltr">{draft.note.length} / 500</bdi>
          </p>
        </section>
      </div>
      <CartSummary count={count} total={total} isGift={draft.isGift}>
        {needsSize ? (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-cocoa/5 p-4 text-sm leading-loose text-accent"
          >
            بعض اختياراتك القديمة بدون حجم. أعيدي إضافتها بالحجم المطلوب قبل
            المتابعة.
          </p>
        ) : (
          <Button onClick={() => customer ? router.push("/checkout") : login("/checkout")} className="mt-6">
            متابعة لإتمام الطلب
            <ArrowLeftIcon className="size-5" />
          </Button>
        )}
        <p className="mt-3 text-center text-xs text-muted">
          بيانات التوصيل وطريقة الدفع في الخطوة التالية.
        </p>
      </CartSummary>
    </div>
  );
}
