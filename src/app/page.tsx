import Navbar from "@/components/landing-page/navbar";
import HeroSection from "@/components/landing-page/hero";
import TrustBar from "@/components/landing-page/trust-bar";
import HowItWorks from "@/components/landing-page/how-it-works";
import Showcase from "@/components/landing-page/showcase";
import Features from "@/components/landing-page/features";
import Pricing from "@/components/landing-page/pricing";
import Testimonials from "@/components/landing-page/testimonials";
import CTA from "@/components/landing-page/cta";
import Footer from "@/components/landing-page/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <HowItWorks />
      <Showcase />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
