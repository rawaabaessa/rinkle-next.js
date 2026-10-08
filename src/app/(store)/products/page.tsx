import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { ProductCatalog } from "@/features/catalog/product-catalog";
import ProductCatalogSkeleton from "@/features/catalog/product-catalog-skeleton";

export const metadata: Metadata = {
  title: "المنتجات | رينكل بيكري",
  description:
    "اكتشفي تشكيلة رينكل من الكب كيك والكوكيز وكيك الكوكيز وورق العنب وضيافة المناسبات.",
};

export default function ProductsPage() {
  return (
    <Container className="pt-5 pb-16 sm:pt-8 sm:pb-24">
      <nav aria-label="مسار التنقل" className="text-sm text-muted mb-4">
        <ol className="flex items-center gap-3">
          <li>
            <Link
              href="/"
              className="rounded hover:text-cocoa focus-visible:outline-2 focus-visible:outline-accent"
            >
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true" className="text-line">
            /
          </li>
          <li aria-current="page" className="font-medium text-cocoa">
            المنتجات
          </li>
        </ol>
      </nav>

      <Suspense fallback={<ProductCatalogSkeleton />}>
        <ProductCatalog />
      </Suspense>
    </Container>
  );
}
