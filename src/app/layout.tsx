import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rinkle Bakery | رينكل بيكري",
  description: "متجر رينكل بيكري للحلويات والمخبوزات",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth motion-reduce:scroll-auto">
      <body className="bg-page font-sans text-ink">{children}</body>
    </html>
  );
}
