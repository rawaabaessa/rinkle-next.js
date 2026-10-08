import { ArrowLeftIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { categories } from "@/features/catalog/categories";
import { CategoryCard } from "@/features/catalog/category-card";
import Link from "next/link";

export function CategoriesSection() {
  return (
    <section
      id="categories"
      className="scroll-mt-8 bg-surface py-20 lg:py-28"
      aria-labelledby="categories-title"
    >
      <Container className="grid items-center gap-10 lg:grid-cols-5 lg:gap-16">
        <div className="lg:col-span-2">
          <h2
            id="categories-title"
            className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl xl:text-6xl"
          >
            إيش ودّك <br className="hidden lg:block" />
            <span className="text-cocoa">فيه اليوم؟</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-loose text-muted lg:max-w-sm">
            اختاري اللي نفسك فيه اليوم وابدئي طلبك.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-muted lg:mt-10">
            خمسة أقسام مليانة أشياء لذيذة
            <Link href="/products" aria-label="تصفّحي جميع المنتجات">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-accent hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
              </span>{" "}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              category={category}
              featured={category.slug === "gift-boxes"}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
