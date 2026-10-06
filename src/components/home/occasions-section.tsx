import Image from "next/image";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

const occasionMessage = "مرحبًا رينكل، أبغى أرتّب ضيافة لمناسبة.";
const occasionContactHref = `${siteConfig.contact.whatsapp}?text=${encodeURIComponent(occasionMessage)}`;

export function OccasionsSection() {
  return (
    <section
      id="occasions"
      aria-labelledby="occasions-title"
      className="overflow-hidden bg-[#f4e9e1] py-20 max-[600px]:py-16"
    >
      <Container className="grid items-center gap-10 min-[901px]:grid-cols-[.92fr_1.08fr] min-[901px]:gap-[clamp(48px,7vw,104px)]">
        <div className="relative z-10 max-w-[550px]">
          <h2
            id="occasions-title"
            className="mt-5 text-[clamp(42px,4.2vw,62px)] leading-[1.28] font-extrabold tracking-[-.025em] max-[600px]:text-[clamp(38px,10vw,48px)]"
          >
            <span className="block">نجهز لضيافتك</span>
            <span className="text-cocoa shadow-[inset_0_-.13em_0_#e7bdac]">
              مايليق بها
            </span>
          </h2>
          <p className="mt-6 max-w-[500px] text-[17px] leading-[1.95] text-[#6c5348] max-[600px]:mt-5 max-[600px]:text-base">
            نختار ونرتّب لك الحلا والتوزيعات بما يناسب مناسبتك، من غير ما تشيلين
            هم التفاصيل.
          </p>
          <a
            href={occasionContactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-13 items-center justify-center gap-5 rounded-xl bg-cocoa px-6 text-[15px] font-bold text-white shadow-[0_8px_16px_#5027151d] transition-colors hover:bg-[#48281d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none max-[600px]:mt-7 max-[600px]:w-full"
          >
            توزيعات رينكل
            <ArrowLeftIcon aria-hidden="true" className="size-4.5" />
          </a>
        </div>

        <div
          className="relative mx-auto h-130 w-full max-w-140 max-[600px]:h-91.5 max-[380px]:h-78.75"
          aria-label="حلويات وضيافة رينكل للمناسبات"
        >
          <div className="absolute inset-y-5 right-[10%] left-[10%] overflow-hidden rounded-t-[48%] rounded-b-[28px] bg-[#d9bda9] shadow-[0_24px_45px_#633b2b24] max-[600px]:inset-y-4 max-[600px]:rounded-b-[20px]">
            <Image
              src="/images/cupcake.png"
              alt="بوكس ضيافة رينكل يضم كوكيز وحلويات بالشوكولاتة"
              fill
              sizes="(max-width: 600px) 80vw, (max-width: 900px) 65vw, 38vw"
              className="object-cover"
            />
          </div>
          <div className="absolute right-0 bottom-0 size-47.5 overflow-hidden rounded-full border-[9px] border-[#f4e9e1] bg-[#d9bda9] shadow-[0_12px_28px_#633b2b24] max-[600px]:size-34.5 max-[600px]:border-[7px] max-[380px]:size-29">
            <Image
              src="/images/cookies.jpeg"
              alt=""
              fill
              sizes="(max-width: 600px) 140px, 190px"
              className="object-cover"
            />
          </div>
          <div className="absolute top-7 left-0 -rotate-6 rounded-[20px] border border-[#eadbcf] bg-surface px-5 py-4 text-center shadow-[0_12px_32px_#633b2b1f] max-[600px]:top-4 max-[600px]:px-4 max-[600px]:py-3">
            <strong
              dir="ltr"
              className="block text-[48px] leading-none font-black text-cocoa tabular-nums max-[600px]:text-[38px]"
            >
              40+
            </strong>
            <span className="mt-1.5 block max-w-31.25 text-xs leading-normal font-bold text-[#715a4e] max-[600px]:max-w-[105px] max-[600px]:text-[11px]">
              مناسبة شاركنا أهلها فرحتهم
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
