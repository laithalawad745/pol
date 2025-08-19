import Hero from "../components/Hero";
import Info from "../components/Info";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      {/* Navbar */}
      
      {/* المحتوى الرئيسي */}
      <div className="bg-[#1a0a33] overflow-hidden">
        {/* Hero section مع padding مناسب للـ fixed navbar */}
        <div id="hero-section" className="pt-[72px]">
          <Hero />
        </div>
        <div id="info-section">
          <Info />
        </div>
        <div id="pricing-section">
          <Pricing />
        </div>
        <Footer />
      </div>
    </>
  );
}