import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import EscrowDashboard from "@/components/EscrowDashboard";
import LandlordRating from "@/components/LandlordRating";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <EscrowDashboard />
      <LandlordRating />
      <Footer />
    </div>
  );
};

export default Index;
