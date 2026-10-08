"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BagIcon, CloseIcon, SearchIcon } from "@/components/ui/icons";
import { useCart } from "@/features/cart/use-cart";
import {
  catalogIsPreview,
  formatPrice,
  matchesProductCategory,
  productCategories,
  products,
  resolveCategory,
  startingPrice,
  type ProductCategory,
} from "./products";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const normalize = (value: string) =>
  value
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .trim();

export function ProductCatalog() {
  const params = useSearchParams();

  const category = resolveCategory(params.get("category"));

  const [query, setQuery] = useState(""); // كويري البحث
  const [sort, setSort] = useState("featured");
  const [announcement, setAnnouncement] = useState("");

  const { items, addItem } = useCart();

  const categoryProducts = products.filter((product) =>
    matchesProductCategory(product, category),
  );

  const noSameDayProducts =
    category === "available-today" && categoryProducts.length === 0;

  const visibleProducts = categoryProducts.filter((product) =>
    normalize(`${product.name} ${product.description}`).includes(
      normalize(query),
    ),
  );

  if (sort === "price-asc") visibleProducts.sort((a, b) => startingPrice(a) - startingPrice(b));
  if (sort === "price-desc") visibleProducts.sort((a, b) => startingPrice(b) - startingPrice(a));

  function selectCategory(value: ProductCategory) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete("category");
    else next.set("category", value);
    window.history.pushState(
      null,
      "",
      `/products${next.size ? `?${next}` : ""}`,
    );
  } // هذي تحدث الرابط بعد اختيار القسم بدون إعادة تحميل الصفحة

  return (
    <section aria-label="تشكيلة المنتجات">
      <div
        className="flex flex-wrap gap-2.5 border-b border-line pb-7"
        role="group"
        aria-label="تصفية حسب القسم"
      >
        {productCategories.map((item) => (
          <button
            key={item.slug}
            type="button"
            aria-pressed={category === item.slug}
            onClick={() => selectCategory(item.slug)}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors motion-reduce:transition-none sm:px-6 ${focus} ${category === item.slug ? "border-cocoa bg-cocoa text-white" : "border-line bg-surface text-cocoa hover:border-cocoa/40 hover:bg-cocoa/5"}`}
          >
            {item.name}
            <span
              className={`text-xs ${category === item.slug ? "text-white/80" : "text-muted"}`}
            >
              {
                products.filter((product) =>
                  matchesProductCategory(product, item.slug),
                ).length
              }
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="shrink-0 text-sm text-muted" role="status">
          <span className="font-bold text-ink">{visibleProducts.length}</span>{" "}
          {category === "available-today"
            ? "منتجات للتسليم الفوري اليوم"
            : "منتجات تنتظرك"}
        </p>
        <div className="flex flex-col gap-3 min-[480px]:flex-row sm:items-center">
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-accent sm:w-64">
            <SearchIcon className="size-4 shrink-0 text-muted" />
            <label className="sr-only" htmlFor="product-search">
              البحث في المنتجات
            </label>
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحثي عن شي تحبينه…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-muted sm:text-sm"
            />
            {query && (
              <button
                type="button"
                aria-label="مسح البحث"
                onClick={() => setQuery("")}
                className={`grid min-h-11 w-8 shrink-0 cursor-pointer place-items-center rounded ${focus}`}
              >
                <CloseIcon className="size-4" />
              </button>
            )}
          </div>
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3">
            <label
              htmlFor="product-sort"
              className="shrink-0 text-sm text-muted"
            >
              الترتيب:
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={`min-h-11 min-w-0 flex-1 cursor-pointer rounded bg-transparent text-sm text-ink ${focus}`}
            >
              <option value="featured">اختيارات رينكل</option>
              <option value="price-asc">السعر: الأقل أولًا</option>
              <option value="price-desc">السعر: الأعلى أولًا</option>
            </select>
          </div>
        </div>
      </div>
      {visibleProducts.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product, index) => {
            const quantity =
              items.find((item) => item.id === product.id && !item.writing)?.quantity ?? 0;
            return (
              <article
                key={product.id}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_10px_30px_#633b2b0c] motion-reduce:transition-none sm:rounded-3xl"
              >
                <Link href={`/products/${product.id}`} aria-label={`تفاصيل ${product.name}`} className={`relative block aspect-square overflow-hidden bg-cocoa/5 ${focus}`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 46vw, (max-width: 1279px) 31vw, 300px"
                    priority={index < 4}
                    className={`${product.photo ? "object-cover" : "object-contain p-3 sm:p-5"} transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none`}
                  />
                </Link>
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <p className="mb-2 text-xs text-muted">
                    {
                      productCategories.find(
                        (item) => item.slug === product.category,
                      )?.name
                    }
                  </p>
                  <h2 className="text-base leading-relaxed font-bold sm:text-lg">
                    <Link href={`/products/${product.id}`} className={`rounded hover:text-accent ${focus}`}>{product.name}</Link>
                  </h2>
                  <p className="mt-1.5 text-xs leading-loose text-muted sm:text-sm">
                    {product.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <p className="text-xs font-bold whitespace-nowrap text-cocoa min-[375px]:text-sm min-[400px]:text-base sm:text-xl">
                      {Boolean(product.sizes?.length) && <span className="mb-1 block text-xs font-normal text-muted">ابتداءً من</span>}
                      {formatPrice(startingPrice(product))}
                    </p>
                    {product.sizes?.length ? <Link href={`/products/${product.id}`} aria-label={`اختيار حجم ${product.name}`} title="اختاري الحجم" className={`flex size-11 shrink-0 items-center justify-center rounded-full bg-cocoa text-white transition-colors hover:bg-ink motion-reduce:transition-none ${focus}`}><BagIcon className="size-5" /></Link> : <button
                      type="button"
                      disabled={quantity >= 99}
                      onClick={() => {
                        addItem(product.id);
                        setAnnouncement(
                          `تمت إضافة ${product.name} إلى السلة. الكمية الآن ${quantity + 1}.`,
                        );
                      }}
                      className={`relative flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-cocoa text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${focus}`}
                      aria-label={quantity >= 99 ? `وصلتِ للحد الأقصى من ${product.name}` : `إضافة ${product.name} للسلة`}
                      title={quantity >= 99 ? "وصلتِ للحد الأقصى" : "إضافة للسلة"}
                    >
                      <BagIcon className="size-5" />
                      {quantity > 0 && (
                        <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full border border-surface bg-ink px-1 text-[10px] font-bold">
                          {quantity}
                        </span>
                      )}
                    </button>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-line bg-surface px-5 py-16 text-center">
          {noSameDayProducts ? (
            <BagIcon className="mx-auto size-9 text-accent" />
          ) : (
            <SearchIcon className="mx-auto size-9 text-accent" />
          )}
          <h2 className="mt-4 text-xl font-bold">
            {noSameDayProducts
              ? "لايوجد منتجات للتسليم الفوري اليوم"
              : "ما لقينا اللي تبحثين عنه"}
          </h2>
          <p className="mt-3 text-muted">
            {noSameDayProducts
              ? "تقدرين تتصفّحين باقي منتجاتنا من هنا."
              : "جرّبي كلمة ثانية أو تصفّحي كل المنتجات."}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              selectCategory("all");
            }}
            className={`mt-6 min-h-11 cursor-pointer rounded-full bg-cocoa px-6 text-sm font-bold text-white ${focus}`}
          >
            عرض كل المنتجات
          </button>
        </div>
      )}
      <div
        className="mt-5 min-h-6 text-sm font-medium text-cocoa"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
      {catalogIsPreview && (
        <p className="mt-4 text-xs leading-loose text-muted">
          المنتجات والأسعار المعروضة تجريبية لحين اعتماد قائمة المتجر.
        </p>
      )}
    </section>
  );
}
