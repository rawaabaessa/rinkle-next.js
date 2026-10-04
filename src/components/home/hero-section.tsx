import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { categories } from "@/features/catalog/categories";

const previewCategories = categories.slice(0, 4);
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const floatClass = "absolute flex items-center gap-2.5 rounded-2xl border border-[#f5efeb] bg-white px-[13px] py-[11px] text-ink shadow-[0_14px_32px_#39232030] max-[600px]:gap-[5px] max-[600px]:rounded-[10px] max-[600px]:px-1.5 max-[600px]:py-[5px]";
const floatPhotoClass = "relative size-[59px] shrink-0 overflow-hidden rounded-[9px] bg-[#efe3dc] max-[600px]:size-8 max-[600px]:rounded-md";
const floatCopyClass = "flex flex-col gap-0.5";
const floatSmallClass = "text-[10px] font-semibold text-[#a17e70] max-[600px]:text-[7px]";
const floatStrongClass = "whitespace-nowrap text-sm leading-[1.35] max-[600px]:text-[9px]";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-transparent" aria-labelledby="hero-title">
      <Container className="grid min-h-[605px] grid-cols-[.92fr_1.08fr] items-center gap-[clamp(42px,6vw,92px)] pt-[58px] pb-[90px] max-[1100px]:gap-[30px] max-[900px]:grid-cols-1 max-[900px]:gap-[30px] max-[900px]:pt-[42px] max-[600px]:pt-9 max-[600px]:pb-[76px]">
        <div className="max-w-[565px] max-[900px]:max-w-[650px]">
          <span className="inline-flex min-h-[37px] items-center rounded-full bg-[#f1e6e0] px-[17px] text-[13px] font-bold text-[#87503f] max-[600px]:text-xs">مخبوزات رينكل، تنعمل بحب</span>
          <h1 id="hero-title" className="mt-[27px] text-[clamp(43px,4.4vw,65px)] leading-[1.34] font-extrabold tracking-[-.025em] max-[900px]:text-[clamp(47px,7vw,68px)] max-[600px]:mt-[21px] max-[600px]:text-[clamp(38px,9.3vw,52px)] max-[600px]:leading-[1.3]">
            من كوكيز رينكل
            <br />
            إلى كيك <span className="inline-block text-cocoa shadow-[inset_0_-.14em_0_#efc8b9]">مناسباتك</span>
          </h1>
          <p className="mt-[26px] max-w-[525px] text-lg leading-[1.95] text-muted max-[600px]:mt-[19px] max-[600px]:text-base max-[600px]:leading-[1.85]">
            كوكيز كلاسيك، كيك شوكولاتة، كب كيك وبوكسات للهدايا. اختاري اللي
            تشتهينه من أقسامنا، ونجهّزه لك بعناية.
          </p>
          <div className="mt-[30px] flex flex-wrap gap-3 max-[600px]:mt-6 max-[600px]:gap-[9px]">
            <Link href="#categories" className={`inline-flex min-h-[52px] items-center justify-center gap-[18px] rounded-xl bg-cocoa px-6 text-[15px] font-bold text-white shadow-[0_8px_16px_#5027151d] transition-[transform,background] hover:-translate-y-0.5 hover:bg-[#48281d] motion-reduce:transition-none max-[600px]:min-h-[49px] max-[600px]:gap-[9px] max-[600px]:px-[17px] max-[600px]:text-sm ${focusClass}`}>
              شوفي منتجاتنا <ArrowLeftIcon className="size-[18px]" />
            </Link>
            <a href={siteConfig.contact.whatsapp} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[#dacbc3] bg-white px-6 text-[15px] font-bold text-ink transition-[transform,background,border-color] hover:-translate-y-0.5 hover:border-[#ba998a] hover:bg-[#f5ebe6] motion-reduce:transition-none max-[600px]:min-h-[49px] max-[600px]:px-[17px] max-[600px]:text-sm ${focusClass}`}>اسألينا واتساب</a>
          </div>
        </div>
        <div className="relative isolate h-[485px] max-[1100px]:h-[420px] max-[900px]:mx-auto max-[900px]:h-[480px] max-[900px]:w-full max-[900px]:max-w-[650px] max-[600px]:h-[330px]" role="img" aria-label="عرض مصغر لأقسام متجر رينكل: كوكيز، كيك، ورق عنب، كب كيك وبوكسات">
          <div className="absolute inset-[40px_34px_35px_28px] overflow-hidden rounded-3xl border border-[#ece6e2] bg-white px-[19px] pt-[18px] pb-[22px] shadow-[0_26px_45px_#3a232230] max-[1100px]:inset-[31px_26px_28px_22px] max-[1100px]:p-3.5 max-[900px]:inset-[40px_34px_35px_28px] max-[900px]:px-[19px] max-[900px]:pt-[18px] max-[900px]:pb-[22px] max-[600px]:inset-[28px_8px_20px_8px] max-[600px]:rounded-2xl max-[600px]:p-2.5">
            <div className="relative flex h-[35px] items-center justify-center max-[600px]:h-[25px]">
              <Image src={siteConfig.logo} alt="" width={106} height={35} className="block h-auto w-[106px] max-[600px]:w-[73px]" />
              <span className="absolute left-0 flex items-center gap-1" aria-hidden="true"><i className="size-[5px] rounded-full bg-[#c8b9b1]" /><i className="size-[5px] rounded-full bg-[#c8b9b1]" /><i className="size-[5px] rounded-full bg-[#c8b9b1]" /></span>
            </div>
            <div className="mt-3 flex h-[53px] items-center justify-between gap-2 rounded-[11px] bg-[#f1ded7] px-[15px] text-xs font-extrabold text-cocoa max-[600px]:mt-1.5 max-[600px]:h-9 max-[600px]:rounded-[7px] max-[600px]:px-[9px] max-[600px]:text-[9px]"><span>اختاري حلاك اليوم</span><span className="text-[10px] font-semibold text-[#9a6f61] max-[600px]:text-[8px]">مخبوزاتنا، على مزاجك</span></div>
            <div className="mx-0.5 mt-[17px] mb-3.5 flex items-center gap-[18px] whitespace-nowrap text-[11px] font-bold text-[#a08e86] max-[600px]:mx-px max-[600px]:mt-[11px] max-[600px]:mb-[9px] max-[600px]:gap-[11px] max-[600px]:text-[8px]"><span className="border-b-2 border-accent pb-[5px] text-cocoa">الأقسام</span><span>كوكيز</span><span>كيك</span><span>بوكسات</span></div>
            <div className="grid grid-cols-4 gap-2.5 max-[1100px]:gap-[7px] max-[900px]:gap-2.5 max-[600px]:gap-[5px]">
              {previewCategories.map((category) => (
                <div className="min-w-0 overflow-hidden rounded-[11px] bg-[#faf7f5] pb-3 max-[600px]:rounded-[7px] max-[600px]:pb-1.5" key={category.slug}>
                  <div className="relative aspect-[1/1.17] overflow-hidden bg-[#eee2d9]"><Image src={category.image} alt="" fill sizes="(max-width: 640px) 24vw, (max-width: 900px) 20vw, 8vw" className="object-cover" /></div>
                  <strong className="mx-[9px] mt-[9px] mb-1.5 block whitespace-nowrap text-xs text-[#412b23] max-[600px]:mx-[5px] max-[600px]:mt-[5px] max-[600px]:mb-[3px] max-[600px]:text-[9px]">{category.name}</strong>
                  <span className="mx-[9px] block h-1 w-1/2 rounded-[5px] bg-[#e3d6ce] max-[600px]:mx-[5px] max-[600px]:h-[3px]" />
                </div>
              ))}
            </div>
          </div>
          <div className={`${floatClass} top-[7px] left-0 max-[600px]:top-0`}><div className={floatPhotoClass}><Image src="/images/category-cookies.png" alt="" fill sizes="64px" className="object-cover" /></div><div className={floatCopyClass}><small className={floatSmallClass}>من فرن رينكل</small><strong className={floatStrongClass}>كوكيز كلاسيك</strong><span className="text-[10px] text-[#9a8980] max-[600px]:hidden">قطع شوكولاتة لذيذة</span></div></div>
          <div className={`${floatClass} top-14 right-0 max-[1100px]:top-[42px] max-[600px]:hidden`}><span className="grid size-[34px] place-items-center rounded-full bg-[#f1ded7] text-xl text-[#ae684e]">✦</span><div className={floatCopyClass}><small className={floatSmallClass}>لحظاتك الحلوة</small><strong className={floatStrongClass}>نجهّزها بكل حب</strong></div></div>
          <div className={`${floatClass} right-0.5 bottom-[5px] max-[600px]:right-0 max-[600px]:bottom-0`}><div className={floatPhotoClass}><Image src="/images/category-gift-boxes.png" alt="" fill sizes="68px" className="object-cover" /></div><div className={floatCopyClass}><small className={floatSmallClass}>للهدايا والمناسبات</small><strong className={floatStrongClass}>بوكسات رينكل</strong></div></div>
        </div>
      </Container>
    </section>
  );
}
