import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

const footerLinkClass = "text-sm text-[#75655d] transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-[#e9dcd4] bg-[#f3eae4]">
      <Container className="grid grid-cols-[1.4fr_.8fr_.8fr] gap-[60px] py-16 max-[600px]:grid-cols-2 max-[600px]:gap-x-[18px] max-[600px]:gap-y-[35px] max-[600px]:py-12">
        <div id="about" className="max-[600px]:col-span-2"><Image src={siteConfig.logo} alt="Rinkle" width={170} height={57} className="h-auto w-[170px] max-[600px]:w-[150px]" /><p className="mt-3.5 text-[15px] text-[#78675e]">حلا مصنوع بحب، للحظات تستاهل.</p></div>
        <div><h2 className="mb-5 text-[17px] font-extrabold max-[600px]:text-[15px]">اكتشفي رينكل</h2><nav className="flex flex-col items-start gap-3" aria-label="روابط المتجر">{siteConfig.footerNavigation.map((item) => <Link className={footerLinkClass} href={item.href} key={item.href}>{item.label}</Link>)}</nav></div>
        <div><h2 className="mb-5 text-[17px] font-extrabold max-[600px]:text-[15px]">خلّينا على تواصل</h2><nav className="flex flex-col items-start gap-3" aria-label="وسائل التواصل"><a className={footerLinkClass} href={siteConfig.contact.whatsapp} target="_blank" rel="noopener noreferrer">واتساب</a><a className={footerLinkClass} href={siteConfig.contact.instagram} target="_blank" rel="noopener noreferrer">إنستغرام</a></nav></div>
      </Container>
      <Container className="flex min-h-[68px] items-center justify-between gap-5 border-t border-[#dfd0c7] text-xs text-[#85756c] max-[600px]:flex-col max-[600px]:items-start max-[600px]:justify-center max-[600px]:gap-1 max-[600px]:py-[18px]"><span>© {new Date().getFullYear()} رينكل بيكري. كل الحقوق محفوظة.</span><span>مخبوزات تخلّي الأيام أحلى.</span></Container>
    </footer>
  );
}
