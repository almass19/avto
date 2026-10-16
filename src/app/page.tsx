import { CheckFlow } from "@/components/check-form/CheckFlow";
import { Faq, SiteFooter } from "@/components/landing/Faq";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { HowItWorks, Positioning, PriceBlock } from "@/components/landing/LandingSections";
import { ReportShowcase } from "@/components/landing/ReportShowcase";

export default function Home() {
  return (
    <>
      <CheckFlow preview={<HeroPreview />}>
        <ReportShowcase />
        <Positioning />
        <HowItWorks />
        <PriceBlock />
        <Faq />
      </CheckFlow>
      <SiteFooter />
    </>
  );
}
