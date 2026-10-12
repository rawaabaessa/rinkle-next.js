import { CategoriesSection } from "@/components/home/Categories";
import { FaqSection } from "@/components/home/FaqSection";
import { HeroSection } from "@/components/home/Hero";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { OccasionsSection } from "@/components/home/OccasionsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <OccasionsSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FaqSection />
      <TestimonialsSection />
    </>
  );
}
