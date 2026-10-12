import Link from "next/link";
import { focus } from "@/components/ui/controlStyles";

export function OrderHeading({ step }: { step: "cart" | "checkout" }) {
  return (
    <>
      <nav aria-label="مسار التنقل" className="mb-7 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-3">
          <li>
            <Link href="/" className={focus}>
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            {step === "cart" ? (
              <span aria-current="page">السلة</span>
            ) : (
              <Link href="/cart" className={focus}>
                السلة
              </Link>
            )}
          </li>
          {step === "checkout" && (
            <>
              <li aria-hidden="true">/</li>
              <li aria-current="page">إتمام الطلب</li>
            </>
          )}
        </ol>
      </nav>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
        <div>
          <p className="mb-2 text-sm font-medium text-accent">
            لحظات حلوة، على بُعد خطوة
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {step === "cart" ? "سلتك الحلوة" : "إتمام الطلب"}
          </h1>
          <p className="mt-3 text-sm leading-loose text-muted">
            {step === "cart"
              ? "راجعي اختياراتك، وأضيفي لمستك قبل ما نجهّزها."
              : "باقي تفاصيل بسيطة، عشان توصل الحلاوة لمكانها."}
          </p>
        </div>
        <ol
          aria-label="خطوات الطلب"
          className="flex items-center gap-3 text-sm"
        >
          <li aria-current={step === "cart" ? "step" : undefined}>
            <Link
              href="/cart"
              className={`inline-flex min-h-11 items-center gap-2 font-medium text-cocoa ${focus}`}
            >
              <span className="grid size-7 place-items-center rounded-full bg-cocoa text-xs text-white">
                {step === "cart" ? "1" : "✓"}
              </span>
              السلة
            </Link>
          </li>
          <li aria-hidden="true" className="h-px w-7 bg-line" />
          <li
            aria-current={step === "checkout" ? "step" : undefined}
            className={`flex items-center gap-2 ${step === "checkout" ? "font-medium text-cocoa" : "text-muted"}`}
          >
            <span
              className={`grid size-7 place-items-center rounded-full text-xs ${step === "checkout" ? "bg-cocoa text-white" : "border border-line bg-surface"}`}
            >
              2
            </span>
            التوصيل والدفع
          </li>
        </ol>
      </div>
    </>
  );
}
