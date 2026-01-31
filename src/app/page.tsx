import Hero from "@/components/sections/Hero";
import CastingStatus from "@/components/sections/CastingStatus";
import Portfolio from "@/components/sections/Portfolio";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Features from "@/components/sections/Features";
import Newsletter from "@/components/sections/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Portfolio />
      {/* Unified Background Section */}
      <div className="bg-linear-to-br from-purple-100 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <WhyChooseUs />
        <Features />
        <CastingStatus />
      </div>
      <Newsletter key="homepage-newsletter" />
    </>
  );
}
