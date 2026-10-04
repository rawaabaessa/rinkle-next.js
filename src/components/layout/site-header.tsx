"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { categories, categoryHref } from "@/features/catalog/categories";

const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const iconButtonClass = `size-11 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-[#f1e8e2] motion-reduce:transition-none max-[600px]:h-[42px] max-[600px]:w-[39px] [&_svg]:size-[21px] ${focusClass}`;
const popoverClass = "absolute inset-x-0 top-full border-y border-line bg-surface shadow-[0_16px_26px_#301c1714]";

export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const matches = categories.filter((category) => category.name.includes(query.trim()));

  return (
    <header className="relative z-40 bg-transparent" id="top">
      <Container className="flex min-h-[92px] items-center justify-between gap-7 max-[900px]:min-h-[78px] max-[600px]:min-h-[70px] max-[600px]:gap-2">
        <Link href="/" className={`block w-[170px] shrink-0 max-[1100px]:w-[150px] max-[600px]:w-[134px] ${focusClass}`} aria-label="رينكل بيكري، الرئيسية">
          <Image src={siteConfig.logo} alt="شعار رينكل" width={176} height={59} priority className="block h-auto w-full" />
        </Link>
        <nav className="flex items-center gap-[clamp(20px,2.7vw,43px)] max-[1100px]:gap-[19px] max-[900px]:hidden" aria-label="التنقل الرئيسي">
          {siteConfig.navigation.map((item, index) => (
            <Link key={item.label} href={item.href} className={`relative py-3 text-[15px] font-semibold text-[#574640] transition-colors hover:text-accent motion-reduce:transition-none max-[1100px]:text-sm ${pathname === "/" && index === 0 ? "text-accent after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:rounded-sm after:bg-accent" : ""} ${focusClass}`}>{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 max-[600px]:gap-0">
          <button className={`inline-flex ${iconButtonClass}`} type="button" aria-label={searchOpen ? "إغلاق البحث" : "فتح البحث"} aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setCartOpen(false); setMenuOpen(false); }}>{searchOpen ? <CloseIcon /> : <SearchIcon />}</button>
          <button className={`inline-flex ${iconButtonClass}`} type="button" aria-label={cartOpen ? "إغلاق السلة" : "فتح السلة"} aria-expanded={cartOpen} onClick={() => { setCartOpen(!cartOpen); setSearchOpen(false); setMenuOpen(false); }}><BagIcon /></button>
          <a href={siteConfig.contact.whatsapp} target="_blank" rel="noopener noreferrer" className={`ms-[11px] inline-flex min-h-[42px] items-center justify-center rounded-xl border border-line bg-white px-[19px] text-sm font-bold text-ink shadow-[0_3px_12px_#4c211207] transition-colors hover:border-[#d5b7a7] hover:bg-[#f4e9e2] motion-reduce:transition-none max-[1100px]:hidden ${focusClass}`}>تواصلي معنا</a>
          <button className={`hidden max-[900px]:inline-flex ${iconButtonClass}`} type="button" aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"} aria-expanded={menuOpen} onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); setCartOpen(false); }}>{menuOpen ? <CloseIcon /> : <MenuIcon />}</button>
        </div>
      </Container>
      {menuOpen && <nav className={popoverClass} aria-label="قائمة الجوال"><Container className="flex flex-col py-2">{siteConfig.navigation.map((item) => <Link className={`block border-b border-line py-3 text-ink ${focusClass}`} key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}<a className={`block py-3 text-ink ${focusClass}`} href={siteConfig.contact.whatsapp} target="_blank" rel="noopener noreferrer">تواصلي معنا</a></Container></nav>}
      {searchOpen && <div className={popoverClass}><Container className="py-[25px] pb-[27px]"><label htmlFor="category-search" className="mb-[11px] block text-[17px] font-bold">ابحثي عن قسمك المفضل</label><div className="flex h-[52px] max-w-[620px] items-center gap-3 rounded-xl border border-[#d9c7bb] bg-white px-4 focus-within:border-accent [&_svg]:size-5 [&_svg]:text-accent"><SearchIcon /><input className="w-full border-0 bg-transparent text-ink outline-none" id="category-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="كوكيز، كيك، ورق عنب..." autoFocus /></div>{query.trim() && <div className="mt-3.5 flex flex-wrap gap-2" aria-live="polite">{matches.length ? matches.map((category) => <Link className={`rounded-full border border-line px-4 py-2 text-ink hover:border-accent hover:text-accent ${focusClass}`} key={category.slug} href={categoryHref(category.slug)} prefetch={false} onClick={() => setSearchOpen(false)}>{category.name}</Link>) : <p className="mb-4 text-muted">ما لقينا قسم بهذا الاسم. جرّبي اسم ثاني.</p>}</div>}</Container></div>}
      {cartOpen && <div className={popoverClass}><Container className="py-[25px] pb-[27px]"><strong className="mb-[11px] block text-[17px] font-bold">سلتك تنتظر أول اختيار</strong><p className="mb-4 text-muted">تصفّحي الأقسام واختاري اللي يعجبك.</p><Link className={`inline-flex min-h-[42px] items-center rounded-[10px] bg-cocoa px-[18px] text-white ${focusClass}`} href="/#categories" onClick={() => setCartOpen(false)}>شوفي الأقسام</Link></Container></div>}
    </header>
  );
}
