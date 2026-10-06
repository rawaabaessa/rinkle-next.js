import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
      <a className="absolute -top-24 right-3.5 z-[100] rounded-[9px] bg-ink px-4 py-2.5 text-white focus:top-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" href="#main-content">تخطي إلى المحتوى</a>
      <div className="bg-page bg-[radial-gradient(ellipse_54%_80%_at_27%_48%,#f3e8e5_0%,#fbf8f5_96%)] bg-[length:100%_750px] bg-top bg-no-repeat max-[600px]:bg-[radial-gradient(ellipse_80%_70%_at_50%_40%,#f5e6df_0%,#fbf8f5_100%)] max-[600px]:bg-[length:100%_900px]">
        <SiteHeader />
        <main id="main-content">{children}</main>
      </div>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
