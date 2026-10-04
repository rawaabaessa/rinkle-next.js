import { PlusIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/container";
import { frequentlyAskedQuestions } from "@/content/home";

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-[30px] bg-surface pt-28 pb-[132px] max-[600px]:pt-[78px] max-[600px]:pb-[92px]" aria-labelledby="faq-title">
      <Container className="grid grid-cols-[.78fr_1.22fr] items-start gap-[clamp(55px,8vw,130px)] max-[900px]:grid-cols-1 max-[900px]:gap-[38px] max-[600px]:gap-[27px]">
        <div><span className="text-sm font-bold text-accent">قبل ما تطلبين</span><h2 id="faq-title" className="mt-5 text-[clamp(42px,4vw,60px)] leading-[1.3] font-extrabold tracking-[-.02em] max-[600px]:mt-[13px] max-[600px]:text-[41px]">أسئلة يمكن<br className="max-[900px]:hidden" />تدور ببالك</h2><p className="mt-[23px] max-w-[390px] text-[17px] leading-[1.9] text-muted max-[600px]:mt-[15px] max-[600px]:text-base">جمعنا لك أهم الإجابات عشان تطلبين وأنتِ مرتاحة.</p></div>
        <div className="border-t border-line">{frequentlyAskedQuestions.map((item) => <details className="group border-b border-line" key={item.question}><summary className="flex min-h-[79px] cursor-pointer list-none items-center justify-between gap-[18px] text-lg font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent max-[600px]:min-h-[70px] max-[600px]:text-base [&::-webkit-details-marker]:hidden">{item.question}<span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-cocoa transition-[transform,background] group-open:rotate-45 group-open:bg-[#f2e5de] motion-reduce:transition-none [&_svg]:size-4"><PlusIcon /></span></summary><p className="-mt-px mb-[25px] max-w-[560px] ps-12 text-base leading-[1.9] text-muted max-[600px]:text-sm">{item.answer}</p></details>)}</div>
      </Container>
    </section>
  );
}
