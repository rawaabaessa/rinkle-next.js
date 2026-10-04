import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { categoryHref, type Category } from "./categories";

export function CategoryCard({ category, featured = false }: { category: Category; featured?: boolean }) {
  return (
    <Link href={categoryHref(category.slug)} prefetch={false} className={`group relative isolate block min-h-[186px] overflow-hidden rounded-[20px] bg-[#cbb2a0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent max-[900px]:min-h-[230px] max-[600px]:min-h-[178px] max-[600px]:rounded-[15px] ${featured ? "col-span-2 min-h-[170px] max-[900px]:min-h-[220px] max-[600px]:min-h-[180px]" : ""}`} aria-label={`تصفحي قسم ${category.name}`}>
      <Image src={category.image} alt={category.imageAlt} fill sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 28vw" className="object-cover transition-transform duration-[350ms] group-hover:scale-[1.06] motion-reduce:transition-none" />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,#20120fb8_100%)]" aria-hidden="true" />
      <span className="absolute right-5 bottom-[19px] z-10 text-[23px] leading-[1.15] font-extrabold text-white shadow-none [text-shadow:0_2px_6px_#0007] max-[600px]:right-[13px] max-[600px]:bottom-3.5 max-[600px]:text-xl">{category.name}<small className="mt-[5px] block text-xs leading-[1.35] font-medium max-[600px]:max-w-[130px] max-[600px]:text-[10px]">{category.note}</small></span>
      <span className="absolute bottom-[18px] left-[17px] z-10 grid size-[39px] place-items-center rounded-full bg-white text-cocoa transition-transform group-hover:-translate-x-1 motion-reduce:transition-none max-[600px]:bottom-3 max-[600px]:left-3 max-[600px]:size-8 [&_svg]:size-[18px] max-[600px]:[&_svg]:size-[15px]" aria-hidden="true"><ArrowLeftIcon /></span>
    </Link>
  );
}
