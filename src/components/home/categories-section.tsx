import { ArrowLeftIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { categories } from "@/features/catalog/categories";
import { CategoryCard } from "@/features/catalog/category-card";

export function CategoriesSection() {
  return (
    <section id="categories" className="scroll-mt-[30px] bg-surface py-[104px] pb-[120px] max-[600px]:py-[76px] max-[600px]:pb-[85px]" aria-labelledby="categories-title">
      <Container className="grid grid-cols-[.7fr_1.3fr] items-center gap-[clamp(50px,8vw,116px)] max-[900px]:grid-cols-1 max-[900px]:gap-[34px]">
        <div>
          <span className="text-sm font-bold text-accent">الطعم اللي على بالك</span>
          <h2 id="categories-title" className="mt-5 text-[clamp(42px,4vw,60px)] leading-[1.3] font-extrabold tracking-[-.02em] max-[600px]:mt-[13px] max-[600px]:text-[41px]">إيش ودّك<br className="max-[900px]:hidden" /><span className="text-cocoa shadow-[inset_0_-.13em_0_#f1d2c4]">فيه اليوم؟</span></h2>
          <p className="mt-[23px] max-w-[390px] text-[17px] leading-[1.9] text-muted max-[900px]:max-w-[600px] max-[600px]:mt-[15px] max-[600px]:text-base">من كوكيز آخر الليل إلى بوكس يفرّح شخص غالي. اختاري القسم اللي يشبه مزاجك اليوم.</p>
          <div className="mt-[43px] flex items-center gap-[11px] text-sm font-semibold text-[#8d6c5e] max-[900px]:mt-[23px] max-[600px]:text-[13px]"><span className="grid size-9 place-items-center rounded-full border border-[#dfc9bc] text-accent [&_svg]:size-[17px]"><ArrowLeftIcon /></span> خمسة أقسام مليانة أشياء لذيذة</div>
        </div>
        <div className="grid grid-cols-2 gap-4 max-[600px]:gap-2.5">{categories.map((category, index) => <CategoryCard key={category.slug} category={category} featured={index === 4} />)}</div>
      </Container>
    </section>
  );
}
