"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BagIcon, GridIcon, HomeIcon, UserIcon } from "@/components/ui/IconSet";


import { useCart } from "@/features/cart/useCart";

import { useCustomer } from "@/features/account/accountStore";
import { useCustomerLogin } from "@/features/account/components/CustomerProvider";
import { useRouter } from "next/navigation";

const itemClass = "flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-xs transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";
const iconClass = "grid h-8 w-14 place-items-center rounded-full";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count } = useCart();
  const [categoriesVisible, setCategoriesVisible] = useState(false);
  const customer = useCustomer();
  const login = useCustomerLogin();
  const router = useRouter();
  const accountActive = pathname.startsWith("/account");
  const categoriesActive = pathname.startsWith("/products") || (pathname === "/" && categoriesVisible);
  const homeActive = pathname === "/" && !categoriesActive;
  const cartActive = pathname === "/cart" || pathname === "/checkout";

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
            aria-current={homeActive ? "location" : undefined}
            className={`${itemClass} ${homeActive ? "font-bold text-cocoa" : "text-muted hover:text-cocoa"}`}
          >
            <span className={`${iconClass} ${homeActive ? "bg-cocoa/10" : ""}`}><HomeIcon className="size-5" /></span>
            الرئيسية
          </Link>
          <Link
            href="/products"
            aria-current={categoriesActive ? "location" : undefined}
            className={`${itemClass} ${categoriesActive ? "font-bold text-cocoa" : "text-muted hover:text-cocoa"}`}
          >
            <span className={`${iconClass} ${categoriesActive ? "bg-cocoa/10" : ""}`}><GridIcon className="size-5" /></span>
            المنتجات
          </Link>
          <Link
            href="/cart"
            aria-current={cartActive ? "location" : undefined}
            aria-label={`السلة، ${count} قطعة`}
            className={`${itemClass} ${cartActive ? "font-bold text-cocoa" : "text-muted hover:text-cocoa"}`}
          >
            <span className={`${iconClass} ${cartActive ? "bg-cocoa/10" : ""}`}><span className="relative"><BagIcon className="size-5" />{count > 0 && <span className="absolute -top-2 -end-3 grid min-w-4 h-4 place-items-center rounded-full bg-cocoa px-1 text-[9px] text-white">{count}</span>}</span></span>
            السلة
          </Link>
          <button
            type="button"
            onClick={() => customer ? router.push("/account") : login()}
            aria-current={accountActive ? "page" : undefined}
            className={`${itemClass} cursor-pointer ${accountActive ? "font-bold text-cocoa" : "text-muted hover:text-cocoa"}`}
          >
            <span className={`${iconClass} ${accountActive ? "bg-cocoa/10" : ""}`}><UserIcon className="size-5" /></span>
            حسابي
          </button>
        </div>
      </nav>


    </>
  );
}
