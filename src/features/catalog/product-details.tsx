"use client";

import { useRef, useState, type FormEvent } from "react";
import { BagIcon, PlusIcon } from "@/components/ui/icons";
import { useCart, type ProductWriting } from "@/features/cart/use-cart";
import {
  catalogIsPreview,
  formatPrice,
  startingPrice,
  type Product,
} from "./products";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function ProductDetails({
  product,
  categoryName,
}: {
  product: Product;
  categoryName: string;
}) {
  const { addItem } = useCart();
  const [language, setLanguage] = useState<"none" | "ar" | "en">("none");
  const [messages, setMessages] = useState({ ar: "", en: "" });
  const [quantity, setQuantity] = useState(1);
  const [sizeId, setSizeId] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const message = language === "none" ? "" : messages[language];
  const selectedSize = product.sizes?.find((size) => size.id === sizeId);
  const unitPrice = selectedSize
    ? (selectedSize.price ?? product.price)
    : startingPrice(product);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    if (product.sizes?.length && !selectedSize) return;
    if (product.writing && language !== "none" && !message.trim()) {
      setError("اكتبي عبارتك، أو اختاري «بدون كتابة».");
      input.current?.focus();
      return;
    }
    const writing: ProductWriting | undefined =
      product.writing && language !== "none"
        ? { language, text: message.trim() }
        : undefined;
    const added = addItem(product.id, quantity, writing, selectedSize?.id);
    setError("");
    setStatus(
      added
        ? `تمت إضافة ${added} من ${product.name}${selectedSize ? ` بحجم ${selectedSize.diameterCm} سم` : ""} إلى السلة${writing ? " مع عبارتك الخاصة" : ""}.${added < quantity ? " وصلتِ للحد الأقصى: 99 قطعة لكل اختيار." : ""}`
        : "وصلتِ للحد الأقصى لهذا الاختيار في السلة: 99 قطعة.",
    );
  }

  return (
    <div className="min-w-0 lg:py-2">
      <span className="inline-flex rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-cocoa">
        {categoryName}
      </span>
      <h1 className="mt-4 text-3xl leading-snug font-bold text-ink sm:text-4xl lg:text-[38px]">
        {product.name}
      </h1>
      <p className="mt-4 text-2xl font-bold text-cocoa">
        {Boolean(product.sizes?.length) && !selectedSize && (
          <span className="me-2 text-sm font-normal text-muted">
            ابتداءً من
          </span>
        )}
        {formatPrice(unitPrice)}
      </p>
      <div className="mt-6 border-t border-line pt-5">
        <h2 className="text-sm font-bold">عن المنتج</h2>
        <p className="mt-2 max-w-prose text-base leading-[1.95] text-muted">
          {product.details ?? product.description}
        </p>
      </div>

      <form onSubmit={submit} className="mt-6">
        {Boolean(product.sizes?.length) && (
          <fieldset
            className="mb-6 min-w-0"
            aria-describedby="product-size-hint"
          >
            <legend className="mb-2 text-base font-bold">اختاري الحجم</legend>
            <p
              id="product-size-hint"
              className="mb-4 text-sm leading-relaxed text-muted"
            >
              الحجم المناسب للحظاتك الحلوة.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {product.sizes?.map((size) => (
                <label
                  key={size.id}
                  className="relative min-w-0 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="product-size"
                    value={size.id}
                    required
                    checked={sizeId === size.id}
                    onChange={() => {
                      setSizeId(size.id);
                      setStatus("");
                    }}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-24 flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-line bg-surface px-4 py-3 text-cocoa transition-colors hover:border-cocoa/50 peer-checked:border-cocoa peer-checked:bg-cocoa/5 peer-checked:ring-1 peer-checked:ring-cocoa peer-checked:[&_.size-mark]:border-cocoa peer-checked:[&_.size-mark]:bg-cocoa peer-checked:[&_.size-mark_svg]:opacity-100 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent motion-reduce:transition-none">
                    <span
                      className="size-mark grid size-5 shrink-0 place-items-center rounded-full border border-line bg-surface text-white"
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="size-3 opacity-0"
                      >
                        <path
                          d="m3 8 3 3 7-7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-lg font-bold">
                      {size.diameterCm}{" "}
                      <span className="text-sm font-medium">سم</span>
                    </span>
                    <span className="w-full text-xs leading-relaxed text-muted">
                      {size.servings
                        ? `يكفي ${size.servings}`
                        : "عدد الأشخاص يُحدّد قريبًا"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {product.writing && (
          <fieldset className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <legend className="sr-only">الكتابة على المنتج</legend>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold">لمستك الحلوة</h2>
              <span className="text-xs text-muted">اختياري</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              أضيفي عبارة على المنتج، وخليها بطريقتك.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(
                [
                  { value: "none", label: "بدون كتابة" },
                  { value: "ar", label: "عربي" },
                  { value: "en", label: "English" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className="relative min-w-0 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="writing-language"
                    value={option.value}
                    checked={language === option.value}
                    onChange={() => {
                      setLanguage(option.value);
                      setError("");
                      setStatus("");
                    }}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-12 items-center justify-center rounded-xl border border-line px-2 text-sm font-medium text-cocoa transition-colors peer-checked:border-cocoa peer-checked:bg-cocoa peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent motion-reduce:transition-none">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            {language !== "none" && (
              <div className="mt-5">
                <label
                  htmlFor="product-writing"
                  className="mb-2 block text-sm font-medium"
                >
                  {language === "ar" ? "عبارتك بالعربي" : "عبارتك بالإنجليزي"}
                </label>
                <textarea
                  ref={input}
                  id="product-writing"
                  value={message}
                  onChange={(event) => {
                    setMessages({
                      ...messages,
                      [language]: event.target.value,
                    });
                    setError("");
                    setStatus("");
                  }}
                  maxLength={product.writing.maxLength}
                  rows={2}
                  dir={language === "ar" ? "rtl" : "ltr"}
                  lang={language}
                  placeholder={
                    language === "ar"
                      ? "مثلاً: كل عام وأنتِ بخير"
                      : "e.g. Happy Birthday, Sara!"
                  }
                  aria-invalid={Boolean(error)}
                  aria-describedby={`writing-hint${error ? " writing-error" : ""}`}
                  className={`block w-full resize-y rounded-xl border bg-page px-4 py-3 text-base leading-relaxed placeholder:text-muted ${error ? "border-accent" : "border-line"} ${focus}`}
                />
                <div
                  id="writing-hint"
                  className="mt-2 flex justify-between gap-3 text-xs leading-relaxed text-muted"
                >
                  <span>ستُكتب العبارة كما تدخلينها هنا.</span>
                  <span dir="ltr" className="shrink-0 tabular-nums">
                    {message.length} / {product.writing.maxLength}
                  </span>
                </div>
                {error && (
                  <p
                    id="writing-error"
                    role="alert"
                    className="mt-2 text-sm text-accent"
                  >
                    {error}
                  </p>
                )}
              </div>
            )}
          </fieldset>
        )}

        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-cocoa/5 p-4 sm:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-cocoa">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-5"
            >
              <path d="M3 6h11v11H3zM14 10h4l3 4v3h-7" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="17" cy="18" r="2" />
            </svg>
          </span>
          <div>
            <h2 className="text-sm font-bold">وقت التوصيل المتوقع</h2>
            <p className="mt-1 text-sm leading-relaxed text-cocoa">
              {product.deliveryEstimate ?? "يُحدّد عند تأكيد الطلب"}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">
              {product.deliveryEstimate
                ? "قد يختلف الموعد حسب المنطقة وتفاصيل طلبك."
                : "تواصلي معنا لمعرفة أقرب موعد متاح لمنطقتك."}
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <span className="text-sm text-muted">
            المجموع <span className="text-xs">({quantity} قطعة)</span>
          </span>
          <span className="text-xl font-bold text-cocoa">
            {product.sizes?.length && !selectedSize ? (
              <span className="text-sm font-normal text-muted">
                اختاري الحجم أولًا
              </span>
            ) : (
              formatPrice(unitPrice * quantity)
            )}
          </span>
        </div>
        <div className="mt-3 flex gap-3">
          <div
            role="group"
            aria-label="الكمية"
            className="flex min-h-14 shrink-0 items-center rounded-2xl border border-line bg-surface"
          >
            <button
              type="button"
              onClick={() => {
                setQuantity((value) => Math.min(99, value + 1));
                setStatus("");
              }}
              disabled={quantity >= 99}
              aria-label="زيادة الكمية"
              className={`grid size-11 cursor-pointer place-items-center rounded-xl text-cocoa disabled:cursor-not-allowed disabled:opacity-35 ${focus}`}
            >
              <PlusIcon className="size-4" />
            </button>
            <output className="min-w-6 text-center font-bold tabular-nums">
              {quantity}
            </output>
            <button
              type="button"
              onClick={() => {
                setQuantity((value) => Math.max(1, value - 1));
                setStatus("");
              }}
              disabled={quantity <= 1}
              aria-label="تقليل الكمية"
              className={`size-11 cursor-pointer rounded-xl text-xl text-cocoa disabled:cursor-not-allowed disabled:opacity-35 ${focus}`}
            >
              −
            </button>
          </div>
          <button
            type="submit"
            className={`flex min-h-14 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cocoa px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-ink active:bg-ink motion-reduce:transition-none sm:text-base ${focus}`}
          >
            <BagIcon className="size-5 shrink-0" />
            أضيفي للسلة
          </button>
        </div>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-3 min-h-5 text-sm leading-relaxed text-cocoa"
        >
          {status}
        </p>
        {catalogIsPreview && (
          <p className="mt-2 text-xs leading-relaxed text-muted">
            الأسعار وخيارات التخصيص ومواعيد التوصيل تجريبية لحين اعتمادها.
          </p>
        )}
      </form>
    </div>
  );
}
