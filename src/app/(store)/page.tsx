import { CategoriesSection } from "@/components/home/categories-section";
import { FaqSection } from "@/components/home/faq-section";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { OccasionsSection } from "@/components/home/occasions-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <OccasionsSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FaqSection />
    </>
  );
}
