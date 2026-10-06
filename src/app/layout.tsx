import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rinkle Bakery | رينكل بيكري",
  description: "متجر رينكل بيكري للحلويات والمخبوزات",
};

export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth scroll-pb-[calc(6rem+env(safe-area-inset-bottom))] motion-reduce:scroll-auto md:scroll-pb-0">
      <body className="bg-page font-sans text-ink">{children}</body>
    </html>
  );
}
