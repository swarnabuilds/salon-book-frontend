
import { BannerSection } from "@/components/home/BannerSection";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
export default function Home() {
  return (
     <div className="flex flex-col min-h-screen">
      <BannerSection />
      <FeaturedServices />
      <WhyChooseUsSection />

    </div>
  );
}
