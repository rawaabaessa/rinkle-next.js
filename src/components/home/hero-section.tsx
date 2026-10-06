import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { ProductShowcase } from "./product-showcase";

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-transparent"
      aria-labelledby="hero-title"
    >
      <Container className="grid min-h-[605px] grid-cols-[.92fr_1.08fr] items-center gap-[clamp(42px,6vw,92px)] pt-[58px] pb-[90px] max-[1100px]:gap-[30px] max-[900px]:grid-cols-1 max-[900px]:gap-[30px] max-[900px]:pt-[42px] max-[600px]:pt-9 max-[600px]:pb-[76px]">
        <div className="max-w-[565px] max-[900px]:max-w-[650px]">
          <span className="inline-flex min-h-[37px] items-center rounded-full bg-[#f1e6e0] px-[17px] text-[13px] font-bold text-[#87503f] max-[600px]:text-xs">
            اختاري و حددي الموعد و الباقي علينا
          </span>
          <h1
            id="hero-title"
            className="mt-[27px] text-[clamp(43px,4.4vw,65px)] leading-[1.34] font-extrabold tracking-[-.025em] max-[900px]:text-[clamp(47px,7vw,68px)] max-[600px]:mt-[21px] max-[600px]:text-[clamp(38px,9.3vw,52px)] max-[600px]:leading-[1.3]"
          >
            من اول لقمة
            <br />
            تعرفين{" "}
            <span className="inline-block text-cocoa shadow-[inset_0_-.14em_0_#efc8b9]">
              الفرق
            </span>
          </h1>
          <p className="mt-[26px] max-w-[525px] text-lg leading-[1.95] text-muted max-[600px]:mt-[19px] max-[600px]:text-base max-[600px]:leading-[1.85]">
            من الكوكيز والكيك إلى الكب كيك والتوزيعات، اختاري اللي يعجبك وحددي
            موعدك، وإحنا نهتم بالباقي.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-3 max-[600px]:mt-6 max-[600px]:gap-[9px]">
            <Link
              href="#categories"
              className={`inline-flex min-h-[52px] items-center justify-center gap-[18px] rounded-xl bg-cocoa px-6 text-[15px] font-bold text-white shadow-[0_8px_16px_#5027151d] transition-[transform,background] hover:-translate-y-0.5 hover:bg-[#48281d] motion-reduce:transition-none max-[600px]:min-h-[49px] max-[600px]:gap-[9px] max-[600px]:px-[17px] max-[600px]:text-sm ${focusClass}`}
            >
              شوفي منتجاتنا <ArrowLeftIcon className="size-[18px]" />
            </Link>
            <a
              href={siteConfig.contact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[#dacbc3] bg-white px-6 text-[15px] font-bold text-ink transition-[transform,background,border-color] hover:-translate-y-0.5 hover:border-[#ba998a] hover:bg-[#f5ebe6] motion-reduce:transition-none max-[600px]:min-h-[49px] max-[600px]:px-[17px] max-[600px]:text-sm ${focusClass}`}
            >
              اسألينا واتساب
            </a>
          </div>
        </div>
        <ProductShowcase />
      </Container>
    </section>
  );
}
