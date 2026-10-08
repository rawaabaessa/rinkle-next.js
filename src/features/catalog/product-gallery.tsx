"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeftIcon, CloseIcon } from "@/components/ui/icons";
import type { Product } from "./products";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length
    ? product.images
    : [{ src: product.image, alt: product.name }];

  const [active, setActive] = useState(0);

  const dialog = useRef<HTMLDialogElement>(null);

  const selected = images[active];

  function step(direction: number) {
    setActive(
      (current) => (current + direction + images.length) % images.length,
    );
  }

  return (
    <section aria-label={`صور ${product.name}`} className="min-w-0">
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-cocoa/5 sm:rounded-[36px]">
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          aria-label={`تكبير صورة ${product.name}`}
          className={`relative block aspect-square w-full cursor-zoom-in rounded-[28px] ${focus}`}
        >
          <Image
            src={selected.src}
            alt={selected.alt}
            fill
            priority
            sizes="(max-width: 1023px) 94vw, 610px"
            className={
              product.photo ? "object-cover" : "object-contain p-5 sm:p-10"
            }
          />
          <span className="absolute end-4 bottom-4 grid size-11 place-items-center rounded-full border border-line bg-surface/95 text-cocoa sm:end-6 sm:bottom-6">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
              className="size-5"
            >
              <path
                d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        {images.length > 1 && (
          <span
            className="absolute start-5 bottom-5 rounded-full bg-surface/95 px-4 py-2 text-xs text-cocoa"
            aria-live="polite"
          >
            {active + 1} / {images.length}
          </span>
        )}
      </div>
      {images.length > 1 ? (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="الصورة السابقة"
            className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-surface ${focus}`}
          >
            <ArrowLeftIcon className="size-4 rotate-180" />
          </button>
          <div
            className="flex min-w-0 flex-1 gap-3 overflow-x-auto p-1"
            aria-label="اختيار صورة"
          >
            {images.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`عرض الصورة ${index + 1}: ${item.alt}`}
                aria-pressed={active === index}
                className={`relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 bg-surface ${active === index ? "border-cocoa" : "border-transparent hover:border-line"} ${focus}`}
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="80px"
                  className={
                    product.photo ? "object-cover" : "object-contain p-2"
                  }
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="الصورة التالية"
            className={`grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-surface ${focus}`}
          >
            <ArrowLeftIcon className="size-4" />
          </button>
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-muted">
          اضغطي على الصورة لإلقاء نظرة أقرب
        </p>
      )}
      <dialog
        ref={dialog}
        aria-label={`صورة مكبرة: ${product.name}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="fixed inset-0 m-auto h-[min(85dvh,850px)] max-h-[90dvh] w-[min(92vw,950px)] max-w-none overflow-hidden rounded-3xl bg-page p-4 backdrop:bg-ink/70"
      >
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label="إغلاق الصورة المكبرة"
          className={`absolute end-4 top-4 z-10 grid size-11 cursor-pointer place-items-center rounded-full border border-line bg-surface ${focus}`}
        >
          <CloseIcon className="size-5" />
        </button>
        <Image
          src={selected.src}
          alt={selected.alt}
          fill
          sizes="90vw"
          className="object-contain p-6 sm:p-10"
        />
      </dialog>
    </section>
  );
}
