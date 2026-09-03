import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { ClassesSection } from "@/components/landing/classes-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TutorPreviewSection } from "@/components/landing/tutor-preview-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ClassesSection />
        <FeaturesSection />
        <TutorPreviewSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
