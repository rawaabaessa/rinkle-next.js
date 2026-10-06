"use client";

import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { ArrowLeftIcon, BagIcon } from "@/components/ui/icons";
import { orderingSteps } from "@/content/home";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = orderingSteps[activeStep];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-8 bg-page py-20 lg:py-24"
      aria-labelledby="steps-title"
    >
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="lg:ps-10">
          <span className="text-sm font-bold text-accent">طلبك بثلاث خطوات</span>
          <h2 id="steps-title" className="mt-4 text-3xl leading-snug font-bold tracking-tight text-ink sm:text-4xl xl:text-5xl">
            كيف نطلب من رينكل
          </h2>
          <p className="mt-4 text-base leading-loose text-muted sm:text-lg">
            اختاري، حددي وقتك، وإحنا نكمل الباقي.
          </p>

          {/* اختيار الخطوة يغيّر المعاينة داخل الجوال */}
          <ol className="mt-8">
            {orderingSteps.map((step, index) => (
              <li key={step.number} className="border-b border-line last:border-0">
                <button
                  type="button"
                  onClick={() => setActiveStep(index)}
                  aria-pressed={activeStep === index}
                  aria-controls="order-phone-preview"
                  className="group flex w-full cursor-pointer items-center gap-4 rounded-lg py-6 text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:gap-5"
                >
                  <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums transition-colors duration-200 motion-reduce:transition-none ${activeStep === index ? "bg-cocoa text-white" : "bg-cocoa/5 text-cocoa group-hover:bg-cocoa/10"}`}>
                    {step.number}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg leading-relaxed font-bold text-ink sm:text-xl">{step.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted sm:text-base">{step.description}</span>
                  </span>
                  <ArrowLeftIcon className={`size-5 shrink-0 text-cocoa transition-opacity duration-200 motion-reduce:transition-none ${activeStep === index ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                </button>
              </li>
            ))}
          </ol>
        </div>

        <figure className="relative mx-auto w-full max-w-sm">
          {/* خلفية هادئة وإطار جوال بسيط */}
          <div aria-hidden="true" className="absolute inset-x-0 top-16 bottom-12 rounded-full bg-cocoa/5" />
          <div
            id="order-phone-preview"
            role="img"
            aria-label={`معاينة الخطوة ${currentStep.number}: ${currentStep.title}. ${currentStep.description}`}
            className="relative mx-auto w-72 max-w-full rounded-[2.5rem] border-4 border-ink bg-surface p-2 shadow-xl shadow-cocoa/10"
          >
            <div aria-hidden="true" className="flex h-128 flex-col overflow-hidden rounded-4xl bg-surface">
              <div className="mx-auto mt-1 h-5 w-20 shrink-0 rounded-full bg-ink" />
              <div className="mx-4 flex items-center justify-between border-b border-line py-5">
                <span className="text-lg font-bold tracking-tight text-cocoa" lang="en">Rinkle</span>
                <BagIcon className="size-5 text-cocoa" />
              </div>

              {/* لقطات توضيحية؛ التفاعل يكون من قائمة الخطوات */}
              <div className="flex min-h-0 flex-1 flex-col px-4 pt-6 pb-4">
                {activeStep === 0 ? (
                  <>
                    <p className="text-xs text-muted">شي حلو ليومك</p>
                    <p className="mt-2 text-xl font-bold text-ink">وش خاطرك فيه؟</p>
                    <div className="relative mt-4 h-40 shrink-0 overflow-hidden rounded-2xl bg-page">
                      <Image src="/images/categories/cookies.png" alt="" fill sizes="240px" className="object-cover" />
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-ink">كوكيز رينكل</span>
                      <span className="text-xs text-muted">مخبوز بحب</span>
                    </div>
                    <span className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-cocoa py-3 text-sm font-bold text-white">
                      <BagIcon className="size-4" /> أضيفي للسلة
                    </span>
                  </>
                ) : activeStep === 1 ? (
                  <>
                    <p className="text-xs text-muted">على الوقت اللي يناسبك</p>
                    <p className="mt-2 text-xl font-bold text-ink">متى نوصّل لك؟</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">اختاري فترة التوصيل</p>
                    <div className="mt-8 space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-cocoa bg-cocoa/5 px-4 py-5">
                        <span className="text-base font-bold text-cocoa">العصر</span>
                        <span className="size-4 rounded-full border-4 border-cocoa bg-white" />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-line px-4 py-5">
                        <span className="text-base text-muted">المساء</span>
                        <span className="size-4 rounded-full border border-line" />
                      </div>
                    </div>
                    <span className="mt-auto block rounded-xl bg-cocoa py-3 text-center text-sm font-bold text-white">تأكيد الوقت</span>
                  </>
                ) : (
                  <>
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <span className="grid size-20 place-items-center rounded-full bg-cocoa/10 text-cocoa">
                        <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
                      </span>
                      <p className="mt-6 text-2xl font-bold text-ink">طلبك وصلنا!</p>
                      <p className="mt-3 text-sm leading-loose text-muted">نجهّزه بكل حب،<br />ونوصله لك في الموعد.</p>
                    </div>
                    <span className="block rounded-xl bg-cocoa/5 py-3 text-center text-sm font-bold text-cocoa">نشوفك على خير</span>
                  </>
                )}
              </div>
              <div className="mx-auto my-2 h-1 w-24 shrink-0 rounded-full bg-ink/20" />
            </div>
          </div>
          <figcaption className="relative mt-5 text-center text-xs text-muted">معاينة توضيحية · اختاري خطوة لعرضها</figcaption>
          <p className="sr-only" aria-live="polite" aria-atomic="true">المعاينة الحالية: {currentStep.title}</p>
        </figure>
      </Container>
    </section>
  );
}
