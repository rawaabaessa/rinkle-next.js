import { Container } from "@/components/ui/container";

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="scroll-mt-8 bg-surface pt-4 pb-20 lg:pb-24"
    >
      <Container className="text-center">
        <h2
          id="testimonials-title"
          className="text-4xl leading-tight font-bold text-ink sm:text-5xl"
        >
          آراء عملائنا
        </h2>

        {/* دعوة لمشاركة التجربة إلى أن تتوفر آراء حقيقية للعرض */}
        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-page px-6 py-10 sm:mt-12 sm:px-12">
          <h3 className="text-lg font-bold text-cocoa">شاركينا رأيك</h3>
          <p className="mx-auto mt-4 max-w-lg text-base leading-loose text-ink">
            جرّبتي حلويات رينكل؟ احكي لنا عن تجربتك.
            <br className="hidden sm:block" />{" "}
            رأيك يهمنا ويساعدنا نقدّم لك الأحلى.
          </p>
          {/* يُفعّل عند ربط نموذج الآراء بالداشبورد ومراجعة المشاركات */}
          <button
            type="button"
            disabled
            aria-describedby="review-availability review-publication-notice"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-cocoa px-8 py-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            اكتبي رأيك
          </button>
          <p id="review-availability" className="mt-3 text-sm text-muted">
            مشاركة الآراء قريبًا
          </p>
          <p id="review-publication-notice" className="mt-2 text-sm leading-relaxed text-muted">
            قد نعرض رأيك في الموقع بعد مراجعته.
          </p>
        </div>
      </Container>
    </section>
  );
}
