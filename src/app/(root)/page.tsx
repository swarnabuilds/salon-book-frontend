
import { BannerSection } from "@/components/home/BannerSection";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { ServiceCategories } from "@/components/ServiceCategories";
export default function Home() {
  return (
     <div className="flex flex-col min-h-screen">
      <BannerSection />
      <FeaturedServices />
      <ServiceCategories />
      <WhyChooseUsSection />

    </div>
  );
}
