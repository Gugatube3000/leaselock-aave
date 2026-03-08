import {
  ArrowRight,
  Shield,
  TimerReset,
  TrendingUp,
  UserRoundCheck,
  Wallet,
  Globe,
  Lock,
  Star,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── Scroll-reveal hook ─────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ─── Animated counter ───────────────────────────────────────────────────

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const { ref, visible } = useReveal();

  useEffect(() => {
    if (!visible) return;
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, target]);

  return <span ref={ref}>{value}{suffix}</span>;
}

// ─── Section wrapper with staggered reveal ──────────────────────────────

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `all 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Flow step data ─────────────────────────────────────────────────────

const flowSteps = [
  {
    icon: Wallet,
    title: "1. Deposit Rent",
    description: "Tenant deposits rent (ETH) into a new smart contract escrow. No banks, no middlemen.",
    color: "text-blue-400",
    bg: "bg-blue-950/30 border-blue-800/30",
  },
  {
    icon: Lock,
    title: "2. Aave V3 Yield",
    description: "ETH is automatically wrapped to WETH and supplied to Aave's lending pool, earning real DeFi yield from day one.",
    color: "text-emerald-400",
    bg: "bg-emerald-950/30 border-emerald-800/30",
  },
  {
    icon: CheckCircle2,
    title: "3. Confirm Lease",
    description: "Tenant verifies the property and confirms the lease on-chain. Landlord gets transparency, student gets protection.",
    color: "text-amber-400",
    bg: "bg-amber-950/30 border-amber-800/30",
  },
  {
    icon: Zap,
    title: "4. Release or Refund",
    description: "Principal goes to the landlord; any Aave yield earned goes to the tenant as a bonus. Or tenant gets a full refund before deadline.",
    color: "text-violet-400",
    bg: "bg-violet-950/30 border-violet-800/30",
  },
  {
    icon: Star,
    title: "5. Rate Landlord",
    description: "After completion, tenant rates the landlord (1-5). Ratings live on-chain forever, helping future renters worldwide.",
    color: "text-pink-400",
    bg: "bg-pink-950/30 border-pink-800/30",
  },
];

const benefits = [
  {
    title: "Trustless Security",
    description: "Escrow funds are governed by auditable smart contracts on Ethereum. Neither party can access funds unfairly.",
    icon: Shield,
    gradient: "from-blue-600/20 to-transparent",
  },
  {
    title: "Cross-Border Transparency",
    description: "International students and families can verify every escrow action via public blockchain explorers, no matter the country.",
    icon: Globe,
    gradient: "from-emerald-600/20 to-transparent",
  },
  {
    title: "Automatic Refund Protection",
    description: "If the landlord never confirms, the tenant can recover their full deposit plus any Aave yield after the deadline passes.",
    icon: TimerReset,
    gradient: "from-amber-600/20 to-transparent",
  },
  {
    title: "Real DeFi Yield",
    description: "Deposited rent earns real yield from Aave V3's lending pool — not simulated. The tenant keeps the yield as a bonus.",
    icon: TrendingUp,
    gradient: "from-violet-600/20 to-transparent",
  },
  {
    title: "On-Chain Reputation",
    description: "Landlord ratings are stored permanently on the blockchain, creating a trustworthy, censorship-resistant reputation layer.",
    icon: UserRoundCheck,
    gradient: "from-pink-600/20 to-transparent",
  },
  {
    title: "Zero Gas Overhead",
    description: "Everything runs on Sepolia testnet for hackathon demos — no real ETH needed. Switch to mainnet when ready for production.",
    icon: Zap,
    gradient: "from-sky-600/20 to-transparent",
  },
];

// ─── Main Component ─────────────────────────────────────────────────────

const ExplanationPage = () => {
  // Floating orb animation
  const [orbPos, setOrbPos] = useState({ x: 50, y: 30 });
  useEffect(() => {
    const interval = setInterval(() => {
      setOrbPos({ x: 30 + Math.random() * 40, y: 20 + Math.random() * 30 });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-0 -mt-8 md:-mt-12">
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden -mx-4 md:-mx-8 px-4 md:px-8">
        {/* Dynamic background orb */}
        <div
          className="absolute rounded-full blur-[120px] opacity-20"
          style={{
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(16,185,129,0.5), rgba(59,130,246,0.3), transparent)",
            left: `${orbPos.x}%`,
            top: `${orbPos.y}%`,
            transform: "translate(-50%, -50%)",
            transition: "left 3s ease, top 3s ease",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_60%)]" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-emerald-700/40 bg-emerald-950/30 backdrop-blur-sm mb-8">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-200 font-medium">Built for international students renting across borders</span>
            </div>
          </RevealSection>

          <RevealSection delay={100}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05] text-slate-100">
              Rent with
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                blockchain trust.
              </span>
              <br />
              <span className="text-slate-400">Earn while you wait.</span>
            </h1>
          </RevealSection>

          <RevealSection delay={200}>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              LeaseLock uses Ethereum smart contract escrow + <strong className="text-emerald-300">Aave V3 real yield</strong> to
              protect international students' rent deposits and let them earn while the lease is pending.
            </p>
          </RevealSection>

          <RevealSection delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/40">
                <Link to="/dashboard">
                  <Shield className="w-5 h-5" />
                  Open Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 font-semibold border-slate-600 hover:bg-slate-800">
                <a href="#how-it-works">How it Works ↓</a>
              </Button>
            </div>
          </RevealSection>

          {/* Animated stats */}
          <RevealSection delay={400}>
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-mono text-emerald-400">
                  <AnimatedNumber target={0} suffix="%" />
                </div>
                <div className="text-sm text-slate-400 mt-1">Transfer Fees</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-mono text-blue-400">
                  <AnimatedNumber target={3} suffix="%" />
                </div>
                <div className="text-sm text-slate-400 mt-1">Aave V3 APY</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-mono text-amber-400">
                  5★
                </div>
                <div className="text-sm text-slate-400 mt-1">Rating System</div>
              </div>
            </div>
          </RevealSection>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-slate-500">Scroll to learn more</span>
          <span className="text-slate-400">↓</span>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section id="how-it-works" className="py-20 -mx-4 md:-mx-8 px-4 md:px-8">
        <RevealSection>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400 mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              Five steps to <span className="text-emerald-400">secure rent</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From deposit to completion, everything happens on-chain with full transparency.
            </p>
          </div>
        </RevealSection>

        <div className="max-w-3xl mx-auto space-y-6">
          {flowSteps.map((step, i) => (
            <RevealSection key={step.title} delay={i * 120}>
              <Card className={`border ${step.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
                <CardContent className="flex items-start gap-5 p-6">
                  <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800/80 ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${step.color} mb-1`}>{step.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════ AAVE YIELD EXPLAINER ═══════════════════ */}
      <section className="py-20 -mx-4 md:-mx-8 px-4 md:px-8">
        <RevealSection>
          <div className="max-w-4xl mx-auto rounded-2xl border border-emerald-700/40 bg-gradient-to-br from-emerald-950/60 via-slate-900/80 to-slate-900/90 p-8 md:p-12 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400 mb-3">Powered by Aave V3</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-6">
                Your rent earns <span className="text-emerald-400">real yield</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <RevealSection delay={100} className="rounded-xl border border-emerald-800/30 bg-emerald-950/40 p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-emerald-300 mb-1">ETH → WETH</div>
                  <p className="text-xs text-emerald-400/80">Auto-wrapped on deposit</p>
                </RevealSection>
                <RevealSection delay={200} className="rounded-xl border border-emerald-800/30 bg-emerald-950/40 p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-emerald-300 mb-1">→ aWETH</div>
                  <p className="text-xs text-emerald-400/80">Supplied to Aave lending pool</p>
                </RevealSection>
                <RevealSection delay={300} className="rounded-xl border border-emerald-800/30 bg-emerald-950/40 p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-emerald-300 mb-1">~3.5% APY</div>
                  <p className="text-xs text-emerald-400/80">Real yield accrues every block</p>
                </RevealSection>
              </div>

              <p className="text-slate-300 leading-relaxed">
                When funds are released, the <strong className="text-white">landlord receives the original deposit</strong> and the{" "}
                <strong className="text-emerald-300">tenant keeps all the yield earned</strong> as a bonus. If the tenant requests a refund,
                they get back <strong className="text-white">principal + yield</strong>.
              </p>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ═══════════════════ BENEFITS GRID ═══════════════════ */}
      <section className="py-20 -mx-4 md:-mx-8 px-4 md:px-8">
        <RevealSection>
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400 mb-3">Why LeaseLock</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
              Built for <span className="text-blue-400">trust</span>
            </h2>
          </div>
        </RevealSection>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {benefits.map((b, i) => (
            <RevealSection key={b.title} delay={i * 80}>
              <Card className="h-full border-slate-700/60 bg-slate-900/60 backdrop-blur-sm hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${b.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <CardContent className="relative p-6 space-y-3">
                  <b.icon className="w-8 h-8 text-slate-400 group-hover:text-slate-100 transition-colors" />
                  <h3 className="text-lg font-semibold text-slate-100">{b.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{b.description}</p>
                </CardContent>
              </Card>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="py-20 -mx-4 md:-mx-8 px-4 md:px-8">
        <RevealSection>
          <div className="max-w-3xl mx-auto text-center rounded-2xl border border-slate-600/80 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
                Ready to try it?
              </h2>
              <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                Use <strong className="text-violet-300">Demo Mode</strong> to test with fake wallet addresses, or connect MetaMask on Sepolia testnet with free ETH.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8 py-6 font-semibold gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Link to="/dashboard">
                    <Shield className="w-5 h-5" />
                    Launch Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>
    </div>
  );
};

export default ExplanationPage;
