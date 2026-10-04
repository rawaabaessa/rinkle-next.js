import { Container } from "@/components/ui/container";
import { orderingSteps } from "@/content/home";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-surface pt-[38px] pb-[116px] max-[600px]:pt-0 max-[600px]:pb-20" aria-labelledby="steps-title">
      <Container>
        <div className="relative overflow-hidden rounded-[30px] bg-[#321d19] px-[61px] pt-[54px] pb-12 text-white max-[600px]:rounded-[23px] max-[600px]:px-6 max-[600px]:pt-[34px] max-[600px]:pb-[23px]">
          <span aria-hidden="true" className="pointer-events-none absolute -top-[155px] -left-[120px] size-[330px] rounded-full border border-[#ffffff18] bg-[#ffffff0a]" />
          <div className="relative"><span className="text-sm font-bold text-[#e3aa91]">طلبك علينا سهل</span><h2 id="steps-title" className="mt-[11px] text-[clamp(31px,3.2vw,45px)] leading-[1.35] font-extrabold max-[600px]:text-[30px]">كيف تطلبين من رينكل؟</h2><p className="mt-[9px] text-base text-[#d8c6bf] max-[600px]:text-sm">ثلاث خطوات، وتكون الحلاوة في طريقها لك.</p></div>
          <div className="relative mt-[47px] grid grid-cols-3 border-t border-[#ffffff35] max-[600px]:mt-[27px] max-[600px]:grid-cols-1">{orderingSteps.map((step, index) => <div className={`py-7 ps-7 pb-1 max-[600px]:border-b max-[600px]:border-[#ffffff29] max-[600px]:p-0 max-[600px]:py-[19px] ${index > 0 ? "border-r border-[#ffffff29] max-[600px]:border-r-0" : ""} ${index === orderingSteps.length - 1 ? "max-[600px]:border-b-0" : ""}`} key={step.number}><span className="text-2xl font-bold text-[#e6b497] max-[600px]:text-xl">{step.number}</span><h3 className="mt-[19px] text-[19px] font-bold max-[600px]:mt-[7px] max-[600px]:text-lg">{step.title}</h3><p className="mt-[9px] max-w-[250px] text-sm leading-[1.8] text-[#d8c6bf] max-[600px]:mt-[3px] max-[600px]:max-w-none">{step.description}</p></div>)}</div>
        </div>
      </Container>
    </section>
  );
}
