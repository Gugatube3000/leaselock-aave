import { Wallet, CheckCircle, Send, Star } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Deposit USDC",
    description: "Tenant deposits stablecoins into a smart contract escrow. No banks, no forex fees.",
    step: "01",
  },
  {
    icon: CheckCircle,
    title: "Confirm Lease",
    description: "Once the lease terms are agreed upon, the tenant confirms the arrangement on-chain.",
    step: "02",
  },
  {
    icon: Send,
    title: "Release Funds",
    description: "Funds are released to the landlord. Tenant receives a yield bonus back.",
    step: "03",
  },
  {
    icon: Star,
    title: "Rate Landlord",
    description: "After the lease, rate your landlord 1–5 stars. Ratings are permanent and on-chain.",
    step: "04",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How <span className="text-gradient">RentEscrow</span> works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Four simple steps from deposit to rating — fully on-chain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="glass rounded-xl p-6 relative group hover:glow-border transition-all duration-300"
            >
              <div className="font-mono text-xs text-muted-foreground mb-4">{step.step}</div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
