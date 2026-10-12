"use client";

import Image from "next/image";
import Link from "next/link";
import { BagIcon } from "@/components/ui/IconSet";
import { useCart } from "@/features/cart/useCart";
import { productCategories } from "../data";
import { startingPrice } from "@/features/products/productUtils";
import { formatPrice } from "@/lib/formatPrice";
import type { Product } from "@/features/products/types";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function ProductCard({ product, index, quantity, addItem, onAnnouncement }: { product: Product; index: number; quantity: number; addItem: ReturnType<typeof useCart>["addItem"]; onAnnouncement: (message: string) => void }) {
  return (<article
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
                        onAnnouncement(
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
              </article>);
}
