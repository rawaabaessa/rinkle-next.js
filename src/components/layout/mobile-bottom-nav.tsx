"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BagIcon, CloseIcon, GridIcon, HomeIcon, UserIcon } from "@/components/ui/icons";

import { CartContents } from "@/features/cart/cart-contents";
import { useCart } from "@/features/cart/use-cart";

type MobilePanel = "cart" | "account" | null;

const itemClass = "flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";
const iconClass = "grid h-8 w-14 place-items-center rounded-full";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const [panel, setPanel] = useState<MobilePanel>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const categoriesActive = pathname.startsWith("/products") || (pathname === "/" && categoriesVisible);
  const homeActive = pathname === "/" && !categoriesActive;

  // يتغيّر التحديد مع التمرير، وكذلك عند الوصول للأقسام من أي رابط.
  useEffect(() => {
    const categories = document.getElementById("categories");
    if (!categories) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCategoriesVisible(entry.isIntersecting),
      { rootMargin: "-15% 0px -35% 0px" },
    );
    observer.observe(categories);
    return () => observer.disconnect();
  }, [pathname]);

  // الحوار الأصلي يدعم حصر التركيز، الإغلاق بزر Escape، وإعادة التركيز للزر.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
  }, [panel]);

  useEffect(() => {
    if (!panel) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previousOverflow; };
  }, [panel]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialogRef.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      {/* ارتفاع الشريط والمساحة الآمنة لهما مساحة محجوزة في تخطيط المتجر */}
      <nav
        aria-label="التنقل السفلي للجوال"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          <Link
            href="/#top"
            aria-current={!panel && homeActive ? "location" : undefined}
            className={`${itemClass} ${!panel && homeActive ? "font-bold text-cocoa" : "text-muted hover:text-cocoa"}`}
          >
            <span className={`${iconClass} ${!panel && homeActive ? "bg-cocoa/10" : ""}`}><HomeIcon className="size-5" /></span>
            الرئيسية
          </Link>
          <Link
            href="/products"
            aria-current={!panel && categoriesActive ? "location" : undefined}
            className={`${itemClass} ${!panel && categoriesActive ? "font-bold text-cocoa" : "text-muted hover:text-cocoa"}`}
          >
            <span className={`${iconClass} ${!panel && categoriesActive ? "bg-cocoa/10" : ""}`}><GridIcon className="size-5" /></span>
            المنتجات
          </Link>
          <button
            type="button"
            onClick={() => setPanel("cart")}
            aria-haspopup="dialog"
            aria-expanded={panel === "cart"}
            aria-controls="mobile-nav-panel"
            aria-label={`السلة، ${count} قطعة`}
            className={`${itemClass} cursor-pointer ${panel === "cart" ? "font-bold text-cocoa" : "text-muted hover:text-cocoa"}`}
          >
            <span className={`${iconClass} ${panel === "cart" ? "bg-cocoa/10" : ""}`}><span className="relative"><BagIcon className="size-5" />{count > 0 && <span className="absolute -top-2 -end-3 grid min-w-4 h-4 place-items-center rounded-full bg-cocoa px-1 text-[9px] text-white">{count}</span>}</span></span>
            السلة
          </button>
          <button
            type="button"
            onClick={() => setPanel("account")}
            aria-haspopup="dialog"
            aria-expanded={panel === "account"}
            aria-controls="mobile-nav-panel"
            className={`${itemClass} cursor-pointer ${panel === "account" ? "font-bold text-cocoa" : "text-muted hover:text-cocoa"}`}
          >
            <span className={`${iconClass} ${panel === "account" ? "bg-cocoa/10" : ""}`}><UserIcon className="size-5" /></span>
            حسابي
          </button>
        </div>
      </nav>

      <dialog
        ref={dialogRef}
        id="mobile-nav-panel"
        aria-labelledby="mobile-panel-title"
        aria-describedby={panel === "account" ? "mobile-panel-description" : undefined}
        onClose={() => setPanel(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-3xl bg-surface p-0 text-ink backdrop:bg-black/40 md:hidden"
      >
        <div className="px-6 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-4">
            <h2 id="mobile-panel-title" className="text-xl font-bold">
              {panel === "cart" ? "سلة التسوق" : "الحساب الشخصي"}
            </h2>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="إغلاق" className="grid size-11 cursor-pointer place-items-center rounded-full bg-page text-cocoa focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <CloseIcon className="size-5" />
            </button>
          </div>
          {panel === "cart" ? <CartContents onNavigate={() => dialogRef.current?.close()} /> : <div className="mx-auto max-w-sm py-8 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-cocoa/5 text-cocoa"><UserIcon className="size-7" /></span>
            <h3 className="mt-5 text-lg font-bold">حسابك الشخصي قريبًا</h3>
            <p id="mobile-panel-description" className="mt-3 text-base leading-loose text-muted">قريبًا تقدرين تسجّلين دخولك وتتابعين طلباتك من هنا.</p>
            <Link href="/products" onClick={() => dialogRef.current?.close()} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-cocoa px-8 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">تصفّحي المنتجات</Link>
          </div>}
        </div>
      </dialog>
    </>
  );
}
