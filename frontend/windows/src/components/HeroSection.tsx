import { Shield, ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(174_72%_51%/0.08),transparent_60%)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-glow/5 blur-[120px]" />

      <div className="container relative z-10 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Built for international students</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          Pay rent with
          <br />
          <span className="text-gradient">stablecoins.</span>
          <br />
          <span className="text-muted-foreground">Skip the fees.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          RentEscrow uses blockchain escrow to protect your deposit, rate your landlord, 
          and avoid international transfer fees — all with stablecoins.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 py-6 font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-glow)]">
            <Shield className="w-5 h-5" />
            Start Escrow
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6 font-semibold border-border hover:bg-surface-hover">
            How it Works
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
          {[
            { value: "0%", label: "Transfer Fees" },
            { value: "USDC", label: "Stablecoin" },
            { value: "5★", label: "Rating System" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold font-mono text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
