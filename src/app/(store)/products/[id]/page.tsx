import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductDetails } from "@/features/catalog/product-details";
import { ProductGallery } from "@/features/catalog/product-gallery";
import { productCategories, products } from "@/features/catalog/products";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return products.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((item) => item.id === id);
  return product
    ? {
        title: `${product.name} | رينكل بيكري`,
        description: product.details ?? product.description,
      }
    : { title: "المنتج غير موجود | رينكل بيكري" };
}

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params;

  const product = products.find((item) => item.id === id);

  if (!product) notFound();

  const categoryName =
    productCategories.find((item) => item.slug === product.category)?.name ??
    "المنتجات";

  const linkClass =
    "rounded hover:text-cocoa focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

  return (
    <Container className="pt-5 pb-12 sm:pt-8 sm:pb-20">
      <nav
        aria-label="مسار التنقل"
        className="mb-7 text-xs text-muted sm:mb-10 sm:text-sm"
      >
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <li>
            <Link href="/" className={linkClass}>
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/products" className={linkClass}>
              المنتجات
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/products?category=${product.category}`}
              className={linkClass}
            >
              {categoryName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-cocoa">
            {product.name}
          </li>
        </ol>
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-12 xl:gap-20">
        <ProductGallery key={`gallery-${product.id}`} product={product} />
        <ProductDetails
          key={product.id}
          product={product}
          categoryName={categoryName}
        />
      </div>
    </Container>
  );
}
