import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { categoryHref, type Category } from "./categories";

export function CategoryCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  return (
    <Link
      href={categoryHref(category.slug)}
      prefetch={false}
      className={`group relative isolate flex min-h-56 items-end overflow-hidden rounded-2xl bg-cocoa p-4 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:rounded-3xl sm:p-6 ${featured ? "col-span-2 sm:min-h-52" : "sm:min-h-60"}`}
      aria-label={`تصفحي قسم ${category.name}`}
    >
      {/* صورة تغطي خلفية البطاقة بالكامل */}
      <Image
        src={category.image}
        alt=""
        fill
        sizes={featured
          ? "(max-width: 1023px) 100vw, 60vw"
          : "(max-width: 1023px) 50vw, 30vw"}
        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
      />

      {/* طبقة سوداء خفيفة، وتدرج أغمق خلف النص لزيادة الوضوح */}
      <span aria-hidden="true" className="absolute inset-0 bg-black/30" />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* المحتوى فوق الصورة والتغبيش */}
      <span className="relative z-10 flex w-full flex-wrap items-end justify-between gap-3 sm:flex-nowrap">
        <span className="min-w-0">
          <span className="block text-2xl leading-snug font-bold sm:text-3xl">
            {category.name}
          </span>
          <span className="mt-2 block text-sm leading-relaxed text-white/90">
            {category.note}
          </span>
        </span>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-full border border-white/40 bg-white/10 transition-colors duration-200 group-hover:bg-white group-hover:text-cocoa group-focus-visible:bg-white group-focus-visible:text-cocoa motion-reduce:transition-none"
          aria-hidden="true"
        >
          <ArrowLeftIcon className="size-5" />
        </span>
      </span>
    </Link>
  );
}
