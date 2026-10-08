import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

const footerLinkClass =
  "text-sm text-white transition-colors hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white motion-reduce:transition-none";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="bg-surface pt-[38px] pb-12 max-[600px]:pt-0 max-[600px]:pb-6"
    >
      <Container>
        <div className="relative overflow-hidden rounded-[30px] bg-ink px-[61px] pt-[54px] pb-8 text-white max-[600px]:rounded-[23px] max-[600px]:px-6 max-[600px]:pt-[34px] max-[600px]:pb-[23px]">
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 400 400"
            className="pointer-events-none absolute -top-[155px] -left-[120px] size-[330px] fill-[#ffffff0a]"
          >
            <path
              className="stroke-[#ffffff18]"
              vectorEffect="non-scaling-stroke"
              d="M200 8C216 1 231 13 244 14C262 12 271 28 284 33C302 34 307 52 319 61C337 66 338 85 347 97C364 106 361 125 368 139C382 152 375 169 379 184C390 200 380 216 379 231C383 250 367 262 363 276C363 295 345 302 337 315C332 333 313 336 302 347C292 364 273 361 259 368C245 382 228 375 212 379C195 390 180 380 165 379C146 383 135 368 120 364C101 364 95 346 81 338C63 333 61 314 50 302C34 292 37 273 30 259C16 245 23 228 19 212C8 196 18 180 19 165C15 146 31 134 35 120C35 101 53 94 61 81C66 63 85 60 97 49C107 33 126 36 140 29C153 15 171 22 185 16C190 13 195 10 200 8Z"
            />
            <g className="fill-[#ffffff18]">
              <path d="m192 212 17-7 13 12-5 18-20-2Z" />
              <path d="m280 194 19 5 4 18-17 10-15-12Z" />
              <path d="m321 263 17-5 12 14-8 17-19-4Z" />
              <path d="m245 288 19-5 11 16-10 16-19-7Z" />
              <path d="m166 316 18-6 13 14-7 16-20-3Z" />
              <circle cx="249" cy="247" r="5" />
              <circle cx="205" cy="279" r="6" />
              <circle cx="298" cy="323" r="5" />
              <circle cx="220" cy="352" r="4" />
            </g>
          </svg>
          <div className="relative">
            <span className="text-sm font-bold text-white">
              لحظات أحلى مع رينكل
            </span>
            <h2 className="mt-[11px] text-[clamp(31px,3.2vw,45px)] leading-[1.35] font-extrabold max-[600px]:text-[30px]">
              خلّينا قريبين منك
            </h2>
            <p className="mt-[9px] text-base text-white max-[600px]:text-sm">
              اكتشفي مخبوزاتنا وتواصلي معنا، والحلاوة علينا.
            </p>
          </div>
          <div className="relative mt-[47px] grid grid-cols-3 border-t border-white/25 [&>div]:py-7 [&>div]:ps-7 [&>div]:pb-6 [&>div+div]:border-r [&>div+div]:border-white/25 max-[600px]:mt-[27px] max-[600px]:grid-cols-1 max-[600px]:[&>div]:border-b max-[600px]:[&>div]:border-white/25 max-[600px]:[&>div]:ps-0 max-[600px]:[&>div]:py-[19px] max-[600px]:[&>div+div]:border-r-0 max-[600px]:[&>div:last-child]:border-b-0">
            <div id="about" className="max-[600px]:col-span-2">
              <Image
                src={siteConfig.logo}
                alt="Rinkle"
                width={170}
                height={57}
                className="h-auto w-[170px] max-[600px]:w-[150px]"
              />
              <p className="mt-3.5 text-[15px] text-white">
                حلا مصنوع بحب، للحظات تستاهل.
              </p>
            </div>
            <div>
              <h2 className="mb-5 text-[17px] font-extrabold max-[600px]:text-[15px]">
                اكتشفي رينكل
              </h2>
              <nav
                className="flex flex-col items-start gap-3"
                aria-label="روابط المتجر"
              >
                {siteConfig.footerNavigation.map((item) => (
                  <Link
                    className={footerLinkClass}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h2 className="mb-5 text-[17px] font-extrabold max-[600px]:text-[15px]">
                خلّينا على تواصل
              </h2>
              <nav
                className="flex flex-col items-start gap-3"
                aria-label="وسائل التواصل"
              >
                <a
                  className={footerLinkClass}
                  href={siteConfig.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  واتساب
                </a>
                <a
                  className={footerLinkClass}
                  href={siteConfig.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  إنستغرام
                </a>
              </nav>
            </div>
          </div>
          <div className="relative flex min-h-[68px] items-center justify-between gap-5 border-t border-white/25 text-xs text-white max-[600px]:flex-col max-[600px]:items-start max-[600px]:justify-center max-[600px]:gap-1 max-[600px]:py-[18px]">
            <span>
              © {new Date().getFullYear()} رينكل بيكري. كل الحقوق محفوظة.
            </span>
            <span>مخبوزات تخلّي الأيام أحلى.</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
